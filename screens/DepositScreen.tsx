import * as ExpoDevice from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { getAuthToken } from './LoginScreen';

// Add zero-dependency JWT decoder
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const { width: screenWidth } = Dimensions.get('window');

const PROVIDERS = [
  {
    id: 1,
    label: 'Airtel',
    icon: require('../assets/icons/airtel.png'),
    color: '#FF0000',
    type: 'traditional'
  },
  {
    id: 2,
    label: 'MTN',
    icon: require('../assets/icons/mtn.jpg'),
    color: '#FFD700',
    type: 'traditional'
  },
  {
    id: 3,
    label: 'Zamtel',
    icon: require('../assets/icons/zamtel.jpeg'),
    color: '#0066CC',
    type: 'traditional'
  },
  {
    id: 4,
    label: 'P2P',
    icon: require('../assets/icons/p2p.webp'),
    color: '#28A745',
    type: 'mini-agent',
    description: 'Give cash to friends for digital money',
    fee: '1-2%',
    limit: 'ZMW 1000/day'
  }
];

interface DepositScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

export default function DepositScreen({ navigation }: DepositScreenProps) {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMiniAgentModal, setShowMiniAgentModal] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [bluetoothStatus, setBluetoothStatus] = useState('scanning');
  const [nearbyDevices, setNearbyDevices] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [scanningInterval, setScanningInterval] = useState<any>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  
  // New state variables for loading and transaction approval
  const [isLoading, setIsLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [approvalTimer, setApprovalTimer] = useState(0);
  const [statusCheckInterval, setStatusCheckInterval] = useState<any>(null);

  // Real nearby friends data - in production this would come from your backend
  const nearbyFriends = [
    { 
      id: 1, 
      name: 'John Doe', 
      deviceId: 'device_001',
      available: 500, 
      rating: 4.8,
      phoneNumber: '+260961234567',
      isOnline: true
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      deviceId: 'device_002',
      available: 300, 
      rating: 4.9,
      phoneNumber: '+260962345678',
      isOnline: true
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      deviceId: 'device_003',
      available: 800, 
      rating: 4.7,
      phoneNumber: '+260963456789',
      isOnline: false
    }
  ];

  useEffect(() => {
    requestLocationPermission();
    startProximityDetection();
    // Fetch linked accounts
    const fetchLinkedAccounts = async () => {
      const token = await getAuthToken();
      const response = await fetch('http://10.228.195.3:8000/api/linked-accounts/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data);
        console.log('Fetched linkedAccounts:', data);
      } else {
        console.log('Failed to fetch linked accounts:', response.status);
      }
    };
    fetchLinkedAccounts();
    
    const logUser = async () => {
      const token = await getAuthToken();
      if (token) {
        const decoded = parseJwt(token);
        if (decoded) {
          console.log('Logged in user (JWT):', decoded);
        } else {
          console.log('Could not decode JWT');
        }
      } else {
        console.log('No JWT token found, user not logged in');
      }
    };
    logUser();

    // Cleanup on unmount
    return () => {
      if (scanningInterval) {
        clearInterval(scanningInterval);
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High
        });
        setUserLocation(location.coords);
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  };

  const startProximityDetection = async () => {
    setBluetoothStatus('scanning');
    
    // Check if device supports Bluetooth
    if (!ExpoDevice.isDevice) {
      setBluetoothStatus('no_bluetooth');
      return;
    }

    // Start scanning for nearby devices2
    const interval = setInterval(async () => {
      await scanForNearbyFriends();
    }, 3000); // Scan every 3 seconds

    setScanningInterval(interval);
  };

  const scanForNearbyFriends = async () => {
    try {
      // In a real implementation, you would:
      // 1. Use expo-bluetooth to scan for nearby devices
      // 2. Check if any of those devices are running your app
      // 3. Get their device IDs and match with your friends list
      // 4. Calculate proximity using Bluetooth signal strength + GPS

      // For now, we'll simulate this with GPS + random proximity
      const availableFriends = nearbyFriends.filter(friend => {
        if (!friend.isOnline) return false;
        
        // Simulate Bluetooth proximity detection
        const isNearby = Math.random() > 0.7; // 30% chance of being nearby
        
        if (isNearby) {
          // Calculate approximate distance using GPS (if available)
          let distance = 'Unknown';
          if (userLocation) {
            // In real app, you'd get friend's location from your backend
            const mockFriendLocation = {
              latitude: userLocation.latitude + (Math.random() - 0.5) * 0.001,
              longitude: userLocation.longitude + (Math.random() - 0.5) * 0.001
            };
            
            const calculatedDistance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              mockFriendLocation.latitude,
              mockFriendLocation.longitude
            );
            
            distance = calculatedDistance <= 1 ? `${calculatedDistance.toFixed(1)}m` : 'Too far';
          }
          
          return distance !== 'Too far';
        }
        
        return false;
      });
      
      setNearbyDevices(availableFriends);
      setBluetoothStatus(availableFriends.length > 0 ? 'found' : 'no_devices');
      
    } catch (error) {
      console.log('Bluetooth scan error:', error);
      setBluetoothStatus('error');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleDeposit = async () => {
    console.log('Selected provider:', selectedProvider);
    console.log('All linkedAccounts:', linkedAccounts);
    if (selectedProvider?.type === 'mini-agent') {
      if (bluetoothStatus === 'no_devices') {
        Alert.alert('No Friends Nearby', 'No friends found within 1 meter. Please move closer to your friends or try traditional deposit.');
        return;
      }
      setShowMiniAgentModal(true);
    } else {
      // Traditional mobile money deposit
      if (!selectedProvider) {
        Alert.alert('Error', 'Please select a provider.');
        return;
      }
      const linked = linkedAccounts.find(acc => acc.provider === selectedProvider.label && acc.is_confirmed);
      console.log('Matched linked account:', linked);
      if (!linked) {
        Alert.alert('No linked account found', 'linkedAccounts: ' + JSON.stringify(linkedAccounts));
        return;
      }
      
      // Show confirmation dialog before proceeding
      Alert.alert(
        'Confirm Deposit',
        `Deposit ZMW ${amount} using ${selectedProvider.label}?\n\nLinked Number: ${linked.phone}\nProvider: ${selectedProvider.label}\nAmount: ZMW ${amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: () => proceedWithDeposit(linked)
          }
        ]
      );
    }
  };

  const proceedWithDeposit = async (linked: any) => {
    try {
      setIsLoading(true);
      setTransactionStatus('Initiating payment...');
      
      const token = await getAuthToken();
      console.log('DEBUG: Token length:', token ? token.length : 'No token');
      console.log('DEBUG: Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
      
      if (!token) {
        setIsLoading(false);
        Alert.alert('Error', 'No authentication token found. Please log in again.');
        return;
      }
      
      setTransactionStatus('Creating payment request...');
      
      const response = await fetch('http://10.228.195.3:8000/api/mobile-money/deposit/mobilemoney/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          provider: selectedProvider.label
        })
      });
      
      console.log('DEBUG: Response status:', response.status);
      
      if (response.status === 401) {
        setIsLoading(false);
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        // Store transaction data for status checking
        setCurrentTransaction(data);
        
        // Handle different payment types
        if (data.payment_type === 'ussd_push' && data.ussd_code) {
          setIsLoading(false);
          setTransactionStatus('Payment initiated successfully!');
          
          // Show approval modal with USSD code
          setShowApprovalModal(true);
          startApprovalTimer();
          startStatusChecking(data.tx_ref || data.reference);
          
        } else if (data.payment_type === 'web_redirect' && data.redirect_url) {
          setIsLoading(false);
          setTransactionStatus('Redirecting to payment page...');
          
          // Show approval modal with redirect option
          setShowApprovalModal(true);
          startApprovalTimer();
          startStatusChecking(data.tx_ref || data.reference);
          
        } else {
          setIsLoading(false);
          setTransactionStatus('Payment initiated successfully!');
          
          // Show approval modal for generic payment
          setShowApprovalModal(true);
          startApprovalTimer();
          startStatusChecking(data.tx_ref || data.reference);
        }
      } else {
        setIsLoading(false);
        Alert.alert('Error', data.detail || 'Failed to initiate deposit');
      }
    } catch (error) {
      setIsLoading(false);
      console.log('DEBUG: Network error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
  };

  const handleConfirm = () => {
    console.log('Deposit amount:', amount, 'Password:', password);
    setShowModal(false);
    setPassword('');
  };

  const handleMiniAgentConfirm = () => {
    if (!selectedFriend) {
      Alert.alert('Error', 'Please select a friend to give cash to');
      return;
    }
    
    const depositAmount = parseFloat(amount);
    const fee = depositAmount * 0.02; // 2% fee
    const totalReceived = depositAmount - fee; // You receive less due to fee
    
    Alert.alert(
      'Confirm Cash Deposit',
      `Give ZMW ${depositAmount} cash to ${selectedFriend.name}?\n\nYou will receive: ZMW ${totalReceived.toFixed(2)}\nFee: ZMW ${fee.toFixed(2)}\n\n⚠️ Both devices must remain within 1 meter during transaction.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            console.log('Mini-agent deposit:', {
              amount: depositAmount,
              friend: selectedFriend.name,
              fee: fee,
              totalReceived: totalReceived,
              phoneNumber: selectedFriend.phoneNumber
            });
            setShowMiniAgentModal(false);
            setSelectedFriend(null);
            Alert.alert('Success', 'Deposit request sent! Give cash to your friend and you\'ll receive digital money. Stay within 1 meter during the transaction.');
          }
        }
      ]
    );
  };

  const startApprovalTimer = () => {
    setApprovalTimer(300); // 5 minutes timer
    const timer = setInterval(() => {
      setApprovalTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowApprovalModal(false);
          setTransactionStatus('Transaction timed out. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startStatusChecking = (transactionRef: string) => {
    const interval = setInterval(async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch(`http://10.228.195.3:8000/api/mobile-money/transaction-status/${transactionRef}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Transaction status response:', data);
          
          if (data.status === 'completed') {
            clearInterval(interval);
            setShowApprovalModal(false);
            setTransactionStatus('Payment completed successfully! 🎉');
            // Navigate back to main tabs after a delay
            setTimeout(() => {
              navigation.navigate('MainTabs');
            }, 2000);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setShowApprovalModal(false);
            setTransactionStatus('Payment failed. Please try again.');
          } else if (data.status === 'pending') {
            setTransactionStatus('Payment is being processed... Please wait.');
          }
        } else {
          console.log('Status check failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('Status check error:', error);
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setApprovalTimer(0);
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setTransactionStatus('');
    setCurrentTransaction(null);
  };

  const isButtonDisabled = () => {
    if (!selectedProvider || !amount) return true;
    if (selectedProvider?.type === 'mini-agent') {
      const depositAmount = parseFloat(amount);
      return depositAmount > 1000 || depositAmount <= 0 || bluetoothStatus === 'no_devices';
    }
    return false;
  };

  const renderProviderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.providerCard,
        selectedProvider?.id === item.id && styles.selectedProviderCard
      ]}
      onPress={() => setSelectedProvider(item)}
    >
      <Image source={item.icon} style={styles.providerIcon} />
      <Text style={styles.providerLabel}>{item.label}</Text>
      {item.type === 'mini-agent' && (
        <Text style={styles.miniAgentInfo}>{item.fee} fee</Text>
      )}
      {selectedProvider?.id === item.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.checkmark}>✔</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Show linked phone for selected provider
  const linkedForSelected = selectedProvider ? linkedAccounts.find(acc => acc.provider === selectedProvider.label && acc.is_confirmed) : null;

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Deposit Options</Text>
        
        {/* Horizontal Scrolling Providers */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providersContainer}
          style={styles.providersScrollView}
        >
          {PROVIDERS.map(provider => (
            <View key={provider.id} style={styles.providerWrapper}>
              {renderProviderItem({ item: provider })}
              {/* Show linked phone if this provider is selected and has a linked account */}
              {selectedProvider && selectedProvider.id === provider.id && linkedForSelected && (
                <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>
                  Linked: {linkedForSelected.phone}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        {selectedProvider?.type === 'mini-agent' && (
          <View style={styles.miniAgentDetails}>
            <Text style={styles.miniAgentDescription}>
              💡 Give physical cash to friends and receive digital money!
            </Text>
            <Text style={styles.miniAgentLimit}>
              Daily limit: {selectedProvider.limit} • Proximity: 1 meter
            </Text>
            {bluetoothStatus === 'scanning' && (
              <Text style={styles.bluetoothStatus}>🔍 Scanning for nearby friends...</Text>
            )}
            {bluetoothStatus === 'no_devices' && (
              <Text style={styles.bluetoothStatus}>❌ No friends within 1 meter</Text>
            )}
            {bluetoothStatus === 'found' && (
              <Text style={styles.bluetoothStatus}>✅ {nearbyDevices.length} friend(s) found nearby</Text>
            )}
            {bluetoothStatus === 'no_bluetooth' && (
              <Text style={styles.bluetoothStatus}>⚠️ Bluetooth not available on this device</Text>
            )}
            {bluetoothStatus === 'error' && (
              <Text style={styles.bluetoothStatus}>❌ Error scanning for friends</Text>
            )}
          </View>
        )}

        <Text style={styles.inputLabel}>Enter Amount (ZMW)</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount in ZMW"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
        {selectedProvider?.type === 'mini-agent' && parseFloat(amount) > 1000 && (
          <Text style={styles.errorText}>Daily limit is ZMW 1000</Text>
        )}

        <TouchableOpacity
          style={[styles.depositButton, isButtonDisabled() && styles.disabledButton]}
          disabled={isButtonDisabled() || isLoading}
          onPress={handleDeposit}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.depositButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.depositButtonText}>
              {selectedProvider?.type === 'mini-agent' ? 'Give Cash' : 'Deposit'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.loadingText}>{transactionStatus}</Text>
            </View>
          </View>
        )}

        {/* Traditional Deposit Modal */}
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
              <Text style={styles.modalTitle}>Enter Password</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Mini-Agent Modal */}
        <Modal
          visible={showMiniAgentModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMiniAgentModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Friend</Text>
              <Text style={styles.modalSubtitle}>Choose who to give cash to (within 1 meter):</Text>
              
              <ScrollView style={styles.friendsList}>
                {nearbyDevices.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    style={[
                      styles.friendItem,
                      selectedFriend?.id === friend.id && styles.selectedFriend
                    ]}
                    onPress={() => setSelectedFriend(friend)}
                  >
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendDetails}>
                        📱 {friend.phoneNumber} • Available: ZMW {friend.available} • ⭐ {friend.rating}
                      </Text>
                    </View>
                    {selectedFriend?.id === friend.id && (
                      <Text style={styles.checkmark}>✔</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowMiniAgentModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmButton, !selectedFriend && styles.disabledButton]} 
                  onPress={handleMiniAgentConfirm}
                  disabled={!selectedFriend}
                >
                  <Text style={styles.confirmButtonText}>Give Cash</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Transaction Approval Modal */}
        <Modal
          visible={showApprovalModal}
          transparent
          animationType="slide"
          onRequestClose={closeApprovalModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.approvalModalContent}>
              <View style={styles.approvalHeader}>
                <Text style={styles.approvalTitle}>Approve Payment</Text>
                <Text style={styles.approvalSubtitle}>
                  Time remaining: {Math.floor(approvalTimer / 60)}:{(approvalTimer % 60).toString().padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.detailLabel}>Provider:</Text>
                <Text style={styles.detailValue}>{selectedProvider?.label}</Text>
                
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>ZMW {amount}</Text>
                
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{currentTransaction?.phone || 'N/A'}</Text>
              </View>

              {currentTransaction?.payment_type === 'ussd_push' && currentTransaction?.ussd_code && (
                <View style={styles.ussdSection}>
                  <Text style={styles.ussdTitle}>📞 Dial this USSD code:</Text>
                  <Text style={styles.ussdCode}>{currentTransaction.ussd_code}</Text>
                  <Text style={styles.ussdInstructions}>
                    Follow the prompts on your phone to complete the payment
                  </Text>
                </View>
              )}

              {currentTransaction?.payment_type === 'web_redirect' && currentTransaction?.redirect_url && (
                <View style={styles.webRedirectSection}>
                  <Text style={styles.webRedirectTitle}>🌐 Complete payment online:</Text>
                  <TouchableOpacity 
                    style={styles.webRedirectButton}
                    onPress={() => Linking.openURL(currentTransaction.redirect_url)}
                  >
                    <Text style={styles.webRedirectButtonText}>Open Payment Page</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.statusSection}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={styles.statusValue}>{transactionStatus}</Text>
              </View>

              <View style={styles.approvalButtons}>
                <TouchableOpacity 
                  style={styles.cancelApprovalButton} 
                  onPress={closeApprovalModal}
                >
                  <Text style={styles.cancelApprovalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => {
                    if (currentTransaction?.tx_ref || currentTransaction?.reference) {
                      startStatusChecking(currentTransaction.tx_ref || currentTransaction.reference);
                    }
                  }}
                >
                  <Text style={styles.refreshButtonText}>Refresh Status</Text>
                </TouchableOpacity>
              </View>
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
  },
  providersContainer: {
    flexDirection: 'row',
    width: screenWidth,
  },
  providersScrollView: {
    padding: 10,
  },
  providerWrapper: {
    width: screenWidth / 4,
    padding: 5,
  },
  providerCard: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f8f8f8',
    minWidth: 80,
    minHeight: 100,
    position: 'relative',
    marginHorizontal: 6,
  },
  selectedProviderCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  providerIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
    borderRadius: 8,
  },
  providerLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  miniAgentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  miniAgentDetails: {
    marginTop: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    width: '100%',
  },
  miniAgentDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  miniAgentLimit: {
    fontSize: 14,
    color: '#666',
  },
  bluetoothStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
    color: '#444',
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 32,
    color: '#333',
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: 20,
  },
  depositButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  passwordInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedFriend: {
    backgroundColor: '#e8f5e9',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 10,
  },
  friendDetails: {
    fontSize: 14,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  cancelButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  // Loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  // Approval modal styles
  approvalModalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  approvalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  approvalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  approvalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  transactionDetails: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  ussdSection: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  ussdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  ussdCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 2,
  },
  ussdInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  webRedirectSection: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  webRedirectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  webRedirectButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  webRedirectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSection: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  approvalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelApprovalButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelApprovalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 