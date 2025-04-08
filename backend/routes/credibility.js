const express = require('express');
const router = express.Router();
const credibilityService = require('../services/CredibilityService');
const scraperRoutes = require('./scraper');

// Route to check URL credibility
router.post('/check-url', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'URL is required' 
            });
        }
        
        // First scrape the article content
        const scraperResponse = await fetch(`${req.protocol}://${req.get('host')}/api/scraper/scrape-article`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        const scraperData = await scraperResponse.json();
        
        if (!scraperData.success) {
            return res.status(400).json({ 
                success: false, 
                error: 'Failed to scrape article content',
                details: scraperData.error
            });
        }
        
        const article = scraperData.data;
        
        // Extract domain for source
        let source = article.domain;
        
        // Calculate credibility score
        const credibilityScore = await credibilityService.calculateCredibilityScore({
            title: article.title,
            content: article.content,
            source: source
        });
        
        // Get credibility label
        const credibilityLabel = credibilityService.getCredibilityLabel(credibilityScore);
        
        // Get analysis details
        const analysisDetails = credibilityService.getAnalysisDetails({
            title: article.title,
            content: article.content,
            source: source
        });
        
        // Prepare response
        const result = {
            title: article.title,
            content: article.content.substring(0, 300) + '...', // Truncate for response
            source: source,
            url: url,
            credibilityScore: credibilityScore,
            credibilityLabel: credibilityLabel,
            analysisDetails: analysisDetails,
            scrapedAt: article.scraped_at
        };
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in check-url route:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze URL credibility',
            details: error.message
        });
    }
});

// Route to check text credibility
router.post('/check-text', async (req, res) => {
    try {
        const { text, source } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                success: false, 
                error: 'Text content is required' 
            });
        }
        
        // Calculate credibility score
        const credibilityScore = await credibilityService.calculateCredibilityScore({
            title: '',
            content: text,
            source: source || 'unknown'
        });
        
        // Get credibility label
        const credibilityLabel = credibilityService.getCredibilityLabel(credibilityScore);
        
        // Get analysis details
        const analysisDetails = credibilityService.getAnalysisDetails({
            title: '',
            content: text,
            source: source || 'unknown'
        });
        
        // Prepare response
        const result = {
            content: text.substring(0, 300) + (text.length > 300 ? '...' : ''),
            source: source || 'unknown',
            credibilityScore: credibilityScore,
            credibilityLabel: credibilityLabel,
            analysisDetails: analysisDetails,
            analyzedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in check-text route:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze text credibility',
            details: error.message
        });
    }
});

// Route to check batch of URLs
router.post('/batch-check', async (req, res) => {
    try {
        const { urls } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Valid array of URLs is required' 
            });
        }
        
        // Limit batch size to prevent abuse
        if (urls.length > 10) {
            return res.status(400).json({ 
                success: false, 
                error: 'Batch size limited to 10 URLs maximum' 
            });
        }
        
        // First scrape all articles
        const scraperResponse = await fetch(`${req.protocol}://${req.get('host')}/api/scraper/batch-scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urls })
        });
        
        const scraperData = await scraperResponse.json();
        
        if (!scraperData.success) {
            return res.status(400).json({ 
                success: false, 
                error: 'Failed to scrape articles',
                details: scraperData.error
            });
        }
        
        // Process each scraped article
        const results = [];
        
        for (const item of scraperData.results) {
            if (!item.success) {
                results.push({
                    url: item.url,
                    success: false,
                    error: item.error
                });
                continue;
            }
            
            const article = item.data;
            let source = article.domain;
            
            // Calculate credibility score
            const credibilityScore = await credibilityService.calculateCredibilityScore({
                title: article.title,
                content: article.content,
                source: source
            });
            
            // Get credibility label
            const credibilityLabel = credibilityService.getCredibilityLabel(credibilityScore);
            
            // Prepare result
            results.push({
                url: item.url,
                success: true,
                data: {
                    title: article.title,
                    source: source,
                    credibilityScore: credibilityScore,
                    credibilityLabel: credibilityLabel.text
                }
            });
        }
        
        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Error in batch-check route:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze URLs',
            details: error.message
        });
    }
});

// Route to check if a claim has been fact-checked
router.post('/fact-check', async (req, res) => {
    try {
        const { claim } = req.body;
        
        if (!claim) {
            return res.status(400).json({ 
                success: false, 
                error: 'Claim text is required' 
            });
        }
        
        // Check if claim has been fact-checked
        const factCheckResult = await credibilityService.checkFactCheckedClaim(claim);
        
        res.json({
            success: true,
            data: factCheckResult
        });
    } catch (error) {
        console.error('Error in fact-check route:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check claim',
            details: error.message
        });
    }
});

module.exports = router;
