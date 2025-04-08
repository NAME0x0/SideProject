const express = require('express');
const router = express.Router();
const pool = require('../../dbConfig');
const bcrypt = require('bcrypt');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }
        const emailCheck = await pool.query('SELECT * FROM users_t WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO users_t (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id';
        const values = [firstName, lastName, email, hashedPassword];
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Registration successful', userId: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const query = 'SELECT id, first_name, last_name, email, password FROM users_t WHERE email = $1';
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            delete user.password;
            res.status(200).json({ message: 'Login successful', user });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        // Get user from database
        const userQuery = 'SELECT id, password FROM users_t WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = userResult.rows[0];
        
        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password in database
        const updateQuery = 'UPDATE users_t SET password = $1 WHERE id = $2';
        await pool.query(updateQuery, [hashedPassword, userId]);
        
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Password change failed', error: error.message });
    }
});

// Update profile endpoint
router.post('/update-profile', async (req, res) => {
    try {
        const { userId, firstName, lastName, email } = req.body;
        
        if (!userId || !firstName || !lastName || !email) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        
        // Check if email is already in use by another user
        const emailCheckQuery = 'SELECT id FROM users_t WHERE email = $1 AND id != $2';
        const emailCheckResult = await pool.query(emailCheckQuery, [email, userId]);
        
        if (emailCheckResult.rows.length > 0) {
            return res.status(409).json({ message: 'Email is already in use by another account' });
        }
        
        // Update user profile
        const updateQuery = 'UPDATE users_t SET first_name = $1, last_name = $2, email = $3 WHERE id = $4 RETURNING id, first_name, last_name, email';
        const result = await pool.query(updateQuery, [firstName, lastName, email, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
});

// Get user profile endpoint
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = 'SELECT id, first_name, last_name, email FROM users_t WHERE id = $1';
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});

module.exports = router;
