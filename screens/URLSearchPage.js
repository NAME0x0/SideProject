import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';
import { showToast } from '../utils/ToastConfig';
import LoadingOverlay from '../Components/LoadingOverlay';

export default function URLSearchPage({ route, navigation }) {
  const { initialUrl } = route.params || {};
  const [url, setUrl] = useState(initialUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [credibilityScore, setCredibilityScore] = useState(null);
  const [error, setError] = useState(null);
  
  const { saveArticle, isArticleSaved, getCachedArticle, cacheArticle, getCachedCredibilityScore, cacheCredibilityScore } = useApp();

  useEffect(() => {
    if (initialUrl) {
      handleVerify();
    }
  }, [initialUrl]);

  const handleVerify = async () => {
    if (!url) {
      showToast.validationError('Please enter a URL to verify');
      return;
    }

    // Validate URL format
    if (!url.match(/^(http|https):\/\/[^ "]+$/)) {
      showToast.validationError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError(null);
    setArticle(null);
    setCredibilityScore(null);

    try {
      // Check if article is cached
      const cachedArticle = getCachedArticle(url);
      const cachedScore = getCachedCredibilityScore(url);
      
      if (cachedArticle && cachedScore) {
        // Use cached data
        setArticle(cachedArticle);
        setCredibilityScore(cachedScore);
        showToast.info('Using Cached Data', 'Showing previously verified information');
      } else {
        // Fetch article data
        const articleData = await ApiService.scrapeArticle(url);
        
        if (articleData.success) {
          setArticle(articleData);
          cacheArticle(url, articleData);
          
          // Fetch credibility score
          const credibilityData = await ApiService.checkCredibility(articleData);
          
          if (credibilityData.success) {
            setCredibilityScore(credibilityData.score);
            cacheCredibilityScore(url, credibilityData.score);
          } else {
            throw new Error(credibilityData.message || 'Failed to verify article credibility');
          }
        } else {
          throw new Error(articleData.message || 'Failed to extract article content');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while verifying the article');
      showToast.error('Verification Failed', err.message || 'Failed to verify the article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArticle = () => {
    if (article) {
      const articleToSave = {
        title: article.title,
        content: article.content?.substring(0, 200) + '...',
        url: article.url,
        source: article.source,
        credibilityScore: credibilityScore,
        image: article.top_image
      };
      
      saveArticle(articleToSave);
    }
  };

  const handleViewOriginal = () => {
    if (article && article.url) {
      navigation.navigate('WebView', { url: article.url });
    }
  };

  const getCredibilityColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    return '#FF4842';
  };

  const getCredibilityLabel = (score) => {
    if (score >= 80) return 'Highly Credible';
    if (score >= 60) return 'Somewhat Credible';
    if (score >= 40) return 'Questionable';
    return 'Not Credible';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>URL Verification</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter article URL..."
              placeholderTextColor="#8f8e8e"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setUrl('')}
            >
              <Feather name="x" size={20} color="#8f8e8e" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>VERIFY</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color="#FF4842" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : article ? (
          <View style={styles.resultContainer}>
            <Text style={styles.articleTitle}>{article.title}</Text>
            
            {article.source && (
              <Text style={styles.articleSource}>Source: {article.source}</Text>
            )}
            
            {credibilityScore !== null && (
              <View style={styles.credibilityContainer}>
                <Text style={styles.credibilityLabel}>Credibility Score:</Text>
                <View style={styles.scoreContainer}>
                  <View 
                    style={[
                      styles.scoreBar, 
                      { width: `${credibilityScore}%`, backgroundColor: getCredibilityColor(credibilityScore) }
                    ]}
                  />
                  <Text style={styles.scoreText}>{credibilityScore}%</Text>
                </View>
                <Text style={[styles.credibilityText, { color: getCredibilityColor(credibilityScore) }]}>
                  {getCredibilityLabel(credibilityScore)}
                </Text>
              </View>
            )}
            
            <View style={styles.contentPreview}>
              <Text style={styles.contentLabel}>Article Preview:</Text>
              <Text style={styles.contentText}>
                {article.content?.substring(0, 300)}...
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSaveArticle}
              >
                <Feather 
                  name={isArticleSaved(article.url) ? "bookmark" : "bookmark-plus"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.actionButtonText}>
                  {isArticleSaved(article.url) ? "SAVED" : "SAVE"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleViewOriginal}
              >
                <Feather name="external-link" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>VIEW ORIGINAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
      
      <LoadingOverlay 
        visible={isLoading} 
        message="Verifying article... This may take a moment."
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c2120',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333333',
    fontFamily: 'Poppins',
  },
  clearButton: {
    padding: 10,
  },
  verifyButton: {
    backgroundColor: '#3168d8',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4842',
    fontFamily: 'Poppins',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  resultContainer: {
    padding: 20,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  articleSource: {
    fontSize: 14,
    color: '#8f8e8e',
    fontFamily: 'Poppins',
    marginBottom: 20,
  },
  credibilityContainer: {
    marginBottom: 20,
  },
  credibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  scoreContainer: {
    height: 30,
    backgroundColor: '#2b2f2e',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  scoreBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  scoreText: {
    position: 'absolute',
    right: 10,
    top: 5,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Poppins',
  },
  credibilityText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
    textAlign: 'right',
  },
  contentPreview: {
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'Poppins',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3168d8',
    borderRadius: 8,
    padding: 15,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 14,
    marginLeft: 8,
  },
});
