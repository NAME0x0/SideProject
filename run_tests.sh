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
