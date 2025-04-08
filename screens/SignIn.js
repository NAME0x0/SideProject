import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';
import { showToast } from '../utils/ToastConfig';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { updateUser } = useApp();

  const validateInputs = () => {
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
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      const response = await ApiService.login({ email, password });
      
      if (response.success) {
        updateUser(response.user);
        navigation.replace('Main');
      } else {
        showToast.error('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      // Error is already handled by ApiService
      console.error('Sign in error:', error);
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
        <Text style={styles.title}>USERNAME</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email / Phone"
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
          style={styles.forgotPassword}
          onPress={() => {
            showToast.info('Password Reset', 'Please contact support to reset your password');
          }}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.signInButton, isLoading && styles.disabledButton]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>NOT A USER?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          disabled={isLoading}
        >
          <Text style={styles.signUpText}>SIGN UP NOW!</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#8f8e8e',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#3168d8',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonText: {
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
  signUpText: {
    color: '#3168d8',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
});
