import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
    Animated,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import LoadingOverlay from '../Components/LoadingOverlay';
import Notification from '../Components/Notification';

export default function ChangePassword({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        visible: false,
        message: '',
        type: 'success'
    });
    const [user, setUser] = useState(null);

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const glowColor = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Start glowing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowColor, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: false,
                }),
                Animated.timing(glowColor, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: false,
                }),
            ])
        ).start();

        // Get user data from AsyncStorage
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                } else {
                    navigation.replace('SignIn');
                }
            } catch (error) {
                console.error('Error retrieving user data:', error);
                setNotification({
                    visible: true,
                    message: 'Error retrieving user data',
                    type: 'error'
                });
            }
        };

        getUserData();
    }, []);

    const handleChangePassword = async () => {
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            setNotification({
                visible: true,
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setNotification({
                visible: true,
                message: 'New passwords do not match',
                type: 'error'
            });
            return;
        }

        if (newPassword.length < 6) {
            setNotification({
                visible: true,
                message: 'New password must be at least 6 characters',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/change-password`, {
                userId: user.id,
                currentPassword,
                newPassword
            });

            setIsLoading(false);
            setNotification({
                visible: true,
                message: 'Password changed successfully',
                type: 'success'
            });

            // Clear input fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Navigate back to profile after a short delay
            setTimeout(() => {
                navigation.goBack();
            }, 2000);
        } catch (error) {
            setIsLoading(false);
            console.error('Password change error:', error);
            
            let errorMessage = 'Failed to change password';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            setNotification({
                visible: true,
                message: errorMessage,
                type: 'error'
            });
        }
    };

    return (
        <LinearGradient
            colors={['#1c2120', '#1c2120']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Change Password</Text>
                    </View>

                    <Animated.View 
                        style={[
                            styles.formContainer, 
                            { opacity: fadeAnim }
                        ]}
                    >
                        <View style={styles.inputContainer}>
                            <Text style={styles.textLabel}>CURRENT PASSWORD</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#8f8e8e"
                                    secureTextEntry={!showCurrentPassword}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Feather 
                                        name={showCurrentPassword ? 'eye' : 'eye-off'} 
                                        size={24} 
                                        color="#8f8e8e" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.textLabel}>NEW PASSWORD</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#8f8e8e"
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Feather 
                                        name={showNewPassword ? 'eye' : 'eye-off'} 
                                        size={24} 
                                        color="#8f8e8e" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.textLabel}>CONFIRM NEW PASSWORD</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#8f8e8e"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIconContainer}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Feather 
                                        name={showConfirmPassword ? 'eye' : 'eye-off'} 
                                        size={24} 
                                        color="#8f8e8e" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.changePasswordButton}
                            onPress={handleChangePassword}
                        >
                            <Text style={styles.changePasswordText}>CHANGE PASSWORD</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            <LoadingOverlay 
                visible={isLoading} 
                message="Changing password..."
            />
            
            <Notification
                visible={notification.visible}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, visible: false })}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 50,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Poppins',
    },
    formContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 25,
    },
    textLabel: {
        fontFamily: 'Poppins',
        color: '#8f8e8e',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'left',
    },
    input: {
        width: '100%',
        height: 50,
        paddingHorizontal: 15,
        color: '#FFFFFF',
        backgroundColor: '#2b2f2e',
        borderRadius: 8,
        borderColor: '#3168d8',
        borderWidth: 1,
        textAlign: 'left',
        fontFamily: 'Poppins',
    },
    passwordInputContainer: {
        position: 'relative',
        width: '100%',
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    changePasswordButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#3168d8',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    changePasswordText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
});
