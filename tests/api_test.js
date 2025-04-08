const axios = require('axios');
const { API_URL } = require('../config');

// Test configuration
const TEST_URL = 'https://www.bbc.com/news';
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User'
};

// Helper function to log test results
const logResult = (testName, success, message) => {
  console.log(`\n${success ? '✅' : '❌'} ${testName}`);
  if (message) {
    console.log(`   ${message}`);
  }
};

// Test API endpoints
const runTests = async () => {
  try {
    console.log('🔍 Testing API functionality...\n');
    
    // Test 1: Authentication - Registration
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, TEST_USER);
      logResult('User Registration', true, `User created with ID: ${registerResponse.data.user.id}`);
    } catch (error) {
      logResult('User Registration', false, `Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 2: Authentication - Login
    let authToken;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      authToken = loginResponse.data.token;
      logResult('User Login', true, 'Successfully logged in and received token');
    } catch (error) {
      logResult('User Login', false, `Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 3: Web Scraping
    try {
      const scraperResponse = await axios.post(`${API_URL}/scraper/scrape-article`, {
        url: TEST_URL
      });
      
      if (scraperResponse.data.success) {
        logResult('Web Scraping', true, `Successfully scraped article: ${scraperResponse.data.title}`);
      } else {
        logResult('Web Scraping', false, `Failed to scrape article: ${scraperResponse.data.message}`);
      }
    } catch (error) {
      logResult('Web Scraping', false, `Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 4: Credibility Checking
    try {
      const credibilityResponse = await axios.post(`${API_URL}/check-credibility`, {
        url: TEST_URL,
        title: 'Test Article',
        content: 'This is a test article with factual information from a reliable source.'
      });
      
      if (credibilityResponse.data.success) {
        logResult('Credibility Checking', true, `Credibility score: ${credibilityResponse.data.score}%`);
      } else {
        logResult('Credibility Checking', false, `Failed to check credibility: ${credibilityResponse.data.message}`);
      }
    } catch (error) {
      logResult('Credibility Checking', false, `Error: ${error.response?.data?.message || error.message}`);
    }
    
    // Test 5: Saved Articles (requires authentication)
    if (authToken) {
      try {
        const saveResponse = await axios.post(`${API_URL}/saved-articles`, {
          title: 'Test Saved Article',
          url: TEST_URL,
          content: 'This is a test article to be saved.',
          credibilityScore: 85
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        logResult('Save Article', true, `Article saved with ID: ${saveResponse.data.id}`);
        
        // Get saved articles
        const savedArticlesResponse = await axios.get(`${API_URL}/saved-articles`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        logResult('Get Saved Articles', true, `Retrieved ${savedArticlesResponse.data.articles.length} saved articles`);
      } catch (error) {
        logResult('Saved Articles', false, `Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      logResult('Saved Articles', false, 'Skipped due to missing authentication token');
    }
    
    console.log('\n🔍 API Tests completed!');
    
  } catch (error) {
    console.error('Test execution error:', error);
  }
};

// Run the tests
runTests();
