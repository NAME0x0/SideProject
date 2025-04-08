import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import Notification from '../Components/Notification';

export default function SavedArticlesScreen({ navigation }) {
    const [savedArticles, setSavedArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({
        visible: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        loadSavedArticles();
        
        // Add listener for when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadSavedArticles();
        });
        
        return unsubscribe;
    }, [navigation]);

    const loadSavedArticles = async () => {
        try {
            setIsLoading(true);
            const savedArticlesJson = await AsyncStorage.getItem('savedArticles');
            
            if (savedArticlesJson) {
                const articles = JSON.parse(savedArticlesJson);
                // Sort by most recently saved first
                articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setSavedArticles(articles);
            } else {
                setSavedArticles([]);
            }
        } catch (error) {
            console.error('Error loading saved articles:', error);
            setNotification({
                visible: true,
                message: 'Error loading saved articles',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteArticle = async (id) => {
        try {
            const updatedArticles = savedArticles.filter(article => article.id !== id);
            await AsyncStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
            setSavedArticles(updatedArticles);
            
            setNotification({
                visible: true,
                message: 'Article removed successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting article:', error);
            setNotification({
                visible: true,
                message: 'Error removing article',
                type: 'error'
            });
        }
    };

    const renderCredibilityBadge = (score) => {
        let badgeColor = '#FF4842'; // Default red for low credibility
        
        if (score >= 80) {
            badgeColor = '#4CAF50'; // Green for high credibility
        } else if (score >= 60) {
            badgeColor = '#FFC107'; // Yellow for medium credibility
        } else if (score >= 40) {
            badgeColor = '#FF9800'; // Orange for questionable credibility
        }
        
        return (
            <View style={[styles.credibilityBadge, { backgroundColor: badgeColor }]}>
                <Text style={styles.credibilityScore}>{score}%</Text>
            </View>
        );
    };

    const renderArticleItem = ({ item }) => (
        <View style={styles.articleCard}>
            <View style={styles.articleHeader}>
                {renderCredibilityBadge(item.credibilityScore)}
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteArticle(item.id)}
                >
                    <Feather name="trash-2" size={20} color="#FF4842" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.articleTitle}>{item.title}</Text>
            
            <Text style={styles.articleContent} numberOfLines={3}>
                {item.content}
            </Text>
            
            <View style={styles.articleFooter}>
                <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('WebView', { url: item.url })}
                >
                    <Text style={styles.viewButtonText}>VIEW ARTICLE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved Articles</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3168d8" />
                    <Text style={styles.loadingText}>Loading saved articles...</Text>
                </View>
            ) : savedArticles.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="bookmark" size={60} color="#8f8e8e" />
                    <Text style={styles.emptyText}>No saved articles yet</Text>
                    <Text style={styles.emptySubtext}>
                        Articles you save will appear here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={savedArticles}
                    renderItem={renderArticleItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.articlesList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Notification
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, visible: false })}
            />
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
        paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#FFFFFF',
        fontFamily: 'Poppins',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#8f8e8e',
        fontFamily: 'Poppins',
        textAlign: 'center',
        marginTop: 10,
    },
    articlesList: {
        padding: 20,
    },
    articleCard: {
        backgroundColor: '#2b2f2e',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    articleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    credibilityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    credibilityScore: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontFamily: 'Poppins',
        fontSize: 14,
    },
    deleteButton: {
        padding: 5,
    },
    articleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        marginBottom: 10,
    },
    articleContent: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        marginBottom: 15,
        opacity: 0.8,
    },
    articleFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    viewButton: {
        backgroundColor: '#3168d8',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    viewButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'Poppins',
        fontSize: 12,
    },
});
