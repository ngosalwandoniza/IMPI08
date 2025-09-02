import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

export interface AutoLogoutConfig {
  timeoutMinutes: number;
  enabled: boolean;
}

export class AutoLogoutService {
  private static readonly AUTO_LOGOUT_CONFIG_KEY = 'auto_logout_config';
  private static readonly LAST_ACTIVITY_KEY = 'last_activity';
  private static readonly DEFAULT_TIMEOUT = 15; // Changed from 3 to 15 minutes

  private static timer: NodeJS.Timeout | null = null;
  private static logoutCallback: (() => void) | null = null;
  private static isActive = true;

  /**
   * Initialize auto-logout service
   */
  static async initialize(logoutCallback: () => void): Promise<void> {
    this.logoutCallback = logoutCallback;
    
    // Listen to app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
    
    // Start activity tracking
    this.startActivityTracking();
    
    // Start the timer
    await this.resetTimer();
  }

  /**
   * Cleanup auto-logout service
   */
  static cleanup(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // Note: AppState.removeEventListener is deprecated, but we'll keep it for cleanup
    // In newer versions, the listener is automatically cleaned up
    this.logoutCallback = null;
  }

  /**
   * Get auto-logout configuration
   */
  static async getConfig(): Promise<AutoLogoutConfig> {
    // Temporarily disable auto-logout for development
    return {
      timeoutMinutes: this.DEFAULT_TIMEOUT,
      enabled: false
    };
    /*
    try {
      const configJson = await AsyncStorage.getItem(this.AUTO_LOGOUT_CONFIG_KEY);
      if (configJson) {
        return JSON.parse(configJson);
      }
    } catch (error) {
      console.log('Error getting auto-logout config:', error);
    }
    // Return default config
    return {
      timeoutMinutes: this.DEFAULT_TIMEOUT,
      enabled: true
    };
    */
  }

  /**
   * Update auto-logout configuration
   */
  static async updateConfig(config: Partial<AutoLogoutConfig>): Promise<boolean> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      await AsyncStorage.setItem(this.AUTO_LOGOUT_CONFIG_KEY, JSON.stringify(newConfig));
      
      // Reset timer with new config
      await this.resetTimer();
      return true;
    } catch (error) {
      console.log('Error updating auto-logout config:', error);
      return false;
    }
  }

  /**
   * Record user activity
   */
  static async recordActivity(): Promise<void> {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(this.LAST_ACTIVITY_KEY, timestamp.toString());
      console.log('Activity recorded at:', new Date(timestamp).toLocaleTimeString());
      
      // Reset timer on activity
      await this.resetTimer();
    } catch (error) {
      console.log('Error recording activity:', error);
    }
  }

  /**
   * Get last activity timestamp
   */
  static async getLastActivity(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(this.LAST_ACTIVITY_KEY);
      return timestamp ? parseInt(timestamp) : Date.now();
    } catch (error) {
      console.log('Error getting last activity:', error);
      return Date.now();
    }
  }

  /**
   * Start activity tracking
   */
  private static startActivityTracking(): void {
    // Record initial activity
    this.recordActivity();
    
    // Set up touch listener (this will be called from components)
    // Components should call recordActivity() on user interactions
  }

  /**
   * Reset the auto-logout timer
   */
  private static async resetTimer(): Promise<void> {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Get current config
    const config = await this.getConfig();
    if (!config.enabled) {
      console.log('Auto-logout disabled');
      return;
    }

    // Calculate timeout in milliseconds
    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    console.log(`Auto-logout timer set for ${config.timeoutMinutes} minutes (${timeoutMs}ms)`);

    // Set new timer
    this.timer = setTimeout(async () => {
      if (this.isActive && this.logoutCallback) {
        console.log('Auto-logout triggered due to inactivity');
        await this.performLogout();
      }
    }, timeoutMs);
  }

  /**
   * Handle app state changes
   */
  private static handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'active') {
      this.isActive = true;
      this.recordActivity();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      this.isActive = false;
      // Don't reset timer when app goes to background
      // Timer will continue running
    }
  };

  /**
   * Perform logout
   */
  private static async performLogout(): Promise<void> {
    try {
      // Clear authentication token
      await AsyncStorage.removeItem('authToken');
      
      // Clear last activity
      await AsyncStorage.removeItem(this.LAST_ACTIVITY_KEY);
      
      // Call logout callback
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    } catch (error) {
      console.log('Error during auto-logout:', error);
    }
  }

  /**
   * Get remaining time before auto-logout
   */
  static async getRemainingTime(): Promise<number> {
    try {
      const config = await this.getConfig();
      if (!config.enabled) {
        return -1; // Disabled
      }

      const lastActivity = await this.getLastActivity();
      const timeoutMs = config.timeoutMinutes * 60 * 1000;
      const elapsed = Date.now() - lastActivity;
      const remaining = timeoutMs - elapsed;

      return Math.max(0, remaining);
    } catch (error) {
      console.log('Error getting remaining time:', error);
      return 0;
    }
  }

  /**
   * Check if user is about to be logged out (within 30 seconds)
   */
  static async isAboutToLogout(): Promise<boolean> {
    const remaining = await this.getRemainingTime();
    return remaining > 0 && remaining <= 30000; // 30 seconds
  }
} 