import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';
import { getAuthToken } from './LoginScreen';

const PROVIDERS = [
  {
    id: 1,
    label: 'Airtel',
    icon: require('../assets/icons/airtel.png'),
    color: '#FF0000'
  },
  {
    id: 2,
    label: 'MTN',
    icon: require('../assets/icons/mtn.jpg'),
    color: '#FFD700'
  },
  {
    id: 3,
    label: 'Zamtel',
    icon: require('../assets/icons/zamtel.jpeg'),
    color: '#0066CC'
  }
];

interface LinkAccountScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

export default function LinkAccountScreen({ navigation }: LinkAccountScreenProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const codeInputs = useRef<React.RefObject<TextInput | null>[]>(
    Array.from({ length: 6 }, () => React.createRef<TextInput>(null))
  );
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLinkedAccounts = async () => {
        const token = await getAuthToken();
        if (!token) return;
        try {
          const response = await fetch('http://10.228.195.3:8000//api/linked-accounts/', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setLinkedAccounts(data);
          }
        } catch {}
      };
      fetchLinkedAccounts();
    }, [])
  );

  const handleLinkAccount = async () => {
    if (!selectedProvider || !phone || !accountName) {
      Alert.alert('Error', 'Please fill all fields and select a provider.');
      return;
    }
    setLoading(true);
    try {
      const token = await getAuthToken();
      console.log('JWT token being sent:', token);
      if (!token || token.split('.').length !== 3) {
        Alert.alert('Error', 'Authentication token missing or invalid. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://10.228.195.3:8000/api/link-account/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          phone,
          account_name: accountName,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(true);
      } else {
        Alert.alert('Error', data.detail || Object.values(data)[0][0] || 'Failed to link account.');
      }
    } catch (error) {
      const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Network error.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, idx: number) => {
    if (/^\d?$/.test(text)) {
      const newCode = [...code];
      newCode[idx] = text;
      setCode(newCode);
      // Move to next input if not last and text entered
      if (text && idx < 5) {
        codeInputs.current[idx + 1]?.current?.focus();
      }
      // Move to previous input if deleted
      if (!text && idx > 0) {
        codeInputs.current[idx - 1]?.current?.focus();
      }
    }
  };

  const handleConfirm = async () => {
    if (code.join('').length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const token = await getAuthToken();
      console.log('JWT token being sent:', token);
      if (!token || token.split('.').length !== 3) {
        Alert.alert('Error', 'Authentication token missing or invalid. Please log in again.');
        setLoading(false);
        return;
      }
      const response = await fetch('http://10.228.195.3:8000/api/confirm-link-account/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          phone,
          otp: code.join(''),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowModal(false);
        Alert.alert('Success', 'Account linked successfully!');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error', data.detail || Object.values(data)[0][0] || 'Invalid OTP.');
      }
    } catch (error) {
      const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Network error.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { marginTop: 32 }]}>Link Mobile Money Account</Text>
        <Text style={styles.subtitle}>Select your provider</Text>
        <View style={styles.row}>
          {PROVIDERS.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.iconContainer,
                selectedProvider === provider.label && styles.selected
              ]}
              onPress={() => setSelectedProvider(provider.label)}
            >
              <Image source={provider.icon} style={styles.icon} />
              <Text style={[
                styles.label,
                selectedProvider === provider.label && styles.selectedLabel
              ]}>
                {provider.label}
              </Text>
              {selectedProvider === provider.label && (
                <Text style={styles.checkmark}>✔</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.subtitle}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
        />
        <Text style={styles.subtitle}>Account Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter account name"
          value={accountName}
          onChangeText={setAccountName}
          maxLength={40}
        />
        <TouchableOpacity
          style={[
            styles.linkButton,
            (!selectedProvider || !phone || !accountName) && styles.disabledButton
          ]}
          onPress={handleLinkAccount}
          disabled={!selectedProvider || !phone || !accountName || loading}
        >
          <Text style={styles.linkButtonText}>
            {loading ? 'Linking...' : 'Link Account'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Confirmation Code</Text>
              <View style={styles.codeRow}>
                {[0,1,2,3,4,5].map((idx) => (
                  <TextInput
                    key={idx}
                    ref={codeInputs.current[idx]}
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={code[idx]}
                    onChangeText={text => handleCodeChange(text, idx)}
                    autoFocus={idx === 0}
                    returnKeyType="next"
                  />
                ))}
              </View>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        {/* Linked Accounts List */}
        {linkedAccounts.length > 0 && (
          <View style={{ width: '100%', marginBottom: 20 }}>
            <Text style={styles.subtitle}>Your Linked Accounts</Text>
            {linkedAccounts.map((acc, idx) => (
              <View key={idx} style={{ padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8, backgroundColor: acc.is_confirmed ? '#e0ffe0' : '#fffbe0' }}>
                <Text style={{ fontWeight: 'bold' }}>{acc.provider} - {acc.phone}</Text>
                <Text style={{ color: acc.is_confirmed ? 'green' : 'orange' }}>{acc.is_confirmed ? 'Confirmed' : 'Pending Confirmation'}</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{acc.account_name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { 
    flexGrow: 1, 
    padding: 24, 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: COLORS.black 
  },
  subtitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginTop: 18, 
    marginBottom: 8, 
    color: COLORS.black, 
    alignSelf: 'flex-start' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 16, 
    width: '100%' 
  },
  iconContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    minWidth: 80,
    minHeight: 100,
    position: 'relative',
    marginHorizontal: 6,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: { 
    width: 48, 
    height: 48, 
    marginBottom: 8 
  },
  label: { 
    fontSize: 14, 
    color: COLORS.black 
  },
  selectedLabel: { 
    fontWeight: 'bold', 
    color: COLORS.primary 
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 12,
    color: COLORS.black,
  },
  linkButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  linkButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.black,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});