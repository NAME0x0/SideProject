import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import ApiService from '../services/ApiService';
import { showToast } from '../utils/ToastConfig';
import LoadingOverlay from '../Components/LoadingOverlay';

export default function HomeScreen({ navigation }) {
  const [trendingNews, setTrendingNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isArticleSaved, saveArticle } = useApp();

  useEffect(() => {
    fetchTrendingNews();
  }, []);

  const fetchTrendingNews = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getTrendingNews();
      
      if (response.success) {
        setTrendingNews(response.articles || []);
      } else {
        showToast.error('Error', response.message || 'Failed to load trending news');
      }
    } catch (error) {
      console.error('Error fetching trending news:', error);
      // Error is already handled by ApiService
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrendingNews();
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast.validationError('Please enter a search term');
      return;
    }
    
    navigation.navigate('URLSearch', { initialUrl: searchQuery });
  };

  const handleVerifyArticle = (article) => {
    navigation.navigate('URLSearch', { initialUrl: article.url });
  };

  const handleSaveArticle = (article) => {
    saveArticle(article);
  };

  const renderNewsItem = ({ item }) => (
    <View style={styles.newsCard}>
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        
        <Text style={styles.newsExcerpt}>
          {item.content?.substring(0, 100)}...
        </Text>
        
        <View style={styles.newsFooter}>
          <Text style={styles.newsDate}>{item.date || '2 DAYS AGO'}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleVerifyArticle(item)}
            >
              <Text style={styles.actionButtonText}>VERIFY</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSaveArticle(item)}
            >
              <Feather 
                name={isArticleSaved(item.url) ? "bookmark" : "bookmark-plus"} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={60} color="#8f8e8e" />
      <Text style={styles.emptyText}>No trending news found</Text>
      <Text style={styles.emptySubtext}>
        Try searching for a specific article or check back later
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#8f8e8e" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH FOR NEWS ARTICLES..."
            placeholderTextColor="#8f8e8e"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>TRENDING NEWS</Text>
      
      <FlatList
        data={trendingNews}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id?.toString() || item.url}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={!isLoading ? renderEmptyComponent : null}
      />
      
      <LoadingOverlay visible={isLoading} message="Loading trending news..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c2120',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#333333',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  listContainer: {
    padding: 15,
    paddingTop: 0,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  newsExcerpt: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins',
    lineHeight: 22,
    marginBottom: 15,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    color: '#8f8e8e',
    fontFamily: 'Poppins',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#3168d8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins',
    fontSize: 12,
  },
  saveButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8f8e8e',
    fontFamily: 'Poppins',
    textAlign: 'center',
    lineHeight: 22,
  },
});
