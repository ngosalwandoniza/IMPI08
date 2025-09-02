import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>impiy</Text>
          <View style={styles.tickCircle}>
            <Text style={styles.tick}>✔</Text>
          </View>
        </View>
        <Text style={styles.slogan}>Your trusted digital wallet</Text>
        {/* Buttons */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.buttonText, styles.signupButtonText]}>Sign Up</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: 2,
    textShadowColor: '#b2dfdb',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  tickCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tick: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  slogan: {
    fontSize: 20,
    color: '#388e3c',
    marginBottom: 48,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: '#e0f2f1',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    width: width * 0.7,
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signupButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#27ae60',
    marginBottom: 0,
  },
  signupButtonText: {
    color: '#27ae60',
  },
});

export default LandingScreen; 