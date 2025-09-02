import * as ExpoDevice from 'expo-device';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { getAuthToken } from './LoginScreen';

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
    description: 'Get cash from nearby friends',
    fee: '1-2%',
    limit: 'ZMW 1000/day'
  }
];

interface WithdrawalScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

export default function WithdrawalScreen({ navigation }: WithdrawalScreenProps) {
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
        console.log('Fetched linkedAccounts for withdrawal:', data);
      } else {
        console.log('Failed to fetch linked accounts:', response.status);
      }
    };
    fetchLinkedAccounts();
    
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

    // Start scanning for nearby devices
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

  const handleWithdraw = () => {
    console.log('Selected provider:', selectedProvider);
    console.log('All linkedAccounts:', linkedAccounts);
    if (selectedProvider?.type === 'mini-agent') {
      if (bluetoothStatus === 'no_devices') {
        Alert.alert('No Friends Nearby', 'No friends found within 1 meter. Please move closer to your friends or try traditional withdrawal.');
        return;
      }
      setShowMiniAgentModal(true);
    } else {
      // Traditional mobile money withdrawal
      if (!selectedProvider) {
        Alert.alert('Error', 'Please select a provider.');
        return;
      }
      const linked = linkedAccounts.find(acc => acc.provider === selectedProvider.label && acc.is_confirmed);
      console.log('Matched linked account:', linked);
      if (!linked) {
        Alert.alert('No linked account found', 'Please link your mobile money account first.');
        return;
      }
      
      // Show confirmation dialog before proceeding
      Alert.alert(
        'Confirm Withdrawal',
        `Withdraw ZMW ${amount} to ${selectedProvider.label}?\n\nLinked Number: ${linked.phone}\nProvider: ${selectedProvider.label}\nAmount: ZMW ${amount}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: () => proceedWithWithdrawal(linked)
          }
        ]
      );
    }
  };

  const proceedWithWithdrawal = async (linked: any) => {
    try {
      setIsLoading(true);
      setTransactionStatus('Initiating withdrawal...');
      
      const token = await getAuthToken();
      console.log('DEBUG: Token length:', token ? token.length : 'No token');
      
      if (!token) {
        setIsLoading(false);
        Alert.alert('Error', 'No authentication token found. Please log in again.');
        return;
      }
      
      setTransactionStatus('Creating withdrawal request...');
      
      const response = await fetch('http://10.228.195.3:8000/api/mobile-money/withdrawal/', {
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
        
        setIsLoading(false);
        setTransactionStatus('Withdrawal initiated successfully!');
        
        // Show approval modal
        setShowApprovalModal(true);
        startApprovalTimer();
        startStatusChecking(data.reference);
        
        // Refresh balance immediately since funds were deducted
        const refreshBalance = async () => {
          const token = await getAuthToken();
          if (!token) return;
          try {
            const balanceResponse = await fetch('http://10.228.195.3:8000/api/wallet/balance/', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            if (balanceResponse.ok) {
              const balanceData = await balanceResponse.json();
              if (balanceData.success) {
                console.log('Balance refreshed after withdrawal initiation:', balanceData.balance);
              }
            }
          } catch (e) {
            console.log('Error refreshing balance:', e);
          }
        };
        refreshBalance();
        
      } else {
        setIsLoading(false);
        Alert.alert('Error', data.error || 'Failed to initiate withdrawal');
      }
    } catch (error) {
      setIsLoading(false);
      console.log('DEBUG: Network error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
  };

  const handleConfirm = () => {
    console.log('Withdrawal amount:', amount, 'Password:', password);
    setShowModal(false);
    setPassword('');
  };

  const handleMiniAgentConfirm = () => {
    if (!selectedFriend) {
      Alert.alert('Error', 'Please select a friend to get cash from');
      return;
    }
    
    const withdrawalAmount = parseFloat(amount);
    const fee = withdrawalAmount * 0.02; // 2% fee
    const totalAmount = withdrawalAmount + fee;
    
    Alert.alert(
      'Confirm Cash Request',
      `Request ZMW ${withdrawalAmount} from ${selectedFriend.name}?\n\nFee: ZMW ${fee.toFixed(2)}\nTotal: ZMW ${totalAmount.toFixed(2)}\n\n⚠️ Both devices must remain within 1 meter during transaction.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            console.log('Mini-agent withdrawal:', {
              amount: withdrawalAmount,
              friend: selectedFriend.name,
              fee: fee,
              total: totalAmount,
              phoneNumber: selectedFriend.phoneNumber
            });
            setShowMiniAgentModal(false);
            setSelectedFriend(null);
            Alert.alert('Success', 'Cash request sent! Meet your friend to collect cash. Stay within 1 meter during the transaction.');
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
          console.log('Withdrawal status response:', data);
          
          if (data.status === 'completed') {
            clearInterval(interval);
            setShowApprovalModal(false);
            setTransactionStatus('Withdrawal completed successfully! 🎉');
            // Refresh balance immediately
            const refreshBalance = async () => {
              const token = await getAuthToken();
              if (!token) return;
              try {
                const balanceResponse = await fetch('http://10.228.195.3:8000/api/wallet/balance/', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  if (balanceData.success) {
                    console.log('Balance refreshed after withdrawal:', balanceData.balance);
                  }
                }
              } catch (e) {
                console.log('Error refreshing balance:', e);
              }
            };
            refreshBalance();
            // Navigate back to main tabs after a delay
            setTimeout(() => {
              navigation.navigate('MainTabs');
            }, 2000);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setShowApprovalModal(false);
            setTransactionStatus('Withdrawal failed. Please try again.');
            // Refresh balance in case it was deducted but withdrawal failed
            const refreshBalance = async () => {
              const token = await getAuthToken();
              if (!token) return;
              try {
                const balanceResponse = await fetch('http://10.228.195.3:8000/api/wallet/balance/', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (balanceResponse.ok) {
                  const balanceData = await balanceResponse.json();
                  if (balanceData.success) {
                    console.log('Balance refreshed after failed withdrawal:', balanceData.balance);
                  }
                }
              } catch (e) {
                console.log('Error refreshing balance:', e);
              }
            };
            refreshBalance();
          } else if (data.status === 'pending') {
            setTransactionStatus('Withdrawal is being processed... Please wait.');
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
      const withdrawalAmount = parseFloat(amount);
      return withdrawalAmount > 1000 || withdrawalAmount <= 0 || bluetoothStatus === 'no_devices';
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

  return (
    <LinearGradient
      colors={["#e8f5e9", "#fff", "#e0f7fa"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Withdrawal Options</Text>
        
        {/* Horizontal Scrolling Providers */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providersContainer}
          style={styles.providersScrollView}
        >
          {PROVIDERS.map(provider => {
            const linkedAccount = linkedAccounts.find(acc => acc.provider === provider.label && acc.is_confirmed);
            return (
              <View key={provider.id} style={styles.providerWrapper}>
                {renderProviderItem({ item: provider })}
                {/* Show linked phone only when this provider is selected and has a linked account */}
                {selectedProvider && selectedProvider.id === provider.id && linkedAccount && (
                  <View style={{ alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>
                      Linked:
                    </Text>
                    <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 11 }}>
                      {linkedAccount.phone}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {selectedProvider?.type === 'mini-agent' && (
          <View style={styles.miniAgentDetails}>
            <Text style={styles.miniAgentDescription}>
              💡 Ask nearby friends for cash. They earn commission for helping!
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
          style={[styles.withdrawButton, isButtonDisabled() && styles.disabledButton]}
          disabled={isButtonDisabled() || isLoading}
          onPress={handleWithdraw}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.withdrawButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.withdrawButtonText}>
              {selectedProvider?.type === 'mini-agent' ? 'Request Cash' : 'Withdraw'}
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

        {/* Traditional Withdrawal Modal */}
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
              <Text style={styles.modalSubtitle}>Choose who to request cash from (within 1 meter):</Text>
              
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
                  <Text style={styles.confirmButtonText}>Request Cash</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Withdrawal Approval Modal */}
        <Modal
          visible={showApprovalModal}
          transparent
          animationType="slide"
          onRequestClose={closeApprovalModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.approvalModalContent}>
              <View style={styles.approvalHeader}>
                <Text style={styles.approvalTitle}>Withdrawal in Progress</Text>
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
                    if (currentTransaction?.reference) {
                      startStatusChecking(currentTransaction.reference);
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
    paddingBottom: 100, // Add bottom padding to prevent overlap
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
    padding: 10,
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
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
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
    marginBottom: 32, // Increased margin to prevent overlap
    color: '#333',
  },
  withdrawButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: 20, // Add bottom margin for extra spacing
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
  },
  passwordInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.green,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 17,
    marginBottom: 24,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  miniAgentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  miniAgentDetails: {
    marginBottom: 24,
  },
  miniAgentDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  miniAgentLimit: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f8f8f8',
    marginBottom: 4,
  },
  selectedFriend: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightGreen,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  friendDetails: {
    fontSize: 12,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  bluetoothStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
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