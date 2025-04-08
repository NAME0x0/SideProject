import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';
import { showToast } from '../utils/ToastConfig';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { updateUser } = useApp();

  const validateInputs = () => {
    if (!firstName.trim()) {
      showToast.validationError('First name is required');
      return false;
    }
    
    if (!lastName.trim()) {
      showToast.validationError('Last name is required');
      return false;
    }
    
    if (!email.trim()) {
      showToast.validationError('Email is required');
      return false;
    }
    
    if (!password.trim()) {
      showToast.validationError('Password is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.validationError('Please enter a valid email address');
      return false;
    }
    
    // Password strength validation
    if (password.length < 8) {
      showToast.validationError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      const response = await ApiService.register({
        firstName,
        lastName,
        email,
        password
      });
      
      if (response.success) {
        updateUser(response.user);
        navigation.replace('Main');
      } else {
        showToast.error('Registration Failed', response.message || 'Unable to create account');
      }
    } catch (error) {
      // Error is already handled by ApiService
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>REALITY CHECK</Text>
        <Text style={styles.tagline}>No Cap. Just Facts.</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>FIRST NAME</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#8f8e8e"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isLoading}
          />
        </View>
        
        <Text style={styles.title}>LAST NAME</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#8f8e8e"
            value={lastName}
            onChangeText={setLastName}
            editable={!isLoading}
          />
        </View>
        
        <Text style={styles.title}>EMAIL (OPTIONAL)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8f8e8e"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>
        
        <Text style={styles.title}>PASSWORD</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8f8e8e"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#8f8e8e" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>REGISTER</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>IF YOU'RE A USER</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          disabled={isLoading}
        >
          <Text style={styles.signInText}>SIGN IN!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1c2120',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3168d8',
    fontFamily: 'Poppins',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2f2e',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: '#3168d8',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#8f8e8e',
    fontFamily: 'Poppins',
    fontSize: 14,
    marginBottom: 5,
  },
  signInText: {
    color: '#3168d8',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
});
