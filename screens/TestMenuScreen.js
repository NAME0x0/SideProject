import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TestMenuScreen() {
  const navigation = useNavigation();

  const testItems = [
    {
      id: '1',
      title: 'API Functionality Tests',
      description: 'Test authentication, scraping, and credibility endpoints',
      screen: 'TestScreen'
    },
    {
      id: '2',
      title: 'URL Verification Test',
      description: 'Test the URL verification flow with sample articles',
      screen: 'URLSearch',
      params: { initialUrl: 'https://www.bbc.com/news' }
    },
    {
      id: '3',
      title: 'User Authentication Test',
      description: 'Test user registration, login, and profile management',
      screen: 'SignIn'
    },
    {
      id: '4',
      title: 'UI Components Test',
      description: 'Test various UI components and their interactions',
      screen: 'Main'
    }
  ];

  const renderTestItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.testItem}
      onPress={() => navigation.navigate(item.screen, item.params)}
    >
      <Text style={styles.testTitle}>{item.title}</Text>
      <Text style={styles.testDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reality Check App Tests</Text>
      <Text style={styles.subtitle}>Select a test to run</Text>
      
      <ScrollView style={styles.scrollView}>
        {testItems.map(renderTestItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c2120',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8f8e8e',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  testItem: {
    backgroundColor: '#2b2f2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
