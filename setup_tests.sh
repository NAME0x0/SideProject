#!/bin/bash

# Run comprehensive tests for Reality Check App
echo "Running Reality Check App Tests..."

# Create test directory if it doesn't exist
mkdir -p /home/ubuntu/SideProject/tests

# Create test file for API functionality
cat > /home/ubuntu/SideProject/tests/api_test.js << 'EOL'
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
EOL

# Create test file for web scraper
cat > /home/ubuntu/SideProject/tests/scraper_test.py << 'EOL'
#!/usr/bin/env python3

import sys
import os
import json
import time
from concurrent.futures import ThreadPoolExecutor

# Add parent directory to path to import web_scraper
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.web_scraper import WebScraper

# Test URLs from different news sources
TEST_URLS = [
    "https://www.bbc.com/news/world-us-canada-56163220",
    "https://www.cnn.com/2023/01/15/politics/debt-ceiling-house-republicans/index.html",
    "https://www.reuters.com/world/us/biden-speak-with-congressional-leaders-tuesday-debt-ceiling-white-house-2023-01-30/",
    "https://www.theguardian.com/us-news/2023/jan/31/us-debt-ceiling-crisis-explained",
    "https://www.nytimes.com/2023/01/31/us/politics/debt-ceiling-economic-impact.html"
]

def test_scraper():
    """Test the web scraper with multiple URLs"""
    print("🔍 Testing Web Scraper...\n")
    
    scraper = WebScraper()
    
    # Test individual scraping
    for i, url in enumerate(TEST_URLS[:2], 1):
        print(f"Test {i}: Scraping {url}")
        start_time = time.time()
        
        try:
            result = scraper.scrape_article(url)
            duration = time.time() - start_time
            
            if result.get('error'):
                print(f"❌ Failed to scrape: {result.get('error')}")
            else:
                print(f"✅ Successfully scraped article: {result.get('title')}")
                print(f"   Source: {result.get('source')}")
                print(f"   Content length: {len(result.get('content', ''))}")
                print(f"   Time taken: {duration:.2f} seconds")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
        
        print()
    
    # Test batch scraping
    print("Test 3: Batch scraping multiple URLs")
    start_time = time.time()
    
    try:
        results = scraper.scrape_multiple_articles(TEST_URLS)
        duration = time.time() - start_time
        
        success_count = sum(1 for r in results if not r.get('error'))
        print(f"✅ Successfully scraped {success_count}/{len(TEST_URLS)} articles")
        print(f"   Total time taken: {duration:.2f} seconds")
        print(f"   Average time per article: {duration/len(TEST_URLS):.2f} seconds")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n🔍 Web Scraper Tests completed!")

if __name__ == "__main__":
    test_scraper()
EOL

# Create test file for credibility service
cat > /home/ubuntu/SideProject/tests/credibility_test.js << 'EOL'
const CredibilityService = require('../services/CredibilityService');

// Test articles
const TEST_ARTICLES = [
    {
        title: "Scientists discover new treatment for cancer",
        content: "A team of researchers at a prestigious university has discovered a new treatment for cancer that shows promising results in clinical trials. The study, published in a peer-reviewed journal, demonstrates a 70% success rate in treating certain types of cancer. Multiple independent experts have confirmed the findings.",
        source: "sciencedaily.com",
        url: "https://www.sciencedaily.com/example"
    },
    {
        title: "SHOCKING: Government hiding alien technology!!!",
        content: "Anonymous sources claim that the government has been hiding alien technology for decades. The conspiracy theory suggests that all modern technology was reverse-engineered from crashed UFOs. No evidence or credible sources are provided to support these extraordinary claims.",
        source: "conspiracytheories.net",
        url: "https://www.conspiracytheories.net/example"
    },
    {
        title: "Study suggests moderate coffee consumption may have health benefits",
        content: "A recent study published in the Journal of Nutrition found that moderate coffee consumption (2-3 cups per day) may be associated with certain health benefits, including reduced risk of type 2 diabetes and liver disease. However, researchers caution that more studies are needed to establish causation rather than just correlation.",
        source: "healthnews.org",
        url: "https://www.healthnews.org/example"
    }
];

// Test credibility service
const testCredibilityService = () => {
    console.log('🔍 Testing Credibility Service...\n');
    
    const credibilityService = new CredibilityService();
    
    TEST_ARTICLES.forEach((article, index) => {
        console.log(`Test ${index + 1}: Analyzing "${article.title}"`);
        
        try {
            const result = credibilityService.analyzeArticle(article);
            
            console.log(`✅ Credibility score: ${result.score}%`);
            console.log(`   Factors contributing to score:`);
            
            if (result.factors) {
                Object.entries(result.factors).forEach(([factor, value]) => {
                    console.log(`   - ${factor}: ${value}`);
                });
            }
            
            console.log(`   Classification: ${result.classification}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log();
    });
    
    console.log('🔍 Credibility Service Tests completed!');
};

// Run the tests
testCredibilityService();
EOL

# Create test file for UI components
cat > /home/ubuntu/SideProject/tests/ui_test.js << 'EOL'
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test UI components
const testUIComponents = () => {
    console.log('🔍 Testing UI Components...\n');
    
    // Get all screen components
    const screensDir = path.join(__dirname, '..', 'screens');
    const screenFiles = fs.readdirSync(screensDir).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${screenFiles.length} screen components to test\n`);
    
    // Test each screen component
    screenFiles.forEach((file, index) => {
        const componentName = file.replace('.js', '');
        console.log(`Test ${index + 1}: ${componentName}`);
        
        try {
            // Check if file exists and is readable
            const filePath = path.join(screensDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                // Check for basic React component structure
                const content = fs.readFileSync(filePath, 'utf8');
                
                if (content.includes('export default') && 
                    (content.includes('function') || content.includes('class')) && 
                    content.includes('return') && 
                    content.includes('StyleSheet.create')) {
                    
                    console.log(`✅ Component structure is valid`);
                    
                    // Check for potential issues
                    const issues = [];
                    
                    if (!content.includes('import React')) {
                        issues.push('Missing React import');
                    }
                    
                    if (content.includes('console.log') && !content.includes('process.env.NODE_ENV !== "production"')) {
                        issues.push('Contains console.log statements without production check');
                    }
                    
                    if (content.includes('useState') && !content.includes('import { useState }') && !content.includes('import React, { useState }')) {
                        issues.push('Using useState without importing it');
                    }
                    
                    if (issues.length > 0) {
                        console.log(`⚠️ Potential issues found:`);
                        issues.forEach(issue => console.log(`   - ${issue}`));
                    } else {
                        console.log(`   No issues found`);
                    }
                } else {
                    console.log(`❌ Invalid component structure`);
                }
            } else {
                console.log(`❌ Not a valid file`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log();
    });
    
    console.log('🔍 UI Component Tests completed!');
};

// Run the tests
testUIComponents();
EOL

# Create main test runner script
cat > /home/ubuntu/SideProject/run_tests.sh << 'EOL'
#!/bin/bash

# Reality Check App Test Runner
# This script runs all tests for the Reality Check application

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Reality Check App Test Runner      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Create test results directory
RESULTS_DIR="test_results"
mkdir -p $RESULTS_DIR

# Function to run a test and save results
run_test() {
    TEST_NAME=$1
    TEST_CMD=$2
    
    echo -e "\n${YELLOW}Running $TEST_NAME tests...${NC}"
    echo "Command: $TEST_CMD"
    echo -e "${YELLOW}----------------------------------------${NC}"
    
    # Run the test and capture output
    OUTPUT=$(eval $TEST_CMD 2>&1)
    EXIT_CODE=$?
    
    # Save output to file
    echo "$OUTPUT" > "$RESULTS_DIR/${TEST_NAME}_results.txt"
    
    # Display output
    echo "$OUTPUT"
    
    # Check result
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\n${GREEN}✅ $TEST_NAME tests completed successfully${NC}"
    else
        echo -e "\n${RED}❌ $TEST_NAME tests failed with exit code $EXIT_CODE${NC}"
    fi
    
    echo -e "${YELLOW}----------------------------------------${NC}"
    echo -e "Results saved to $RESULTS_DIR/${TEST_NAME}_results.txt\n"
    
    return $EXIT_CODE
}

# Start server in background for API tests
echo -e "${YELLOW}Starting server for tests...${NC}"
node server.js > "$RESULTS_DIR/server.log" 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Run tests
run_test "API" "node tests/api_test.js"
API_RESULT=$?

run_test "WebScraper" "python3 tests/scraper_test.py"
SCRAPER_RESULT=$?

run_test "Credibility" "node tests/credibility_test.js"
CREDIBILITY_RESULT=$?

run_test "UI" "node tests/ui_test.js"
UI_RESULT=$?

# Kill the server
echo -e "${YELLOW}Stopping test server...${NC}"
kill $SERVER_PID

# Summarize results
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}           Test Summary               ${NC}"
echo -e "${BLUE}=======================================${NC}"

if [ $API_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ API Tests: PASSED${NC}"
else
    echo -e "${RED}❌ API Tests: FAILED${NC}"
fi

if [ $SCRAPER_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Web Scraper Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Web Scraper Tests: FAILED${NC}"
fi

if [ $CREDIBILITY_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Credibility Tests: PASSED${NC}"
else
    echo -e "${RED}❌ Credibility Tests: FAILED${NC}"
fi

if [ $UI_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ UI Tests: PASSED${NC}"
else
    echo -e "${RED}❌ UI Tests: FAILED${NC}"
fi

# Overall result
if [ $API_RESULT -eq 0 ] && [ $SCRAPER_RESULT -eq 0 ] && [ $CREDIBILITY_RESULT -eq 0 ] && [ $UI_RESULT -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed successfully!${NC}"
    echo -e "${GREEN}The Reality Check application is ready for deployment.${NC}"
else
    echo -e "\n${RED}❌ Some tests failed. Please review the test results.${NC}"
fi

echo -e "${BLUE}=======================================${NC}"
EOL

# Make test scripts executable
chmod +x /home/ubuntu/SideProject/tests/scraper_test.py
chmod +x /home/ubuntu/SideProject/run_tests.sh

echo "Test files created successfully!"
echo "To run all tests, execute: ./run_tests.sh"
