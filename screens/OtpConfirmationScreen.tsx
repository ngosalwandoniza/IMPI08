import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RESEND_INTERVAL = 60; // seconds

const OtpConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  const handleVerify = async () => {
    console.log('handleVerify called');
    console.log('Email:', email, 'OTP:', otp);
    setLoading(true);
    try {
      const response = await fetch('http://10.228.195.3:8000/api/accounts/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (response.ok) {
        Alert.alert(
          'Success',
          'OTP verified! Please login with your email and password.',
          [
            { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] }) }
          ] as never
        );
      } else {
        Alert.alert('Error', data?.non_field_errors?.[0] || data?.detail || data?.email?.[0] || 'Invalid OTP');
      }
    } catch (error) {
      console.log('Network error:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('http://10.228.195.3:8000/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: '', password: '' }), // Only email is needed for resend
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('OTP resent!', 'A new OTP has been sent to your email.');
        setTimer(RESEND_INTERVAL);
      } else {
        Alert.alert('Error', data?.detail || 'Could not resend OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the OTP sent to</Text>
      <Text style={styles.email}>{email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, (loading || otp.length !== 6) && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
      </TouchableOpacity>
      <View style={styles.resendContainer}>
        <TouchableOpacity
          style={[styles.resendButton, timer > 0 && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          <Text style={styles.resendText}>{resending ? 'Resending...' : 'Resend OTP'}</Text>
        </TouchableOpacity>
        {timer > 0 && <Text style={styles.timerText}>Resend available in {timer}s</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, marginBottom: 8, textAlign: 'center', fontWeight: 'bold', color: '#222' },
  email: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#555' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, width: '80%', marginBottom: 20, fontSize: 18, backgroundColor: '#fff', textAlign: 'center', letterSpacing: 8 },
  button: { backgroundColor: '#007bff', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 8, marginBottom: 20, alignItems: 'center', width: '80%' },
  buttonDisabled: { backgroundColor: '#b0c4de' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resendContainer: { flexDirection: 'column', alignItems: 'center', marginTop: 10 },
  resendButton: { padding: 10 },
  resendText: { color: '#007bff', fontSize: 16, fontWeight: '600' },
  timerText: { color: '#888', fontSize: 14, marginTop: 4 },
});

export default OtpConfirmationScreen; 