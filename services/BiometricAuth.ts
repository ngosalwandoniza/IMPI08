import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export interface BiometricCredentials {
  username: string;
  password: string;
}

export class BiometricAuthService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private static readonly BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

  /**
   * Check if device supports biometric authentication
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.log('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  static async getSupportedBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.log('Error getting supported biometric types:', error);
      return [];
    }
  }

  /**
   * Check if biometric login is enabled for the user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.log('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Enable biometric login for the user
   */
  static async enableBiometric(credentials: BiometricCredentials): Promise<boolean> {
    try {
      // First authenticate with biometric to ensure it's working
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (authResult.success) {
        // Store credentials securely
        await SecureStore.setItemAsync(
          this.BIOMETRIC_CREDENTIALS_KEY,
          JSON.stringify(credentials)
        );
        await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error enabling biometric:', error);
      return false;
    }
  }

  /**
   * Disable biometric login
   */
  static async disableBiometric(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(this.BIOMETRIC_CREDENTIALS_KEY);
      await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'false');
      return true;
    } catch (error) {
      console.log('Error disabling biometric:', error);
      return false;
    }
  }

  /**
   * Authenticate with biometric and return stored credentials
   */
  static async authenticateWithBiometric(): Promise<BiometricCredentials | null> {
    try {
      // Check if biometric is enabled
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      // Authenticate with biometric
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometric',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
      });

      if (authResult.success) {
        // Retrieve stored credentials
        const credentialsJson = await SecureStore.getItemAsync(this.BIOMETRIC_CREDENTIALS_KEY);
        if (credentialsJson) {
          return JSON.parse(credentialsJson) as BiometricCredentials;
        }
      }
      return null;
    } catch (error) {
      console.log('Error authenticating with biometric:', error);
      return null;
    }
  }

  /**
   * Update stored credentials (when user changes password)
   */
  static async updateCredentials(credentials: BiometricCredentials): Promise<boolean> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (isEnabled) {
        await SecureStore.setItemAsync(
          this.BIOMETRIC_CREDENTIALS_KEY,
          JSON.stringify(credentials)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error updating biometric credentials:', error);
      return false;
    }
  }
} 