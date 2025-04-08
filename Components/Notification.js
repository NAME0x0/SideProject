import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const Notification = ({ notification, onPress, onDismiss }) => {
  // Determine icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'alert':
        return <Feather name="alert-triangle" size={24} color="#FF4842" />;
      case 'update':
        return <Feather name="bell" size={24} color="#FFC107" />;
      case 'info':
        return <Feather name="info" size={24} color="#3168d8" />;
      default:
        return <Feather name="bell" size={24} color="#FFC107" />;
    }
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} day ago`;
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'alert':
        return styles.alertNotification;
      case 'update':
        return styles.updateNotification;
      case 'info':
        return styles.infoNotification;
      default:
        return styles.updateNotification;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, getBackgroundColor()]} 
      onPress={() => onPress(notification)}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.timeAgo}>{getTimeAgo(notification.timestamp)}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
      
      {onDismiss && (
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => onDismiss(notification.id)}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertNotification: {
    backgroundColor: '#3a3a3a',
    borderLeftWidth: 5,
    borderLeftColor: '#FF4842',
  },
  updateNotification: {
    backgroundColor: '#3a3a3a',
    borderLeftWidth: 5,
    borderLeftColor: '#FFC107',
  },
  infoNotification: {
    backgroundColor: '#3a3a3a',
    borderLeftWidth: 5,
    borderLeftColor: '#3168d8',
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginBottom: 5,
  },
  timeAgo: {
    color: '#8f8e8e',
    fontSize: 12,
    fontFamily: 'Poppins',
    marginBottom: 5,
  },
  message: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  dismissButton: {
    padding: 5,
    justifyContent: 'center',
  },
});

export default Notification;
