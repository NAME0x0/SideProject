@echo off
echo Starting Reality Check Application...

REM Create a new terminal window for the backend server
start cmd /k "echo Starting backend server... && node server.js"

REM Wait for the server to start
timeout /t 5

REM Start the frontend application
echo Starting frontend application...
npm start

echo Reality Check Application is now running!
