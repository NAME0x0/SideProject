# Reality Check - Fake News Detection Application

## Overview
Reality Check is a comprehensive application designed to help users verify the credibility of news articles and combat misinformation. The application allows users to input URLs or search for news articles, which are then analyzed using advanced algorithms to determine their credibility.

## Features
- User authentication and profile management
- Web scraping of news articles from various sources
- Advanced credibility analysis algorithm
- Trending news feed with verification capabilities
- Saved articles management
- Notifications for fake news alerts and updates
- Dark mode support
- Responsive design for various device sizes

## Tech Stack
- **Frontend**: React Native (mobile app) and React.js (web app)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Web Scraping**: Python with BeautifulSoup, newspaper3k, and goose3
- **Authentication**: JWT-based authentication
- **Deployment**: Docker support for easy deployment

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- MongoDB
- npm or yarn

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/NAME0x0/SideProject.git
cd SideProject
```

2. Install JavaScript dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your MongoDB connection string and JWT secret.

5. Download NLTK data:
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

## Running the Application

### Using the start script
The easiest way to start the application is to use the provided start script:

```bash
chmod +x start.sh
./start.sh
```

This will start both the backend server and the frontend application.

### Manual startup

1. Start the backend server:
```bash
node server.js
```

2. In a separate terminal, start the frontend application:
```bash
npm start
```

## Testing
To run the comprehensive test suite:

```bash
chmod +x run_tests.sh
./run_tests.sh
```

This will test all aspects of the application including:
- API functionality
- Web scraper performance
- Credibility analysis algorithm
- UI components

## Project Structure

```
SideProject/
├── App.js                  # Main React Native entry point
├── backend/                # Backend server code
│   ├── routes/             # API routes
│   └── web_scraper.py      # Python web scraping module
├── Components/             # Reusable UI components
├── context/                # React Context for state management
├── screens/                # Application screens
├── services/               # JavaScript services
│   ├── ApiService.js       # API communication
│   └── CredibilityService.js # Credibility analysis
├── utils/                  # Utility functions
├── server.js               # Express server entry point
├── requirements.txt        # Python dependencies
├── package.json            # JavaScript dependencies
└── start.sh                # Startup script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password

### Articles
- `GET /api/articles/trending` - Get trending news articles
- `GET /api/articles/saved` - Get user's saved articles
- `POST /api/articles/save` - Save an article
- `DELETE /api/articles/:id` - Remove a saved article

### Scraping and Verification
- `POST /api/scraper/url` - Scrape and analyze a specific URL
- `POST /api/scraper/batch` - Batch scrape multiple URLs
- `GET /api/credibility/:id` - Get credibility score for an article

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete a notification

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [React Native](https://reactnative.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/)
- [newspaper3k](https://newspaper.readthedocs.io/)
- [goose3](https://github.com/goose3/goose3)
