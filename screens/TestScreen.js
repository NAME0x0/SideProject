import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

// Test component to verify API connectivity and functionality
export default function TestComponent() {
  const [testResults, setTestResults] = useState({
    authTest: { status: 'pending', message: 'Not started' },
    scraperTest: { status: 'pending', message: 'Not started' },
    credibilityTest: { status: 'pending', message: 'Not started' },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    
    // Test authentication endpoints
    try {
      await testAuthEndpoints();
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        authTest: { 
          status: 'failed', 
          message: `Authentication test failed: ${error.message}` 
        }
      }));
    }
    
    // Test scraper endpoints
    try {
      await testScraperEndpoints();
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        scraperTest: { 
          status: 'failed', 
          message: `Scraper test failed: ${error.message}` 
        }
      }));
    }
    
    // Test credibility endpoints
    try {
      await testCredibilityEndpoints();
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        credibilityTest: { 
          status: 'failed', 
          message: `Credibility test failed: ${error.message}` 
        }
      }));
    }
    
    setIsLoading(false);
  };

  const testAuthEndpoints = async () => {
    setTestResults(prev => ({
      ...prev,
      authTest: { status: 'running', message: 'Testing authentication endpoints...' }
    }));
    
    // Test registration endpoint
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123'
    };
    
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      
      if (registerResponse.status === 201) {
        // Test login endpoint
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        
        if (loginResponse.status === 200) {
          setTestResults(prev => ({
            ...prev,
            authTest: { 
              status: 'passed', 
              message: 'Authentication endpoints working correctly' 
            }
          }));
        }
      }
    } catch (error) {
      throw new Error(`Auth test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testScraperEndpoints = async () => {
    setTestResults(prev => ({
      ...prev,
      scraperTest: { status: 'running', message: 'Testing scraper endpoints...' }
    }));
    
    try {
      // Test scraping a known reliable news source
      const testUrl = 'https://www.bbc.com/news';
      
      const scraperResponse = await axios.post(`${API_URL}/scraper/scrape-article`, {
        url: testUrl
      });
      
      if (scraperResponse.status === 200 && scraperResponse.data.success) {
        setTestResults(prev => ({
          ...prev,
          scraperTest: { 
            status: 'passed', 
            message: 'Scraper endpoints working correctly' 
          }
        }));
      } else {
        throw new Error('Scraper returned unsuccessful response');
      }
    } catch (error) {
      throw new Error(`Scraper test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testCredibilityEndpoints = async () => {
    setTestResults(prev => ({
      ...prev,
      credibilityTest: { status: 'running', message: 'Testing credibility endpoints...' }
    }));
    
    try {
      // Test credibility check with a sample text
      const testText = 'This is a test article about climate change. Scientists agree that human activities are causing global warming. The evidence is clear and well-documented in peer-reviewed studies.';
      
      const credibilityResponse = await axios.post(`${API_URL}/check-text`, {
        text: testText,
        source: 'test'
      });
      
      if (credibilityResponse.status === 200 && credibilityResponse.data.success) {
        setTestResults(prev => ({
          ...prev,
          credibilityTest: { 
            status: 'passed', 
            message: 'Credibility endpoints working correctly' 
          }
        }));
      } else {
        throw new Error('Credibility check returned unsuccessful response');
      }
    } catch (error) {
      throw new Error(`Credibility test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return '#4CAF50';
      case 'failed':
        return '#FF4842';
      case 'running':
        return '#FFC107';
      default:
        return '#8f8e8e';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Functionality Tests</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3168d8" />
          <Text style={styles.loadingText}>Running tests...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {Object.entries(testResults).map(([testName, result]) => (
            <View key={testName} style={styles.testItem}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(result.status) }]} />
              <View style={styles.testDetails}>
                <Text style={styles.testName}>
                  {testName.replace('Test', ' Test')}
                </Text>
                <Text style={styles.testMessage}>{result.message}</Text>
              </View>
            </View>
          ))}
          
          <Text style={styles.summary}>
            {Object.values(testResults).every(test => test.status === 'passed')
              ? 'All tests passed! The application is functioning correctly.'
              : 'Some tests failed. Please check the details above.'}
          </Text>
        </View>
      )}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  testItem: {
    flexDirection: 'row',
    backgroundColor: '#2b2f2e',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  testMessage: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  summary: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#2b2f2e',
    borderRadius: 8,
  },
});
