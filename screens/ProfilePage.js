import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Animated,
    Image,
    Switch
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config';
import LoadingOverlay from '../Components/LoadingOverlay';
import Notification from '../Components/Notification';

export default function ProfilePage() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        visible: false,
        message: '',
        type: 'success'
    });

    // Theme colors
    const theme = {
        background: darkMode ? '#1c2120' : '#f5f5f5',
        text: darkMode ? '#FFFFFF' : '#333333',
        card: darkMode ? '#2b2f2e' : '#FFFFFF',
        border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setFirstName(parsedUser.first_name);
                setLastName(parsedUser.last_name);
                setEmail(parsedUser.email);
            } else {
                navigation.replace('SignIn');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            setNotification({
                visible: true,
                message: 'Error loading user data',
                type: 'error'
            });
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // Save preference to AsyncStorage
        AsyncStorage.setItem('darkMode', JSON.stringify(!darkMode));
    };

    const handleSaveChanges = async () => {
        if (!firstName || !lastName || !email) {
            setNotification({
                visible: true,
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/update-profile`, {
                userId: user.id,
                firstName,
                lastName,
                email
            });

            // Update local user data
            const updatedUser = response.data.user;
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            setIsLoading(false);
            setIsEditing(false);
            
            setNotification({
                visible: true,
                message: 'Profile updated successfully',
                type: 'success'
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Profile update error:', error);
            
            let errorMessage = 'Failed to update profile';
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

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('user');
            navigation.replace('SignIn');
        } catch (error) {
            console.error('Error logging out:', error);
            setNotification({
                visible: true,
                message: 'Error logging out',
                type: 'error'
            });
        }
    };

    const navigateToChangePassword = () => {
        navigation.navigate('ChangePassword');
    };

    const renderSettingItem = (icon, label, value, onToggle) => (
        <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLeft}>
                <Feather name={icon} size={22} color="#666666" />
                <Text style={[styles.settingText, { color: theme.text }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#767577', true: '#3168d8' }}
                thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
            />
        </View>
    );

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <LoadingOverlay visible={true} message="Loading profile..." />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Profile Details</Text>
                </View>

                <View style={[styles.profileSection, { backgroundColor: theme.card }]}>
                    {isEditing ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>FIRST NAME</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholderTextColor="#8f8e8e"
                                />
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>LAST NAME</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholderTextColor="#8f8e8e"
                                />
                            </View>
                            
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>EMAIL</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    placeholderTextColor="#8f8e8e"
                                />
                            </View>
                            
                            <View style={styles.buttonRow}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]} 
                                    onPress={() => {
                                        setIsEditing(false);
                                        // Reset to original values
                                        setFirstName(user.first_name);
                                        setLastName(user.last_name);
                                        setEmail(user.email);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.button, styles.saveButton]} 
                                    onPress={handleSaveChanges}
                                >
                                    <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.profileItem}>
                                <Text style={[styles.profileLabel, { color: theme.text }]}>{firstName} {lastName}</Text>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Feather name="edit-2" size={20} color="#3168d8" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.profileItem}>
                                <Text style={[styles.profileEmail, { color: theme.text }]}>{email}</Text>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Feather name="edit-2" size={20} color="#3168d8" />
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.changePasswordButton}
                                onPress={navigateToChangePassword}
                            >
                                <Text style={styles.changePasswordText}>CHANGE PASSWORD</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
                    {renderSettingItem('bell', 'Notifications', notifications, setNotifications)}
                    {renderSettingItem('download', 'Offline Mode', offlineMode, setOfflineMode)}
                    {renderSettingItem('moon', 'Dark Mode', darkMode, toggleDarkMode)}
                </View>

                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>FAQs</Text>
                    <View style={styles.faqItem}>
                        <Text style={[styles.faqQuestion, { color: theme.text }]}>
                            1. HOW DO I UPDATE MY PROFILE DETAILS?
                        </Text>
                        <Text style={[styles.faqAnswer, { color: theme.text }]}>
                            TO UPDATE YOUR PROFILE, CLICK THE "EDIT" BUTTON NEXT TO YOUR NAME OR EMAIL. MAKE THE NECESSARY CHANGES AND CLICK "SAVE CHANGES" TO UPDATE YOUR PROFILE.
                        </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreText}>VIEW MORE</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </ScrollView>

            <LoadingOverlay 
                visible={isLoading} 
                message="Updating profile..."
            />
            
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
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Poppins',
        textAlign: 'center',
    },
    profileSection: {
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    profileItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    profileLabel: {
        fontSize: 18,
        fontFamily: 'Poppins',
    },
    profileEmail: {
        fontSize: 16,
        fontFamily: 'Poppins',
    },
    changePasswordButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    changePasswordText: {
        color: '#1c2120',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'Poppins',
        marginBottom: 15,
        textAlign: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        fontFamily: 'Poppins',
        marginLeft: 15,
    },
    faqItem: {
        marginBottom: 15,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 12,
        fontFamily: 'Poppins',
        lineHeight: 18,
    },
    viewMoreButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
    },
    viewMoreText: {
        color: '#1c2120',
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    logoutButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FF4842',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 30,
    },
    logoutText: {
        color: '#FF4842',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    textLabel: {
        fontFamily: 'Poppins',
        color: '#8f8e8e',
        fontSize: 12,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 45,
        paddingHorizontal: 10,
        backgroundColor: '#2b2f2e',
        borderRadius: 5,
        borderColor: '#3168d8',
        borderWidth: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#8f8e8e',
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#3168d8',
        marginLeft: 10,
    },
    cancelButtonText: {
        color: '#8f8e8e',
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins',
    },
});
