const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Cache setup
const CACHE_DIR = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Utility function to create MD5 hash
const createHash = (text) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(text).digest('hex');
};

// Utility function to check cache
const checkCache = (url) => {
  const hash = createHash(url);
  const cachePath = path.join(CACHE_DIR, `${hash}.json`);
  
  if (fs.existsSync(cachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const cacheTime = new Date(data.timestamp);
      const now = new Date();
      
      // Cache valid for 24 hours
      if ((now - cacheTime) < 24 * 60 * 60 * 1000) {
        return data;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }
  
  return null;
};

// Utility function to save to cache
const saveToCache = (url, data) => {
  const hash = createHash(url);
  const cachePath = path.join(CACHE_DIR, `${hash}.json`);
  
  try {
    const cacheData = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(cachePath, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

// Fallback scraper using Node.js
const fallbackScrape = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('h1').first().text().trim() || $('title').text().trim();
    
    // Extract content
    let content = '';
    $('article, .article, .post, .content, .entry-content, p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 100) { // Only include substantial paragraphs
        content += text + '\n\n';
      }
    });
    
    // Extract date
    const dateText = $('time, .date, .published, .post-date, .entry-date').first().text().trim();
    
    // Extract author
    const author = $('.author, .byline, .entry-author').first().text().trim();
    
    // Extract images
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:')) {
        images.push(src);
      }
    });
    
    return {
      title,
      content,
      publish_date: dateText,
      authors: author ? [author] : [],
      images,
      top_image: images.length > 0 ? images[0] : null,
      source: new URL(url).hostname,
      url,
      success: true
    };
  } catch (error) {
    console.error('Fallback scraper error:', error);
    throw error;
  }
};

// Route to scrape article
router.post('/scrape-article', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      message: 'URL is required' 
    });
  }
  
  try {
    // Check cache first
    const cachedData = checkCache(url);
    if (cachedData) {
      console.log('Returning cached data for:', url);
      return res.json({
        ...cachedData,
        cached: true,
        success: true
      });
    }
    
    // Try Python scraper first
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '..', 'web_scraper.py')
    ]);
    
    let pythonData = '';
    let pythonError = '';
    let timeoutId;
    
    // Set timeout for Python process
    const pythonTimeout = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python scraper timed out'));
      }, 15000); // 15 seconds timeout
    });
    
    // Collect Python output
    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
    });
    
    // Handle Python process completion
    const pythonCompletion = new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        
        if (code === 0 && pythonData) {
          try {
            const result = JSON.parse(pythonData);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(`Python scraper failed with code ${code}: ${pythonError}`));
        }
      });
    });
    
    // Try to get data from Python scraper with timeout
    let articleData;
    try {
      // Send URL to Python process
      pythonProcess.stdin.write(url);
      pythonProcess.stdin.end();
      
      // Wait for Python result or timeout
      articleData = await Promise.race([pythonCompletion, pythonTimeout]);
    } catch (pythonError) {
      console.log('Python scraper failed, using fallback:', pythonError.message);
      
      // Use Node.js fallback scraper
      articleData = await fallbackScrape(url);
    }
    
    // Save to cache
    if (articleData && articleData.success !== false) {
      saveToCache(url, articleData);
    }
    
    return res.json({
      ...articleData,
      success: true
    });
    
  } catch (error) {
    console.error('Scraper error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to scrape article',
      url
    });
  }
});

// Route to scrape multiple articles
router.post('/scrape-batch', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid array of URLs is required'
    });
  }
  
  try {
    // Limit batch size
    const batchUrls = urls.slice(0, 10); // Max 10 URLs at once
    
    // Process URLs in parallel
    const results = await Promise.all(
      batchUrls.map(async (url) => {
        try {
          // Check cache first
          const cachedData = checkCache(url);
          if (cachedData) {
            return {
              ...cachedData,
              cached: true,
              success: true
            };
          }
          
          // Use fallback scraper directly for batch processing
          const articleData = await fallbackScrape(url);
          
          // Save to cache
          saveToCache(url, articleData);
          
          return {
            ...articleData,
            success: true
          };
        } catch (error) {
          return {
            success: false,
            message: error.message || 'Failed to scrape article',
            url
          };
        }
      })
    );
    
    return res.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Batch scraper error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process batch scraping request'
    });
  }
});

// Route to clear cache
router.post('/clear-cache', (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
    
    return res.json({
      success: true,
      message: `Cleared ${files.length} cached items`
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear cache'
    });
  }
});

module.exports = router;
