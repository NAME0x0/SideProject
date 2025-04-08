import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

// Custom toast configuration
export const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  info: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
  warning: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.warningToast]}>
      <Text style={styles.toastTitle}>{text1}</Text>
      {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
    </View>
  ),
};

// Helper functions for showing toast messages
export const showToast = {
  success: (title, message) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  error: (title, message) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  info: (title, message) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  warning: (title, message) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  networkError: () => {
    Toast.show({
      type: 'error',
      text1: 'Network Error',
      text2: 'Please check your internet connection and try again.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  serverError: () => {
    Toast.show({
      type: 'error',
      text1: 'Server Error',
      text2: 'Something went wrong on our end. Please try again later.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  authError: () => {
    Toast.show({
      type: 'error',
      text1: 'Authentication Error',
      text2: 'Please log in again to continue.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  },
  validationError: (message) => {
    Toast.show({
      type: 'warning',
      text1: 'Validation Error',
      text2: message || 'Please check your input and try again.',
      position: 'bottom',
      visibilityTime: 4000,
      autoHide: true,
    });
  }
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: '5%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#4CAF50',
  },
  errorToast: {
    backgroundColor: '#FF4842',
  },
  infoToast: {
    backgroundColor: '#3168d8',
  },
  warningToast: {
    backgroundColor: '#FFC107',
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  toastMessage: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default toastConfig;
