import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { AutoLogoutService } from '../services/AutoLogoutService';
import { BiometricAuthService } from '../services/BiometricAuth';
import { getAuthToken } from './LoginScreen';

interface ProfileOption {
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    iconType: 'ionicons' | 'feather' | 'material' | 'fontawesome';
    color: string;
    action: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    disabled?: boolean;
}

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [profile, setProfile] = useState<{ username?: string; email?: string; full_name?: string } | null>(null);
    const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
    
    // Use activity tracking hook
    const { recordActivity } = useActivityTracking();

    useEffect(() => {
        const fetchProfileAndAccounts = async () => {
            const token = await getAuthToken();
            if (!token) return;
            try {
                const [profileRes, accountsRes] = await Promise.all([
                    fetch('http://10.228.195.3:8000/api/accounts/profile/', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://10.228.195.3:8000/api/linked-accounts/', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile(data);
                }
                if (accountsRes.ok) {
                    const data = await accountsRes.json();
                    setLinkedAccounts(data);
                }
            } catch (e) {}
        };
        fetchProfileAndAccounts();
        checkBiometricStatus();
    }, []);

    const checkBiometricStatus = async () => {
        const available = await BiometricAuthService.isBiometricAvailable();
        const enabled = await BiometricAuthService.isBiometricEnabled();
        setBiometricAvailable(available);
        setBiometricEnabled(enabled);
    };

    const handleBiometricToggle = async (value: boolean) => {
        recordActivity();
        
        if (value) {
            // Enable biometric
            Alert.alert(
                'Enable Biometric Login',
                'You will need to authenticate with your fingerprint or face ID to enable biometric login.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Enable',
                        onPress: async () => {
                            try {
                                // For enabling, we need the user's credentials
                                // Since we don't have them stored, we'll prompt the user
                                Alert.alert(
                                    'Setup Required',
                                    'Please go to the login screen and enable biometric login there first.',
                                    [{ text: 'OK' }]
                                );
                                setBiometricEnabled(false); // Reset the switch
                            } catch (error) {
                                Alert.alert('Error', 'Failed to enable biometric login');
                                setBiometricEnabled(false);
                            }
                        }
                    }
                ]
            );
        } else {
            // Disable biometric
            Alert.alert(
                'Disable Biometric Login',
                'Are you sure you want to disable biometric login?',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setBiometricEnabled(true) },
                    {
                        text: 'Disable',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const success = await BiometricAuthService.disableBiometric();
                                if (success) {
                                    setBiometricEnabled(false);
                                    Alert.alert('Success', 'Biometric login has been disabled');
                                } else {
                                    Alert.alert('Error', 'Failed to disable biometric login');
                                    setBiometricEnabled(true);
                                }
                            } catch (error) {
                                Alert.alert('Error', 'Failed to disable biometric login');
                                setBiometricEnabled(true);
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleNotificationsToggle = async (value: boolean) => {
        recordActivity();
        try {
            const token = await getAuthToken();
            if (!token) return;
            await fetch('http://10.228.195.3:8000/api/accounts/settings/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notifications_enabled: value }),
            });
            setNotificationsEnabled(value);
        } catch (error) {
            Alert.alert('Error', 'Failed to update notification settings');
        }
    };

    const handleLogout = async () => {
        recordActivity();
        try {
            // Clear auth token
            await AsyncStorage.removeItem('authToken');
            setShowLogoutModal(false);
            // Navigate to login screen
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    const profileOptions: ProfileOption[] = [
        {
            id: 'balance',
            title: 'Wallet Balance',
            subtitle: 'K2,450.00',
            icon: 'wallet',
            iconType: 'ionicons',
            color: '#28A745',
            action: () => {
                recordActivity();
                Alert.alert('Balance', 'Your current wallet balance is K2,450.00');
            }
        },
        {
            id: 'security',
            title: 'Security Settings',
            subtitle: 'Password, PIN, Biometric',
            icon: 'shield-checkmark',
            iconType: 'ionicons',
            color: '#DC3545',
            action: () => {
                recordActivity();
                Alert.alert('Security', 'Security settings coming soon!');
            }
        },
        {
            id: 'biometric',
            title: 'Biometric Login',
            subtitle: biometricAvailable 
                ? (biometricEnabled ? 'Enabled - Use fingerprint or face ID' : 'Disabled - Tap to enable')
                : 'Not available on this device',
            icon: 'fingerprint',
            iconType: 'ionicons',
            color: '#6F42C1',
            action: () => {
                recordActivity();
                if (!biometricAvailable) {
                    Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
                }
            },
            showSwitch: biometricAvailable,
            switchValue: biometricEnabled,
            onSwitchChange: handleBiometricToggle,
            disabled: !biometricAvailable
        },
        {
            id: 'notifications',
            title: 'Notifications',
            subtitle: 'Transaction alerts & updates',
            icon: 'notifications',
            iconType: 'ionicons',
            color: '#FFC107',
            action: () => {
                recordActivity();
            },
            showSwitch: true,
            switchValue: notificationsEnabled,
            onSwitchChange: (value) => {
                recordActivity();
                setNotificationsEnabled(value);
            }
        },
        {
            id: 'auto-logout',
            title: 'Auto Logout',
            subtitle: 'Logout after inactivity (15 minutes)',
            icon: 'time',
            iconType: 'ionicons',
            color: '#E74C3C',
            action: () => {
                recordActivity();
                Alert.alert(
                    'Auto Logout Settings',
                    'Auto logout is currently set to 15 minutes of inactivity. This helps keep your account secure.',
                    [
                        { text: 'Disable', onPress: () => AutoLogoutService.updateConfig({ enabled: false }) },
                        { text: 'Keep Enabled', style: 'cancel' }
                    ]
                );
            }
        },
        {
            id: 'qr-code',
            title: 'My QR Code',
            subtitle: 'Share for payments',
            icon: 'qr-code',
            iconType: 'ionicons',
            color: '#17A2B8',
            action: () => {
                recordActivity();
                Alert.alert('QR Code', 'Your QR code will be displayed here');
            }
        },
        {
            id: 'linked-accounts',
            title: 'Linked Accounts',
            subtitle: linkedAccounts.length > 0 ? `${linkedAccounts.length} account(s)` : 'No linked accounts',
            icon: 'link',
            iconType: 'ionicons',
            color: '#20C997',
            action: () => {
                recordActivity();
                Alert.alert('Linked Accounts', 'Manage your linked mobile money accounts');
            }
        },
        {
            id: 'transaction-history',
            title: 'Transaction History',
            subtitle: 'View all transactions',
            icon: 'time',
            iconType: 'ionicons',
            color: '#FD7E14',
            action: () => {
                recordActivity();
                Alert.alert('History', 'View your complete transaction history');
            }
        },
        {
            id: 'preferences',
            title: 'Settings',
            subtitle: 'Account settings & preferences',
            icon: 'settings',
            iconType: 'ionicons',
            color: '#6C757D',
            action: () => {
                recordActivity();
                (navigation as any).navigate('Settings');
            }
        },
        {
            id: 'help',
            title: 'Help & Support',
            subtitle: 'FAQ, contact support',
            icon: 'help-circle',
            iconType: 'ionicons',
            color: '#007BFF',
            action: () => {
                recordActivity();
                Alert.alert('Support', 'Get help and contact support');
            }
        },
        {
            id: 'about',
            title: 'About Impiy',
            subtitle: 'Version 1.0.0',
            icon: 'information-circle',
            iconType: 'ionicons',
            color: '#6C757D',
            action: () => {
                recordActivity();
                Alert.alert('About', 'Impiy Mobile Wallet v1.0.0\nSecure, fast, reliable');
            }
        }
    ];

    const renderIcon = (icon: string, iconType: string, color: string) => {
        const iconProps = { size: 24, color };
        
        switch (iconType) {
            case 'ionicons':
                return <Ionicons name={icon as any} {...iconProps} />;
            case 'feather':
                return <Feather name={icon as any} {...iconProps} />;
            case 'material':
                return <MaterialIcons name={icon as any} {...iconProps} />;
            case 'fontawesome':
                return <FontAwesome5 name={icon as any} {...iconProps} />;
            default:
                return <Ionicons name="help-circle" {...iconProps} />;
        }
    };

    const renderProfileHeader = () => (
        <LinearGradient
            colors={["#e8f5e9", "#fff", "#e0f7fa"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.headerContent}>
                <View style={styles.profileImageContainer}>
                    <Image 
                        source={{ uri: 'https://simonielmusyoki.com/images/user-thumb/musyox.jpg'}}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity style={styles.editButton} onPress={recordActivity}>
                        <Ionicons name="camera" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile?.username || 'No username found'}</Text>
                    <Text style={styles.profilePhone}>+254 719 177 308</Text>
                    <Text style={styles.profileEmail}>{profile?.email || 'No email found'}</Text>
                    
                    <View style={styles.verificationBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                        <Text style={styles.verificationText}>Verified Account</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>156</Text>
                    <Text style={styles.statLabel}>Transactions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{linkedAccounts.length}</Text>
                    <Text style={styles.statLabel}>Linked Accounts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Months Active</Text>
                </View>
            </View>
        </LinearGradient>
    );

    const renderProfileOption = (option: ProfileOption) => (
        <TouchableOpacity 
            key={option.id}
            style={[styles.optionContainer, option.disabled && styles.disabledOption]}
            onPress={option.action}
            disabled={option.disabled}
        >
            <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                    {renderIcon(option.icon, option.iconType, option.color)}
                </View>
                <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, option.disabled && styles.disabledText]}>{option.title}</Text>
                    {option.subtitle && (
                        <Text style={[styles.optionSubtitle, option.disabled && styles.disabledText]}>{option.subtitle}</Text>
                    )}
                </View>
            </View>
            
            <View style={styles.optionRight}>
                {option.showSwitch ? (
                    <Switch
                        value={option.switchValue}
                        onValueChange={option.onSwitchChange}
                        trackColor={{ false: '#E9ECEF', true: option.color }}
                        thumbColor={option.switchValue ? COLORS.white : '#6C757D'}
                        disabled={option.disabled}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                )}
            </View>
        </TouchableOpacity>
    );

    const renderLogoutModal = () => (
        <Modal
            visible={showLogoutModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLogoutModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalIcon}>
                        <Ionicons name="log-out" size={40} color={COLORS.red} />
                    </View>
                    <Text style={styles.modalTitle}>Sign Out</Text>
                    <Text style={styles.modalMessage}>
                        Are you sure you want to sign out? You'll need to log in again to access your account.
                    </Text>
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                                recordActivity();
                                setShowLogoutModal(false);
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} onScroll={recordActivity}>
                {renderProfileHeader()}
                
                <View style={styles.optionsContainer}>
                    {profileOptions.map(renderProfileOption)}
                </View>

                <TouchableOpacity 
                    style={styles.logoutContainer}
                    onPress={() => {
                        recordActivity();
                        setShowLogoutModal(true);
                    }}
                >
                    <View style={styles.logoutContent}>
                        <Ionicons name="log-out" size={24} color={COLORS.red} />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
            
            {renderLogoutModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 8,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verificationText: {
        fontSize: 12,
        color: COLORS.primary,
        marginLeft: 4,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    optionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledOption: {
        opacity: 0.5,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 14,
        color: COLORS.gray,
    },
    disabledText: {
        color: '#999',
    },
    optionRight: {
        alignItems: 'center',
    },
    logoutContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.red,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.red,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 30,
        marginHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIcon: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: COLORS.gray,
        paddingVertical: 15,
        borderRadius: 10,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flex: 1,
        backgroundColor: COLORS.red,
        paddingVertical: 15,
        borderRadius: 10,
        marginLeft: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;