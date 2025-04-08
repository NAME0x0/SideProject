const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./dbConfig');
const path = require('path');
const { spawn } = require('child_process');

// Import routes
const authRoutes = require('./backend/routes/auth');
const scraperRoutes = require('./backend/routes/scraper');
const credibilityRoutes = require('./backend/routes/credibility');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api', credibilityRoutes);

// Check if Python is installed and required packages are available
const checkPythonSetup = () => {
  console.log('Checking Python setup...');
  
  const pythonProcess = spawn('python3', ['-c', 'import nltk, bs4, requests; print("Python dependencies available")']);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python check: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python check error: ${data}`);
    console.log('Installing required Python packages...');
    
    // Install required packages if missing
    const installProcess = spawn('pip3', ['install', 'nltk', 'beautifulsoup4', 'requests']);
    
    installProcess.stdout.on('data', (data) => {
      console.log(`Package installation: ${data}`);
    });
    
    installProcess.stderr.on('data', (data) => {
      console.error(`Package installation error: ${data}`);
    });
  });
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users_t (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create saved_articles table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_articles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users_t(id),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        url VARCHAR(255) NOT NULL,
        source VARCHAR(100),
        credibility_score INTEGER,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Check Python setup
  checkPythonSetup();
  
  // Initialize database
  await initializeDatabase();
});

module.exports = app;
