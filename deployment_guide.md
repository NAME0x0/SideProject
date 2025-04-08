# Reality Check App - Deployment Guide

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Python 3.6 or higher with pip
- Expo CLI (for mobile app development)

## Server Deployment

### 1. Database Setup
1. Create a PostgreSQL database named `reality_check`
2. Configure database connection in `.env` file:
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=reality_check
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 2. Python Dependencies
Install required Python packages:
```bash
pip install nltk beautifulsoup4 requests
```

### 3. Node.js Dependencies
Install required Node.js packages:
```bash
npm install
```

### 4. Start the Server
```bash
npm run server
```
The server will run on port 3000 by default.

## Mobile App Deployment

### 1. Configure API URL
Update the API URL in `config.js` to point to your server:
```javascript
export const API_URL = 'http://your-server-ip:3000';
```

### 2. Build the App
For Expo development build:
```bash
expo build:android
expo build:ios
```

For production build:
```bash
eas build --platform android
eas build --platform ios
```

### 3. Deploy to App Stores
Follow the standard procedures to deploy to Google Play Store and Apple App Store.

## Web App Deployment

### 1. Build the Web App
```bash
npm run build
```

### 2. Deploy to Hosting Service
Deploy the contents of the `web-build` directory to your preferred hosting service (Netlify, Vercel, AWS, etc.).

## Testing the Deployment
1. Verify API endpoints are accessible
2. Test user authentication
3. Test article scraping and credibility checking
4. Verify all UI components are working correctly

## Maintenance
- Regularly update dependencies
- Monitor server logs for errors
- Backup database regularly
- Update credibility scoring algorithm as needed

## Troubleshooting
- If database connection fails, check database credentials and network connectivity
- If Python scraping fails, verify Python dependencies are installed correctly
- If API requests fail, check server logs and network connectivity
