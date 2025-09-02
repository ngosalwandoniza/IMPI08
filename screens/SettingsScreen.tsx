import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useActivityTracking } from '../hooks/useActivityTracking';
import AuthService, { UserSettings } from '../services/AuthService';
import { AutoLogoutService } from '../services/AutoLogoutService';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { recordActivity } = useActivityTracking();
  const authService = AuthService.getInstance();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('3');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await authService.getUserSettings();
      if (userSettings) {
        setSettings(userSettings);
        setSessionTimeout(userSettings.session_timeout_minutes.toString());
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    recordActivity();
    try {
      const updatedSettings = await authService.updateUserSettings({ [key]: value });
      setSettings(updatedSettings);
      
      // Update auto-logout config if session timeout changed
      if (key === 'session_timeout_minutes') {
        await AutoLogoutService.updateConfig({ timeoutMinutes: value });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleSessionTimeoutChange = async (value: string) => {
    const timeout = parseInt(value);
    if (timeout >= 1 && timeout <= 60) {
      setSessionTimeout(value);
      await updateSetting('session_timeout_minutes', timeout);
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value?: boolean,
    onValueChange?: (value: boolean) => void,
    showSwitch = false,
    showInput = false,
    inputValue?: string,
    onInputChange?: (value: string) => void,
    inputPlaceholder?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.settingControl}>
        {showSwitch && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#27ae60' }}
            thumbColor={value ? '#fff' : '#f4f3f4'}
          />
        )}
        {showInput && (
          <TextInput
            style={styles.timeoutInput}
            value={inputValue}
            onChangeText={onInputChange}
            placeholder={inputPlaceholder}
            keyboardType="numeric"
            maxLength={2}
          />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={["#e8f5e9", "#fff", "#e0f7fa"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#e8f5e9", "#fff", "#e0f7fa"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session & Security</Text>
          
          {renderSettingItem(
            'Auto Login',
            'Automatically log in when app starts',
            settings?.auto_login_enabled,
            (value) => updateSetting('auto_login_enabled', value),
            true
          )}
          
          {renderSettingItem(
            'Session Timeout',
            'Minutes of inactivity before auto-logout',
            undefined,
            undefined,
            false,
            true,
            sessionTimeout,
            handleSessionTimeoutChange,
            '3'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingItem(
            'Push Notifications',
            'Receive notifications on your device',
            settings?.push_notifications,
            (value) => updateSetting('push_notifications', value),
            true
          )}
          
          {renderSettingItem(
            'Email Notifications',
            'Receive notifications via email',
            settings?.email_notifications,
            (value) => updateSetting('email_notifications', value),
            true
          )}
          
          {renderSettingItem(
            'All Notifications',
            'Enable or disable all notifications',
            settings?.notifications_enabled,
            (value) => updateSetting('notifications_enabled', value),
            true
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              recordActivity();
              Alert.alert('Theme', 'Theme selection coming soon!');
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>
                Current: {settings?.theme || 'Light'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              recordActivity();
              Alert.alert('Language', 'Language selection coming soon!');
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingSubtitle}>
                Current: {settings?.language === 'en' ? 'English' : settings?.language}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              recordActivity();
              Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
              <Text style={styles.settingSubtitle}>Read our privacy policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              recordActivity();
              Alert.alert('Terms of Service', 'Terms of service coming soon!');
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
              <Text style={styles.settingSubtitle}>Read our terms of service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  timeoutInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    minWidth: 60,
    backgroundColor: '#fff',
  },
});

export default SettingsScreen; 