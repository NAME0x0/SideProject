import requests
from bs4 import BeautifulSoup
import re
import json
import time
import concurrent.futures
import nltk
from nltk.tokenize import sent_tokenize
from newspaper import Article
from goose3 import Goose
import logging
import hashlib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('web_scraper')

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Cache directory setup
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache')
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

class WebScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        self.goose = Goose()
        self.timeout = 10  # seconds
        self.max_retries = 3
        self.retry_delay = 2  # seconds
        
        # Domain-specific selectors for common news sites
        self.domain_selectors = {
            'bbc.com': {
                'title': 'h1',
                'content': 'article',
                'date': '[data-component="timestamp"]',
                'author': '[data-component="byline"]'
            },
            'cnn.com': {
                'title': '.headline__text',
                'content': '.article__content',
                'date': '.timestamp',
                'author': '.byline__names'
            },
            'nytimes.com': {
                'title': 'h1',
                'content': 'section[name="articleBody"]',
                'date': 'time',
                'author': 'span[itemprop="name"]'
            },
            'reuters.com': {
                'title': 'h1',
                'content': '.article-body',
                'date': 'time',
                'author': '.author-name'
            },
            'theguardian.com': {
                'title': 'h1',
                'content': '.article-body-commercial-selector',
                'date': '.content__dateline time',
                'author': '.byline'
            },
            'washingtonpost.com': {
                'title': 'h1',
                'content': '.article-body',
                'date': '.display-date',
                'author': '.author-name'
            }
        }

    def _get_cache_path(self, url):
        """Generate a cache file path based on URL hash"""
        url_hash = hashlib.md5(url.encode()).hexdigest()
        return os.path.join(CACHE_DIR, f"{url_hash}.json")

    def _load_from_cache(self, url):
        """Load article data from cache if available and not expired"""
        cache_path = self._get_cache_path(url)
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'r') as f:
                    data = json.load(f)
                    # Check if cache is less than 24 hours old
                    if time.time() - data.get('timestamp', 0) < 86400:
                        logger.info(f"Loading from cache: {url}")
                        return data
            except Exception as e:
                logger.warning(f"Error loading from cache: {e}")
        return None

    def _save_to_cache(self, url, data):
        """Save article data to cache"""
        cache_path = self._get_cache_path(url)
        try:
            # Add timestamp for cache expiration
            data['timestamp'] = time.time()
            with open(cache_path, 'w') as f:
                json.dump(data, f)
            logger.info(f"Saved to cache: {url}")
        except Exception as e:
            logger.warning(f"Error saving to cache: {e}")

    def _get_domain(self, url):
        """Extract domain from URL"""
        match = re.search(r'https?://(?:www\.)?([^/]+)', url)
        if match:
            return match.group(1)
        return None

    def _get_selectors(self, url):
        """Get domain-specific selectors or default ones"""
        domain = self._get_domain(url)
        if domain:
            for key in self.domain_selectors:
                if key in domain:
                    return self.domain_selectors[key]
        return {
            'title': 'h1',
            'content': 'article, .article, .post, .content, .entry-content',
            'date': 'time, .date, .published, .post-date, .entry-date',
            'author': '.author, .byline, .entry-author'
        }

    def _fetch_with_retry(self, url):
        """Fetch URL content with retry mechanism"""
        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, headers=self.headers, timeout=self.timeout)
                response.raise_for_status()
                return response
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt+1}/{self.max_retries} failed: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                else:
                    raise

    def _extract_with_newspaper(self, url):
        """Extract article using newspaper3k library"""
        try:
            article = Article(url)
            article.download()
            article.parse()
            article.nlp()
            
            return {
                'title': article.title,
                'content': article.text,
                'summary': article.summary,
                'keywords': article.keywords,
                'authors': article.authors,
                'publish_date': article.publish_date.isoformat() if article.publish_date else None,
                'top_image': article.top_image,
                'images': list(article.images),
                'source': self._get_domain(url),
                'url': url
            }
        except Exception as e:
            logger.warning(f"Newspaper extraction failed: {e}")
            return None

    def _extract_with_goose(self, url):
        """Extract article using goose3 library"""
        try:
            article = self.goose.extract(url=url)
            return {
                'title': article.title,
                'content': article.cleaned_text,
                'summary': article.meta_description,
                'keywords': article.meta_keywords,
                'authors': [article.authors] if article.authors else [],
                'publish_date': article.publish_date,
                'top_image': article.top_image.src if article.top_image else None,
                'images': [img.src for img in article.images],
                'source': self._get_domain(url),
                'url': url
            }
        except Exception as e:
            logger.warning(f"Goose extraction failed: {e}")
            return None

    def _extract_with_bs4(self, url, html):
        """Extract article using BeautifulSoup with domain-specific selectors"""
        try:
            soup = BeautifulSoup(html, 'lxml')
            selectors = self._get_selectors(url)
            
            # Extract title
            title_elem = soup.select_one(selectors['title'])
            title = title_elem.get_text().strip() if title_elem else None
            
            # Extract content
            content_elem = soup.select_one(selectors['content'])
            content = content_elem.get_text().strip() if content_elem else None
            
            # Extract date
            date_elem = soup.select_one(selectors['date'])
            date = date_elem.get_text().strip() if date_elem else None
            
            # Extract author
            author_elem = soup.select_one(selectors['author'])
            author = author_elem.get_text().strip() if author_elem else None
            
            # Extract images
            images = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src and not src.startswith('data:'):
                    if not src.startswith('http'):
                        # Convert relative URLs to absolute
                        base_url = '/'.join(url.split('/')[:3])
                        src = f"{base_url}{src}" if src.startswith('/') else f"{base_url}/{src}"
                    images.append(src)
            
            # Generate summary from content
            summary = None
            if content:
                sentences = sent_tokenize(content)
                summary = ' '.join(sentences[:3]) if len(sentences) > 3 else content
            
            return {
                'title': title,
                'content': content,
                'summary': summary,
                'authors': [author] if author else [],
                'publish_date': date,
                'top_image': images[0] if images else None,
                'images': images,
                'source': self._get_domain(url),
                'url': url
            }
        except Exception as e:
            logger.warning(f"BeautifulSoup extraction failed: {e}")
            return None

    def scrape_article(self, url):
        """
        Scrape article content from URL using multiple methods
        Returns a dictionary with article data
        """
        # Check cache first
        cached_data = self._load_from_cache(url)
        if cached_data:
            return cached_data
        
        try:
            # Fetch the URL content
            response = self._fetch_with_retry(url)
            html = response.text
            
            # Try multiple extraction methods in parallel
            with concurrent.futures.ThreadPoolExecutor() as executor:
                newspaper_future = executor.submit(self._extract_with_newspaper, url)
                goose_future = executor.submit(self._extract_with_goose, url)
                bs4_future = executor.submit(self._extract_with_bs4, url, html)
                
                newspaper_result = newspaper_future.result()
                goose_result = goose_future.result()
                bs4_result = bs4_future.result()
            
            # Combine results, prioritizing more complete data
            result = {}
            
            # Start with the most likely complete result
            if newspaper_result and newspaper_result.get('content'):
                result = newspaper_result
            elif goose_result and goose_result.get('content'):
                result = goose_result
            elif bs4_result and bs4_result.get('content'):
                result = bs4_result
            else:
                # If all methods failed, return the best partial result
                for r in [newspaper_result, goose_result, bs4_result]:
                    if r:
                        if not result:
                            result = r
                        elif len(r.get('content', '')) > len(result.get('content', '')):
                            result = r
            
            # If we have a result, cache it
            if result and result.get('content'):
                self._save_to_cache(url, result)
                return result
            
            raise Exception("Failed to extract article content with all methods")
            
        except Exception as e:
            logger.error(f"Error scraping article: {e}")
            return {
                'error': str(e),
                'url': url,
                'success': False
            }

    def scrape_multiple_articles(self, urls):
        """
        Scrape multiple articles in parallel
        Returns a list of article data dictionaries
        """
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_url = {executor.submit(self.scrape_article, url): url for url in urls}
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    data = future.result()
                    results.append(data)
                except Exception as e:
                    logger.error(f"Error processing {url}: {e}")
                    results.append({
                        'error': str(e),
                        'url': url,
                        'success': False
                    })
        return results

# Example usage
if __name__ == "__main__":
    scraper = WebScraper()
    url = "https://www.bbc.com/news/world-us-canada-56163220"
    result = scraper.scrape_article(url)
    print(json.dumps(result, indent=2))
