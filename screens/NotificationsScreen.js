import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';
import Notification from '../Components/Notification';
import { showToast } from '../utils/ToastConfig';
import LoadingOverlay from '../Components/LoadingOverlay';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useApp();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await ApiService.getNotifications();
      
      if (response.success) {
        setNotifications(response.notifications || []);
      } else {
        showToast.error('Error', response.message || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Error is already handled by ApiService
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'alert' && notification.articleUrl) {
      navigation.navigate('URLSearch', { initialUrl: notification.articleUrl });
    } else if (notification.type === 'update') {
      // For feature updates, we could show a modal or navigate to a specific screen
      showToast.info('Feature Update', notification.message);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Error is already handled by ApiService
    }
  };

  const dismissNotification = async (notificationId) => {
    try {
      await ApiService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(item => item.id !== notificationId)
      );
      
      showToast.info('Notification Dismissed', 'Notification has been removed');
    } catch (error) {
      console.error('Error dismissing notification:', error);
      // Error is already handled by ApiService
    }
  };

  const renderNotification = ({ item }) => (
    <Notification 
      notification={item}
      onPress={handleNotificationPress}
      onDismiss={dismissNotification}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={60} color="#8f8e8e" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        We'll notify you about fake news alerts and important updates
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={!isLoading ? renderEmptyComponent : null}
      />
      
      <LoadingOverlay visible={isLoading} message="Loading notifications..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c2120',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2b2f2e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8f8e8e',
    fontFamily: 'Poppins',
    textAlign: 'center',
    lineHeight: 22,
  },
});
