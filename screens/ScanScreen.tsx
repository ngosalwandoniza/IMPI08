import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, images, SIZES } from '../constants';
import { getAuthToken } from './LoginScreen';

interface ScanScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

const ScanScreen = ({ navigation }: ScanScreenProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<{ amount: string; walletId: string } | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrObject, setQrObject] = useState<any>(null); // Store full QR object
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (type !== 'qr') return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      // Check for backend QR format
      if (parsed.qr_id && parsed.wallet_id && parsed.amount) {
        setQrObject(parsed);
        setPaymentData({ walletId: parsed.wallet_id, amount: parsed.amount });
        setModalVisible(true);
      } else {
        alert('Invalid QR code for payment.');
        setScanned(false);
      }
    } catch (e) {
      alert('Invalid QR code format.');
      setScanned(false);
    }
  };

  const handleConfirm = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    setLoading(true);
    try {
      // Assuming getAuthToken is a function that fetches the token
      // const token = await getAuthToken(); 
      // For now, using a placeholder token
      const token = await getAuthToken(); 
      const response = await fetch('http://10.228.195.3:8000/api/wallet/qr/scan/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qr_data: qrObject, // send the full QR object
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

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>{/* Optionally add a header here */}</View>
          <View style={styles.focusBox}>
            <Image
              source={images.focus}
              resizeMode="stretch"
              style={{ width: 300, height: 300 }}
            />
          </View>
        </View>
      </CameraView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalText}>Send <Text style={{ fontWeight: 'bold' }}>ZMW {paymentData?.amount}</Text> to</Text>
            <Text style={styles.modalText}>Wallet ID: <Text style={{ fontWeight: 'bold' }}>{paymentData?.walletId}</Text></Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, width: '100%', padding: 8 }}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} disabled={loading}>
              <Text style={styles.confirmButtonText}>{loading ? 'Processing...' : 'Confirm'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); setScanned(false); }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {scanned && (
        <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center' }}>
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: SIZES.padding * 4,
    alignItems: 'center',
  },
  focusBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  cancelButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanScreen;