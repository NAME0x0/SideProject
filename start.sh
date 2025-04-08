#!/bin/bash

# Reality Check App Startup Script
# This script sets up and starts both the backend server and frontend client

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Reality Check App Startup ===${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js v14 or higher.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed. Please install Python 3.6 or higher.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}Warning: PostgreSQL command line tools not found. Database operations may fail.${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > .env << EOL
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=reality_check
DB_PASSWORD=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=reality_check_secret_key_change_in_production

# API Keys (if applicable)
NEWS_API_KEY=
EOL
    echo -e "${YELLOW}Please update the .env file with your actual database credentials and API keys.${NC}"
fi

# Install Node.js dependencies
echo -e "${GREEN}Installing Node.js dependencies...${NC}"
npm install

# Install Python dependencies
echo -e "${GREEN}Installing Python dependencies...${NC}"
pip3 install -r requirements.txt

# Check if database exists and create if needed
if command -v psql &> /dev/null; then
    echo -e "${GREEN}Checking database...${NC}"
    source .env
    if ! psql -h $DB_HOST -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${YELLOW}Database '$DB_NAME' does not exist. Attempting to create...${NC}"
        psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Failed to create database. Please create it manually.${NC}"
        else
            echo -e "${GREEN}Database created successfully.${NC}"
        fi
    else
        echo -e "${GREEN}Database '$DB_NAME' already exists.${NC}"
    fi
fi

# Download NLTK data if needed
echo -e "${GREEN}Setting up NLTK data...${NC}"
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Start the application
echo -e "${GREEN}Starting Reality Check App...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"

# Check if concurrently is installed
if npm list -g concurrently | grep -q concurrently; then
    # Start both server and client concurrently
    npx concurrently "npm run server" "npm run client"
else
    # Start server in background and then client
    echo -e "${GREEN}Starting backend server...${NC}"
    npm run server &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    echo -e "${GREEN}Starting frontend client...${NC}"
    npm run client
    
    # Kill the server when client is stopped
    kill $SERVER_PID
fi

echo -e "${GREEN}Reality Check App has been stopped.${NC}"
