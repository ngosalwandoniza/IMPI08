import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  biometric_enabled: boolean;
  auto_login_enabled: boolean;
  session_timeout_minutes: number;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'fr' | 'es';
}

export interface User {
  email: string;
  username: string;
  full_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentSettings: UserSettings | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // JWT Token Management
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async clearAuthToken(): Promise<void> {
    this.currentUser = null;
    this.currentSettings = null;
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userSettings');
  }

  // User Data Management
  async setUserData(user: User): Promise<void> {
    this.currentUser = user;
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  }

  async getUserData(): Promise<User | null> {
    if (!this.currentUser) {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
    return this.currentUser;
  }

  // Settings Management (simplified - just local storage for now)
  async setUserSettings(settings: UserSettings): Promise<void> {
    this.currentSettings = settings;
    await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
  }

  async getUserSettings(): Promise<UserSettings | null> {
    if (!this.currentSettings) {
      const settingsData = await AsyncStorage.getItem('userSettings');
      if (settingsData) {
        this.currentSettings = JSON.parse(settingsData);
      }
    }
    return this.currentSettings;
  }

  // Login Function - using original JWT API
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const urls = [
      'http://10.228.195.3:8000/api/token/',
    ];

    let lastError = null;
    for (const url of urls) {
      try {
        console.log('Attempting login to:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier, password }),
        });

        console.log('Login response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Login response data:', data);
          
          // Store JWT token
          if (data.access) {
            await this.setAuthToken(data.access);
            console.log('JWT token stored successfully');
          } else {
            throw new Error('No access token in response');
          }
          
          // Create user object from identifier if not provided
          const user: User = data.user || {
            email: identifier,
            username: identifier,
            full_name: identifier
          };
          
          // Store user data
          await this.setUserData(user);
          console.log('User data stored:', user);
          
          // Create default settings if none exist
          const existingSettings = await this.getUserSettings();
          if (!existingSettings) {
            const defaultSettings: UserSettings = {
              biometric_enabled: false,
              auto_login_enabled: false,
              session_timeout_minutes: 3,
              notifications_enabled: true,
              email_notifications: true,
              push_notifications: true,
              theme: 'light',
              language: 'en'
            };
            await this.setUserSettings(defaultSettings);
            console.log('Default settings created');
          }

          return {
            access: data.access,
            refresh: data.refresh || '',
            user: user
          };
        } else {
          const errorData = await response.json();
          console.log('Login error response:', errorData);
          lastError = errorData;
        }
      } catch (err) {
        console.log('Login request error:', err);
        lastError = err;
      }
    }

    throw new Error(lastError?.detail || lastError?.non_field_errors?.[0] || 'Login failed');
  }

  // Logout Function - simplified
  async logout(): Promise<void> {
    // Just clear local data - no backend call needed for JWT
    await this.clearAuthToken();
  }

  // Auto-login Check - simplified
  async checkAutoLogin(): Promise<boolean> {
    const token = await this.getAuthToken();
    const settings = await this.getUserSettings();
    
    if (!token || !settings?.auto_login_enabled) {
      return false;
    }

    // For JWT, we just check if token exists and auto-login is enabled
    return true;
  }

  // Update User Settings - simplified (local storage only)
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings();
    const updatedSettings: UserSettings = {
      biometric_enabled: false,
      auto_login_enabled: false,
      session_timeout_minutes: 3,
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      theme: 'light',
      language: 'en',
      ...currentSettings,
      ...settings
    };
    
    await this.setUserSettings(updatedSettings);
    return updatedSettings;
  }

  // Get current auth info
  getCurrentAuth() {
    return {
      user: this.currentUser,
      settings: this.currentSettings,
    };
  }
}

export default AuthService; 