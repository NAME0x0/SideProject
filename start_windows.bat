@echo off
echo Starting Reality Check Application...

REM Create a new terminal window for the Python web scraper server
start cmd /k "echo Starting Python web scraper... && cd backend && python -m http.server 5001"

REM Create a new terminal window for the backend server
start cmd /k "echo Starting backend server... && node server.js"

REM Wait for the servers to start
echo Waiting for servers to start...
timeout /t 10

REM Start the frontend application
echo Starting frontend application...
npm start

echo Reality Check Application is now running!
