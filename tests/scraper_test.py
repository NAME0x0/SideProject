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
