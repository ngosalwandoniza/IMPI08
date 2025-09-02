import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AuthService from '../services/AuthService';
import { BiometricAuthService } from '../services/BiometricAuth';

const { width } = Dimensions.get('window');

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem('authToken', token);
}
export async function getAuthToken() {
  return await AsyncStorage.getItem('authToken');
}

const LoginScreen = () => {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  const authService = AuthService.getInstance();

  useEffect(() => {
    checkBiometricAvailability();
    checkAutoLogin();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await BiometricAuthService.isBiometricAvailable();
    const enabled = await BiometricAuthService.isBiometricEnabled();
    setBiometricAvailable(available);
    setBiometricEnabled(enabled);
  };

  const checkAutoLogin = async () => {
    try {
      const canAutoLogin = await authService.checkAutoLogin();
      if (canAutoLogin) {
        // Auto-login successful, navigate to main app
        (navigation as any).reset({ 
          index: 0, 
          routes: [{ name: 'MainTabs' }] 
        });
      }
    } catch (error) {
      console.log('Auto-login check failed:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Starting login process...');
      const response = await authService.login(identifier, password);
      console.log('Login successful:', response);
      
      // Navigate to main app
      console.log('Navigating to MainTabs...');
      (navigation as any).reset({ 
        index: 0, 
        routes: [{ name: 'MainTabs', params: { email: response.user.email } }] 
      });
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      console.log('Starting biometric authentication...');
      const credentials = await BiometricAuthService.authenticateWithBiometric();
      
      if (credentials && credentials.username && credentials.password) {
        console.log('Biometric authentication successful, credentials retrieved');
        console.log('Username:', credentials.username);
        console.log('Password length:', credentials.password.length);
        
        // Use stored credentials to login
        setIdentifier(credentials.username);
        setPassword(credentials.password);
        
        // Call the login function directly
        const response = await authService.login(credentials.username, credentials.password);
        console.log('Biometric login successful:', response);
        
        // Navigate to main app
        (navigation as any).reset({ 
          index: 0, 
          routes: [{ name: 'MainTabs', params: { email: response.user.email } }] 
        });
      } else {
        console.log('Biometric authentication failed or no credentials found');
        Alert.alert('Biometric Login Failed', 'Please try again or use password login.');
      }
    } catch (error) {
      console.log('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please use password login.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricSetup = async () => {
    if (!identifier || !password) {
      Alert.alert('Setup Required', 'Please enter your username and password first to enable biometric login.');
      return;
    }

    setLoading(true);
    try {
      // First try to login to verify credentials
      console.log('Verifying credentials for biometric setup...');
      const response = await authService.login(identifier, password);
      
      if (response && response.access) {
        // Credentials are valid, now setup biometric
        const success = await BiometricAuthService.enableBiometric({
          username: identifier,
          password: password
        });
        
        if (success) {
          setBiometricEnabled(true);
          // Update settings
          await authService.updateUserSettings({ biometric_enabled: true });
          Alert.alert('Success', 'Biometric login has been enabled! You can now use fingerprint to login.');
          
          // Navigate to main app since login was successful
          (navigation as any).reset({ 
            index: 0, 
            routes: [{ name: 'MainTabs', params: { email: response.user.email } }] 
          });
        } else {
          Alert.alert('Setup Failed', 'Failed to enable biometric login. Please try again.');
        }
      } else {
        Alert.alert('Invalid Credentials', 'Please check your username and password.');
      }
    } catch (error) {
      console.log('Biometric setup error:', error);
      Alert.alert('Setup Failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Login to Impiy</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          placeholderTextColor="#999"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.forgotButton} onPress={() => {}}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {/* Biometric Login Button */}
        {biometricAvailable && biometricEnabled && (
          <TouchableOpacity 
            style={styles.biometricButton} 
            onPress={handleBiometricLogin}
            disabled={loading}
          >
            <Image 
              source={require('../assets/icons/fingerprint.png')}
              style={styles.biometricIcon}
              resizeMode="contain"
              tintColor="#27ae60"
            />
            <Text style={styles.biometricButtonText}>
              {loading ? 'Authenticating...' : 'Login with Fingerprint'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Biometric Setup Button */}
        {biometricAvailable && !biometricEnabled && (
          <View style={styles.biometricSetupContainer}>
            <TouchableOpacity 
              style={styles.biometricSetupButton} 
              onPress={handleBiometricSetup}
              disabled={loading}
            >
              <Image 
                source={require('../assets/icons/fingerprint.png')}
                style={styles.biometricSetupIcon}
                resizeMode="contain"
                tintColor="#27ae60"
              />
              <Text style={styles.biometricSetupText}>
                {loading ? 'Setting up...' : 'Enable Fingerprint Login'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.biometricSetupHint}>
              Enter your credentials above, then tap to enable fingerprint login
            </Text>
          </View>
        )}

        {!biometricAvailable && (
          <Text style={styles.biometricNotAvailableText}>
            Fingerprint login not available on this device
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 2,
  },
  backButtonText: {
    color: '#27ae60',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 36,
    letterSpacing: 1,
  },
  input: {
    width: width * 0.8,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 22,
    color: '#333',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginRight: width * 0.1,
    marginBottom: 18,
  },
  forgotText: {
    color: '#27ae60',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    width: width * 0.8,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  biometricButton: {
    width: width * 0.8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  biometricIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    color: '#27ae60',
  },
  biometricButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricSetupButton: {
    width: width * 0.8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricSetupIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  biometricSetupText: {
    color: '#27ae60',
    fontSize: 15,
    fontWeight: '600',
  },
  biometricSetupHint: {
    color: '#999',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  biometricSetupContainer: {
    width: width * 0.8,
    alignItems: 'center',
    marginTop: 15,
  },
  biometricNotAvailableText: {
    color: '#999',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#555',
    fontSize: 15,
  },
  signupText: {
    color: '#27ae60',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default LoginScreen; 