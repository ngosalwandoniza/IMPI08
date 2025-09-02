import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SIZES } from '../constants';

interface TopUpScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface Provider {
  id: string;
  name: string;
  logo: any;
  color: string;
}

const providers: Provider[] = [
  { id: 'mtn', name: 'MTN', logo: require('../assets/icons/mtn.jpg'), color: '#FFD700' },
  { id: 'airtel', name: 'Airtel', logo: require('../assets/icons/airtel.png'), color: '#FF0000' },
  { id: 'zamtel', name: 'Zamtel', logo: require('../assets/icons/zamtel.jpeg'), color: '#0066CC' },
];

const TopUpScreen = ({ navigation }: TopUpScreenProps) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPeerModal, setShowPeerModal] = useState(false);
  const [peerPhone, setPeerPhone] = useState('');
  const [peerName, setPeerName] = useState('');
  const [purchaseMode, setPurchaseMode] = useState<'self' | 'peer' | null>(null);

  const predefinedAmounts = ['5', '10', '20', '50', '100', '200'];

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount('');
  };

  const getFinalAmount = () => {
    return customAmount || amount;
  };

  const validateInputs = () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a network provider');
      return false;
    }
    if (purchaseMode !== 'self' && !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }
    if (!getFinalAmount()) {
      Alert.alert('Error', 'Please select or enter an amount');
      return false;
    }
    return true;
  };

  const handleBuyForSelf = () => {
    setPurchaseMode('self');
    if (!validateInputs()) return;
    
    Alert.alert(
      'Confirm Purchase',
      `Buy ${selectedProvider?.name} airtime worth ZMW ${getFinalAmount()} for yourself?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', `Airtime purchase successful! ZMW ${getFinalAmount()} airtime has been added to your account`);
            // Reset form
            setPhoneNumber('');
            setAmount('');
            setCustomAmount('');
            setPurchaseMode(null);
          }
        }
      ]
    );
  };

  const handleSendToPeer = () => {
    setPurchaseMode('peer');
    if (!validateInputs()) return;
    setShowPeerModal(true);
  };

  const handlePeerPurchase = () => {
    if (!peerPhone.trim() || !peerName.trim()) {
      Alert.alert('Error', 'Please enter both phone number and name');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Send ${selectedProvider?.name} airtime worth ZMW ${getFinalAmount()} to ${peerName} (${peerPhone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            Alert.alert('Success', `Airtime sent successfully to ${peerName}!`);
            setShowPeerModal(false);
            setPeerPhone('');
            setPeerName('');
            setPhoneNumber('');
            setAmount('');
            setCustomAmount('');
            setPurchaseMode(null);
          }
        }
      ]
    );
  };

  const handleGenerateQR = () => {
    if (!validateInputs()) return;
    setShowQRModal(true);
  };

  const generateQRData = () => {
    const data = {
      type: 'airtime',
      provider: selectedProvider?.id,
      phoneNumber: phoneNumber,
      amount: getFinalAmount(),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Airtime</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Providers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Network Provider</Text>
          <View style={styles.providersContainer}>
            {providers.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  selectedProvider?.id === provider.id && styles.selectedProvider,
                ]}
                onPress={() => handleProviderSelect(provider)}
              >
                <Image source={provider.logo} style={styles.providerLogo} resizeMode="contain" />
                <Text style={styles.providerName}>{provider.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phone Number Section - Hide when buying for self */}
        {purchaseMode !== 'self' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number (e.g., 0977123456)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        )}

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount (ZMW)</Text>
          <View style={styles.amountsContainer}>
            {predefinedAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountButton,
                  amount === amt && styles.selectedAmount,
                ]}
                onPress={() => handleAmountSelect(amt)}
              >
                <Text style={[
                  styles.amountText,
                  amount === amt && styles.selectedAmountText,
                ]}>
                  {amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Or Enter Custom Amount</Text>
          <TextInput
            style={styles.customAmountInput}
            placeholder="Enter custom amount"
            value={customAmount}
            onChangeText={handleCustomAmountChange}
            keyboardType="numeric"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBuyForSelf}>
            <Text style={styles.actionButtonText}>Buy for Myself</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleSendToPeer}>
            <Text style={styles.secondaryButtonText}>Send to Someone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.tertiaryButton]} onPress={handleGenerateQR}>
            <Text style={styles.tertiaryButtonText}>Generate QR Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Peer Purchase Modal */}
      <Modal
        visible={showPeerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Airtime to Someone</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Recipient's Name"
              value={peerName}
              onChangeText={setPeerName}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Recipient's Phone Number"
              value={peerPhone}
              onChangeText={setPeerPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowPeerModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handlePeerPurchase}
              >
                <Text style={styles.confirmButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code for Airtime</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={generateQRData()}
                size={180}
                color="black"
                backgroundColor="white"
              />
            </View>
            
            <Text style={styles.qrInfo}>
              {selectedProvider?.name} Airtime - ZMW {getFinalAmount()}
            </Text>
            {purchaseMode === 'peer' && (
              <Text style={styles.qrInfo}>
                Phone: {phoneNumber}
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton, { width: '100%' }]} 
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.confirmButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  providersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  providerCard: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  selectedProvider: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f8ff',
  },
  providerLogo: {
    width: 35,
    height: 35,
    marginBottom: 6,
  },
  providerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  amountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountButton: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedAmount: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedAmountText: {
    color: '#fff',
  },
  customAmountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  actionsContainer: {
    padding: SIZES.padding,
    gap: 10,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: '#17a2b8',
  },
  tertiaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 20,
    width: '90%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  qrInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
});

export default TopUpScreen; 