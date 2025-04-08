class CredibilityService {
  constructor() {
    // Initialize NLP libraries and models
    this.sourceReputationMap = {
      'bbc.com': 90,
      'nytimes.com': 85,
      'washingtonpost.com': 85,
      'reuters.com': 95,
      'apnews.com': 95,
      'npr.org': 85,
      'theguardian.com': 80,
      'economist.com': 85,
      'scientificamerican.com': 90,
      'nature.com': 95,
      'science.org': 95,
      'nationalgeographic.com': 85,
      'forbes.com': 75,
      'bloomberg.com': 80,
      'wsj.com': 80,
      'ft.com': 85,
      'theatlantic.com': 80,
      'newyorker.com': 80,
      'time.com': 75,
      'cnn.com': 70,
      'foxnews.com': 60,
      'msnbc.com': 65,
      'breitbart.com': 40,
      'infowars.com': 20,
      'dailymail.co.uk': 50,
      'thesun.co.uk': 45,
      'buzzfeed.com': 60,
      'huffpost.com': 65,
      'vox.com': 70,
      'slate.com': 65,
      'salon.com': 60,
      'motherjones.com': 60,
      'reason.com': 65,
      'nationalreview.com': 60,
      'thedailybeast.com': 55,
      'thehill.com': 70
    };
    
    // Clickbait phrases and patterns
    this.clickbaitPhrases = [
      'you won\'t believe',
      'shocking',
      'mind-blowing',
      'jaw-dropping',
      'unbelievable',
      'incredible',
      'insane',
      'amazing',
      'secret',
      'trick',
      'hack',
      'this is why',
      'this is what happens',
      'what happens next',
      'will shock you',
      'will blow your mind',
      'changed my life',
      'doctors hate',
      'one weird trick',
      'miracle',
      'cure',
      'perfect',
      'never seen before',
      'gone wrong',
      'gone sexual',
      'won\'t believe what happened',
      'this simple trick',
      'they don\'t want you to know',
      'the truth about',
      'what they don\'t tell you',
      'secret that',
      'simple way to',
      'how to get',
      'signs you might',
      'reasons why',
      'things you didn\'t know',
      'things nobody tells you',
      'only real',
      'ultimate',
      'best ever',
      'worst ever',
      'of all time',
      'of your life',
      'changed everything',
      'will make you',
      'makes you',
      'this is the most',
      'can\'t handle',
      'can\'t stop',
      'win the internet',
      'broke the internet',
      'viral',
      'trending',
      'official',
      'exclusive',
      'leaked',
      'banned',
      'censored',
      'controversial',
      'debate',
      'argument',
      'fight',
      'feud',
      'drama',
      'scandal',
      'exposed',
      'reveals',
      'confesses',
      'admits',
      'finally',
      'just in',
      'breaking',
      'urgent',
      'alert',
      'warning',
      'emergency',
      'crisis',
      'disaster',
      'catastrophe',
      'tragedy',
      'horror',
      'terrifying',
      'scary',
      'creepy',
      'disturbing',
      'haunting',
      'bizarre',
      'weird',
      'strange',
      'odd',
      'unusual',
      'rare',
      'unique',
      'never before seen',
      'first time ever',
      'last time ever',
      'only time',
      'once in a lifetime',
      'once in a generation',
      'game-changing',
      'life-changing',
      'world-changing',
      'revolutionary',
      'groundbreaking',
      'innovative',
      'cutting-edge',
      'next-level',
      'next-generation',
      'futuristic',
      'ancient',
      'historic',
      'legendary',
      'epic',
      'awesome',
      'amazing',
      'stunning',
      'spectacular',
      'magnificent',
      'gorgeous',
      'beautiful',
      'ugly',
      'hideous',
      'disgusting',
      'gross',
      'nasty',
      'terrible',
      'horrible',
      'awful',
      'worst',
      'best',
      'top',
      'ultimate',
      'essential',
      'must-see',
      'must-read',
      'must-know',
      'need to know',
      'should know',
      'have to see',
      'don\'t miss',
      'can\'t miss'
    ];
    
    // Sentiment analysis simple dictionary
    this.sentimentDictionary = {
      positive: [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
        'terrific', 'outstanding', 'superb', 'brilliant', 'awesome', 
        'remarkable', 'exceptional', 'marvelous', 'fabulous', 'splendid',
        'perfect', 'pleasant', 'delightful', 'satisfying', 'gratifying',
        'enjoyable', 'favorable', 'positive', 'nice', 'lovely', 'beautiful',
        'attractive', 'appealing', 'charming', 'impressive', 'admirable',
        'commendable', 'praiseworthy', 'laudable', 'meritorious', 'worthy',
        'valuable', 'beneficial', 'advantageous', 'helpful', 'useful',
        'constructive', 'productive', 'effective', 'efficient', 'successful',
        'prosperous', 'thriving', 'flourishing', 'booming', 'growing',
        'improving', 'progressing', 'advancing', 'developing', 'evolving',
        'happy', 'joyful', 'cheerful', 'merry', 'jolly', 'gleeful', 'elated',
        'delighted', 'pleased', 'glad', 'content', 'satisfied', 'gratified',
        'fulfilled', 'peaceful', 'calm', 'serene', 'tranquil', 'relaxed',
        'comfortable', 'cozy', 'secure', 'safe', 'protected', 'sheltered',
        'true', 'accurate', 'correct', 'factual', 'valid', 'legitimate',
        'authentic', 'genuine', 'real', 'actual', 'verifiable', 'confirmed',
        'proven', 'demonstrated', 'established', 'certain', 'definite',
        'clear', 'obvious', 'evident', 'apparent', 'plain', 'manifest',
        'undeniable', 'indisputable', 'incontrovertible', 'irrefutable',
        'unquestionable', 'undoubted', 'unambiguous', 'explicit', 'precise',
        'exact', 'specific', 'detailed', 'thorough', 'comprehensive',
        'complete', 'full', 'entire', 'whole', 'total', 'absolute'
      ],
      negative: [
        'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'abysmal',
        'appalling', 'atrocious', 'deplorable', 'dire', 'disastrous',
        'catastrophic', 'calamitous', 'tragic', 'unfortunate', 'regrettable',
        'lamentable', 'pitiful', 'pathetic', 'woeful', 'wretched', 'miserable',
        'distressing', 'disturbing', 'troubling', 'worrying', 'concerning',
        'alarming', 'frightening', 'terrifying', 'horrifying', 'shocking',
        'scandalous', 'outrageous', 'disgraceful', 'shameful', 'dishonorable',
        'disreputable', 'discreditable', 'unethical', 'immoral', 'corrupt',
        'dishonest', 'deceitful', 'deceptive', 'misleading', 'fraudulent',
        'false', 'fake', 'counterfeit', 'bogus', 'phony', 'sham', 'hoax',
        'scam', 'con', 'trick', 'ruse', 'ploy', 'scheme', 'plot', 'conspiracy',
        'wrong', 'incorrect', 'inaccurate', 'erroneous', 'mistaken', 'flawed',
        'faulty', 'defective', 'deficient', 'inadequate', 'insufficient',
        'lacking', 'wanting', 'missing', 'absent', 'void', 'empty', 'hollow',
        'meaningless', 'pointless', 'useless', 'worthless', 'valueless',
        'futile', 'vain', 'fruitless', 'unproductive', 'ineffective',
        'inefficient', 'unsuccessful', 'failing', 'deteriorating', 'declining',
        'worsening', 'degenerating', 'sad', 'unhappy', 'sorrowful', 'mournful',
        'grieving', 'heartbroken', 'devastated', 'crushed', 'shattered',
        'ruined', 'destroyed', 'damaged', 'harmed', 'injured', 'hurt',
        'painful', 'agonizing', 'excruciating', 'unbearable', 'intolerable',
        'insufferable', 'unendurable', 'unpleasant', 'disagreeable',
        'uncomfortable', 'uneasy', 'anxious', 'worried', 'concerned',
        'troubled', 'distressed', 'upset', 'agitated', 'disturbed',
        'perturbed', 'disconcerted', 'discomposed', 'unsettled', 'unstable',
        'volatile', 'turbulent', 'chaotic', 'disorderly', 'confused',
        'bewildered', 'perplexed', 'puzzled', 'baffled', 'mystified',
        'uncertain', 'doubtful', 'dubious', 'questionable', 'suspicious',
        'skeptical', 'distrustful', 'mistrustful', 'wary', 'cautious',
        'careful', 'guarded', 'reserved', 'hesitant', 'reluctant', 'unwilling'
      ],
      extreme: [
        'always', 'never', 'all', 'none', 'every', 'only', 'absolutely',
        'completely', 'totally', 'utterly', 'entirely', 'wholly', 'fully',
        'perfectly', 'purely', 'simply', 'just', 'merely', 'only', 'solely',
        'exclusively', 'certainly', 'definitely', 'undoubtedly', 'undeniably',
        'unquestionably', 'indisputably', 'incontrovertibly', 'irrefutably',
        'extremely', 'exceedingly', 'exceptionally', 'extraordinarily',
        'tremendously', 'immensely', 'enormously', 'vastly', 'hugely',
        'massively', 'colossally', 'monumentally', 'phenomenally',
        'incredibly', 'unbelievably', 'unimaginably', 'inconceivably',
        'impossibly', 'ridiculously', 'absurdly', 'ludicrously',
        'preposterous', 'outrageous', 'shocking', 'staggering', 'astounding',
        'astonishing', 'amazing', 'stunning', 'breathtaking', 'mind-blowing',
        'jaw-dropping', 'overwhelming', 'devastating', 'catastrophic',
        'cataclysmic', 'apocalyptic', 'world-ending', 'earth-shattering',
        'groundbreaking', 'revolutionary', 'radical', 'fundamental',
        'essential', 'critical', 'crucial', 'vital', 'indispensable',
        'necessary', 'required', 'mandatory', 'compulsory', 'obligatory',
        'imperative', 'urgent', 'pressing', 'immediate', 'instant',
        'instantaneous', 'sudden', 'abrupt', 'unexpected', 'unforeseen',
        'unanticipated', 'surprising', 'startling', 'remarkable', 'notable',
        'noteworthy', 'significant', 'important', 'major', 'serious', 'grave',
        'severe', 'intense', 'extreme', 'excessive', 'inordinate',
        'disproportionate', 'unreasonable', 'unwarranted', 'unjustified',
        'undeserved', 'unmerited', 'unearned', 'undue'
      ]
    };
  }

  // Analyze article credibility
  analyzeArticle(article) {
    try {
      if (!article || !article.content) {
        throw new Error('Invalid article data');
      }

      // Calculate individual factors
      const sourceScore = this.evaluateSource(article.source || this.extractDomain(article.url));
      const clickbaitScore = this.detectClickbait(article.title);
      const sentimentScore = this.analyzeSentiment(article.content);
      const extremeLanguageScore = this.detectExtremeLanguage(article.content);
      const contentLengthScore = this.evaluateContentLength(article.content);
      
      // Calculate overall credibility score (weighted average)
      const weights = {
        source: 0.35,
        clickbait: 0.25,
        sentiment: 0.15,
        extremeLanguage: 0.15,
        contentLength: 0.10
      };
      
      const overallScore = Math.round(
        sourceScore * weights.source +
        clickbaitScore * weights.clickbait +
        sentimentScore * weights.sentiment +
        extremeLanguageScore * weights.extremeLanguage +
        contentLengthScore * weights.contentLength
      );
      
      // Determine classification
      let classification;
      if (overallScore >= 80) {
        classification = 'Highly Credible';
      } else if (overallScore >= 60) {
        classification = 'Somewhat Credible';
      } else if (overallScore >= 40) {
        classification = 'Questionable';
      } else {
        classification = 'Not Credible';
      }
      
      return {
        score: overallScore,
        classification,
        factors: {
          sourceReputation: sourceScore,
          clickbaitLevel: clickbaitScore,
          sentimentBalance: sentimentScore,
          extremeLanguageUse: extremeLanguageScore,
          contentDepth: contentLengthScore
        }
      };
    } catch (error) {
      console.error('Error analyzing article:', error);
      throw new Error('Failed to analyze article credibility');
    }
  }

  // Extract domain from URL
  extractDomain(url) {
    try {
      if (!url) return '';
      
      // Remove protocol and get domain
      const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
      return domain;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return '';
    }
  }

  // Evaluate source reputation
  evaluateSource(domain) {
    if (!domain) return 50; // Neutral score for unknown domains
    
    // Check if domain is in our reputation map
    for (const knownDomain in this.sourceReputationMap) {
      if (domain.includes(knownDomain)) {
        return this.sourceReputationMap[knownDomain];
      }
    }
    
    // Default score for unknown domains
    return 50;
  }

  // Detect clickbait in title
  detectClickbait(title) {
    if (!title) return 50;
    
    const titleLower = title.toLowerCase();
    let clickbaitCount = 0;
    
    // Check for clickbait phrases
    for (const phrase of this.clickbaitPhrases) {
      if (titleLower.includes(phrase)) {
        clickbaitCount++;
      }
    }
    
    // Check for excessive punctuation
    const exclamationCount = (title.match(/!/g) || []).length;
    const questionCount = (title.match(/\?/g) || []).length;
    
    if (exclamationCount > 1) clickbaitCount++;
    if (questionCount > 1) clickbaitCount++;
    if (exclamationCount > 0 && questionCount > 0) clickbaitCount++;
    
    // Check for ALL CAPS words
    const words = title.split(' ');
    const capsWordCount = words.filter(word => word.length > 3 && word === word.toUpperCase()).length;
    
    if (capsWordCount > 1) clickbaitCount++;
    
    // Calculate score (higher clickbait count = lower score)
    const maxClickbaitCount = 5;
    const clickbaitScore = Math.max(0, 100 - (clickbaitCount / maxClickbaitCount) * 100);
    
    return Math.round(clickbaitScore);
  }

  // Analyze sentiment balance
  analyzeSentiment(content) {
    if (!content) return 50;
    
    const contentLower = content.toLowerCase();
    const words = contentLower.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Count positive and negative words
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.sentimentDictionary.positive.includes(cleanWord)) {
        positiveCount++;
      } else if (this.sentimentDictionary.negative.includes(cleanWord)) {
        negativeCount++;
      }
    }
    
    const totalSentimentWords = positiveCount + negativeCount;
    
    if (totalSentimentWords === 0) return 70; // Neutral content gets a decent score
    
    // Calculate sentiment balance (closer to 50/50 is better for factual reporting)
    const positiveRatio = positiveCount / totalSentimentWords;
    const negativeRatio = negativeCount / totalSentimentWords;
    
    // Ideal balance is around 40-60% positive (factual reporting has some negative content)
    const idealPositiveRatio = 0.5;
    const balanceScore = 100 - (Math.abs(positiveRatio - idealPositiveRatio) * 100);
    
    return Math.round(balanceScore);
  }

  // Detect extreme language
  detectExtremeLanguage(content) {
    if (!content) return 50;
    
    const contentLower = content.toLowerCase();
    const words = contentLower.split(/\s+/);
    
    let extremeWordCount = 0;
    
    // Count extreme language words
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.sentimentDictionary.extreme.includes(cleanWord)) {
        extremeWordCount++;
      }
    }
    
    // Calculate score (higher extreme word count = lower score)
    const extremeRatio = extremeWordCount / words.length;
    const extremeLanguageScore = 100 - (extremeRatio * 500); // Multiply by 500 to amplify the effect
    
    return Math.round(Math.max(0, Math.min(100, extremeLanguageScore)));
  }

  // Evaluate content length/depth
  evaluateContentLength(content) {
    if (!content) return 0;
    
    const wordCount = content.split(/\s+/).length;
    
    // Very short articles are less likely to be in-depth reporting
    if (wordCount < 100) return 20;
    if (wordCount < 300) return 40;
    if (wordCount < 500) return 60;
    if (wordCount < 800) return 80;
    return 100; // Long-form content
  }
}

module.exports = CredibilityService;
