const CredibilityService = require('../services/CredibilityService');

// Test articles
const TEST_ARTICLES = [
    {
        title: "Scientists discover new treatment for cancer",
        content: "A team of researchers at a prestigious university has discovered a new treatment for cancer that shows promising results in clinical trials. The study, published in a peer-reviewed journal, demonstrates a 70% success rate in treating certain types of cancer. Multiple independent experts have confirmed the findings.",
        source: "sciencedaily.com",
        url: "https://www.sciencedaily.com/example"
    },
    {
        title: "SHOCKING: Government hiding alien technology!!!",
        content: "Anonymous sources claim that the government has been hiding alien technology for decades. The conspiracy theory suggests that all modern technology was reverse-engineered from crashed UFOs. No evidence or credible sources are provided to support these extraordinary claims.",
        source: "conspiracytheories.net",
        url: "https://www.conspiracytheories.net/example"
    },
    {
        title: "Study suggests moderate coffee consumption may have health benefits",
        content: "A recent study published in the Journal of Nutrition found that moderate coffee consumption (2-3 cups per day) may be associated with certain health benefits, including reduced risk of type 2 diabetes and liver disease. However, researchers caution that more studies are needed to establish causation rather than just correlation.",
        source: "healthnews.org",
        url: "https://www.healthnews.org/example"
    }
];

// Test credibility service
const testCredibilityService = () => {
    console.log('🔍 Testing Credibility Service...\n');
    
    const credibilityService = new CredibilityService();
    
    TEST_ARTICLES.forEach((article, index) => {
        console.log(`Test ${index + 1}: Analyzing "${article.title}"`);
        
        try {
            const result = credibilityService.analyzeArticle(article);
            
            console.log(`✅ Credibility score: ${result.score}%`);
            console.log(`   Factors contributing to score:`);
            
            if (result.factors) {
                Object.entries(result.factors).forEach(([factor, value]) => {
                    console.log(`   - ${factor}: ${value}`);
                });
            }
            
            console.log(`   Classification: ${result.classification}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log();
    });
    
    console.log('🔍 Credibility Service Tests completed!');
};

// Run the tests
testCredibilityService();
