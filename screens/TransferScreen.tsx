import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/theme';
import { getAuthToken } from './LoginScreen';
interface TransferScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

export default function TransferScreen({ navigation }: TransferScreenProps) {
  const [showNormalTransfer, setShowNormalTransfer] = useState(false);
  const [showQRTransfer, setShowQRTransfer] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [qrAmount, setQrAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  const [qrStatus, setQrStatus] = useState<'active' | 'used' | 'expired' | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleNormalTransfer = async () => {
    if (!walletId || !amount) {
      Alert.alert('Error', 'Please fill all fields');2
      return;
    }
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        return;
      }
      const response = await fetch('http://10.228.195.3:8000/api/wallet/transfer/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_wallet_id: walletId,
          amount: amount,
          description: 'Transfer from app',
        }),
      });
      const text = await response.text();
      console.log('Transfer response status:', response.status);
      console.log('Transfer response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert('Error', 'Server did not return valid JSON. See console for details.');
        console.log('Transfer error: Not JSON:', text);
        return;
      }
      if (response.ok && data.success) {
        Alert.alert('Success', `Sent ${amount} to ${walletId}\nFee: ${data.transaction.fee}\nTotal: ${data.transaction.total_deducted}`);
        setWalletId('');
        setAmount('');
        setShowNormalTransfer(false);
      } else {
        Alert.alert('Error', data.error || 'Transfer failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network or server error');
      console.log('Transfer error', e);
    }
  };

  // New: Generate QR code from backend
  const handleQRTransfer = async () => {
    if (!qrAmount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }
    setQrLoading(true);
    setQrError('');
    try {
      const token = await getAuthToken();
      const response = await fetch('http://10.228.195.3:8000/api/wallet/qr/generate/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: qrAmount }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setQrData(JSON.stringify(data.qr_data));
        setShowQR(true);
        setQrExpiry(Date.parse(data.qr_data.expires_at));
        setQrStatus('active');
        // Optionally: start polling for status
      } else {
        setQrError(data.error || 'Failed to generate QR');
      }
    } catch (e) {
      setQrError('Network error');
    }
    setQrLoading(false);
  };

  // New: Poll QR status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQR && qrData) {
      interval = setInterval(async () => {
        try {
          const token = await getAuthToken();
          const qrObj = JSON.parse(qrData);
          const response = await fetch('http://10.228.195.3:8000/api/wallet/qr/status/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qr_id: qrObj.qr_id }),
          });
          const data = await response.json();
          if (data.success) {
            if (data.status.is_used) setQrStatus('used');
            else if (data.status.is_expired) setQrStatus('expired');
          }
        } catch {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showQR, qrData]);

  const closeQRModal = () => {
    setShowQR(false);
    setQrAmount('');
    setQrData('');
    setShowQRTransfer(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch('http://10.228.195.3:8000/api/wallet/qr/scan/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_data: paymentData, // should be the parsed QR JSON object
          password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Payment sent!');
        setModalVisible(false);
        setScanned(false);
        setPaymentData(null);
        setPassword('');
      } else {
        Alert.alert('Error', data.error || 'Payment failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Transfer Money</Text>
        <Text style={styles.subtitle}>Choose your transfer method</Text>
        
        <TouchableOpacity
          style={styles.transferOption}
          onPress={() => setShowNormalTransfer(true)}
        >
          <Text style={styles.optionTitle}>Normal Transfer</Text>
          <Text style={styles.optionSubtitle}>Send to any wallet ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.transferOption}
          onPress={() => setShowQRTransfer(true)}
        >
          <Text style={styles.optionTitle}>QR Code Transfer</Text>
          <Text style={styles.optionSubtitle}>Generate QR for nearby transfer</Text>
        </TouchableOpacity>

        {/* Normal Transfer Modal */}
        <Modal
          visible={showNormalTransfer}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNormalTransfer(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <Text style={styles.inputLabel}>Recipient Wallet ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter wallet ID"
                value={walletId}
                onChangeText={setWalletId}
              />
              <Text style={styles.inputLabel}>Amount (ZMW)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowNormalTransfer(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.sendButton]}
                  onPress={handleNormalTransfer}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* QR Transfer Modal */}
        <Modal
          visible={showQRTransfer}
          transparent
          animationType="slide"
          onRequestClose={closeQRModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {!showQR ? (
                <>
                  <Text style={styles.modalTitle}>Generate QR Code</Text>
                  <Text style={styles.inputLabel}>Amount to Receive (ZMW)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={qrAmount}
                    onChangeText={setQrAmount}
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={closeQRModal}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.sendButton]}
                      onPress={handleQRTransfer}
                    >
                      <Text style={styles.sendButtonText}>Generate QR</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Show this QR to the sender</Text>
                  {qrLoading ? (
                    <ActivityIndicator />
                  ) : qrError ? (
                    <Text style={{ color: 'red' }}>{qrError}</Text>
                  ) : (
                    <>
                      <View style={styles.qrPlaceholder}>
                        <QRCode value={qrData} size={180} />
                      </View>
                      <Text>
                        {qrStatus === 'active'
                          ? `Expires in ${Math.max(0, Math.floor((qrExpiry! - Date.now()) / 1000))}s`
                          : qrStatus === 'used'
                          ? 'Payment received!'
                          : 'QR expired'}
                      </Text>
                    </>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.sendButton, { marginTop: 12 }]}
                    onPress={closeQRModal}
                  >
                    <Text style={styles.sendButtonText}>Done</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  transferOption: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 16,
    color: '#333',
  },
  qrPlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});