import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    const onboardingData = [
        {
            id: '1',
            title: 'Analyze news sources',
            description: 'in real-time for accuracy',
            icon: 'check-circle'
        },
        {
            id: '2',
            title: 'Quickly identify fake news',
            description: 'with advanced AI detection',
            icon: 'search'
        },
        {
            id: '3',
            title: 'Stay informed',
            description: 'and stop the spread of misinformation',
            icon: 'bell'
        }
    ];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
        }).start();
    }, [currentPage]);

    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(contentOffsetX / width);
        if (pageIndex !== currentPage) {
            setCurrentPage(pageIndex);
        }
    };

    const goToNextPage = () => {
        if (currentPage < onboardingData.length - 1) {
            scrollViewRef.current.scrollTo({
                x: width * (currentPage + 1),
                animated: true
            });
        } else {
            handleGetStarted();
        }
    };

    const handleGetStarted = async () => {
        try {
            // Mark onboarding as completed
            await AsyncStorage.setItem('onboardingCompleted', 'true');
            // Navigate to sign in screen
            navigation.replace('SignIn');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const renderIcon = (iconName) => {
        switch (iconName) {
            case 'check-circle':
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="check-circle" size={60} color="#FFFFFF" />
                    </View>
                );
            case 'search':
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="search" size={60} color="#FFFFFF" />
                    </View>
                );
            case 'bell':
                return (
                    <View style={styles.iconContainer}>
                        <Feather name="bell" size={60} color="#FFFFFF" />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <LinearGradient
            colors={['#1c2120', '#1c2120']}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>REALITY CHECK</Text>
                <Text style={styles.tagline}>No Cap. Just Facts.</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {onboardingData.map((item, index) => (
                    <Animated.View 
                        key={item.id} 
                        style={[
                            styles.page,
                            { opacity: currentPage === index ? fadeAnim : 0.5 }
                        ]}
                    >
                        {renderIcon(item.icon)}
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </Animated.View>
                ))}
            </ScrollView>

            <View style={styles.paginationContainer}>
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === currentPage ? styles.paginationDotActive : {}
                        ]}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={styles.getStartedButton}
                onPress={goToNextPage}
            >
                <Text style={styles.getStartedText}>
                    {currentPage === onboardingData.length - 1 ? 'GET STARTED' : 'NEXT'}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 60 : 80,
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#3168d8',
        fontFamily: 'Poppins',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        marginTop: 5,
    },
    scrollView: {
        flex: 1,
    },
    page: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(49, 104, 216, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#3168d8',
        fontFamily: 'Poppins',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        textAlign: 'center',
        opacity: 0.8,
    },
    paginationContainer: {
        flexDirection: 'row',
        marginBottom: 40,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#8f8e8e',
        marginHorizontal: 5,
    },
    paginationDotActive: {
        backgroundColor: '#3168d8',
        width: 20,
    },
    getStartedButton: {
        backgroundColor: '#3168d8',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginBottom: 50,
    },
    getStartedText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
});
