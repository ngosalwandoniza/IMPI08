import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, SIZES } from '../constants';

interface CourierDashboardScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface PickupRequest {
  id: string;
  transactionId: string;
  itemName: string;
  sellerName: string;
  sellerPhone: string;
  pickupLocation: string;
  amount: number;
  status: 'pending' | 'picked' | 'delivered';
  qrCode: string;
}

const CourierDashboardScreen = ({ navigation }: CourierDashboardScreenProps) => {
  const [selectedTab, setSelectedTab] = useState('pickups');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Mock data
  const pickupRequests: PickupRequest[] = [
    {
      id: '1',
      transactionId: 'ESC123456789',
      itemName: 'iPhone 13',
      sellerName: 'John Doe',
      sellerPhone: '0977123456',
      pickupLocation: 'Lusaka Mall',
      amount: 2500,
      status: 'pending',
      qrCode: 'ESC123456789'
    },
    {
      id: '2',
      transactionId: 'ESC123456790',
      itemName: 'Samsung TV',
      sellerName: 'Jane Smith',
      sellerPhone: '0977123457',
      pickupLocation: 'Manda Hill',
      amount: 1800,
      status: 'picked',
      qrCode: 'ESC123456790'
    }
  ];

  const handleQRScan = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      setScannedData(parsedData);
      setShowQRScanner(false);
      setShowVerificationModal(true);
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code');
    }
  };

  const handleVerification = (approved: boolean) => {
    if (approved) {
      Alert.alert(
        'Verification Successful',
        'Payment has been released to the seller. Proceed with delivery.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowVerificationModal(false);
              setScannedData(null);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Verification Failed',
        'Item verification failed. Please contact support.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowVerificationModal(false);
              setScannedData(null);
            }
          }
        ]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Courier Dashboard</Text>
      <TouchableOpacity>
        <Text style={styles.settingsButton}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Today's Pickups</Text>
        <Text style={styles.statValue}>8</Text>
        <Text style={styles.statChange}>+2 from yesterday</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Deliveries</Text>
        <Text style={styles.statValue}>6</Text>
        <Text style={styles.statChange}>Completed</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Earnings</Text>
        <Text style={styles.statValue}>ZMW 450</Text>
        <Text style={styles.statChange}>Today</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'pickups' && styles.activeTab]}
        onPress={() => setSelectedTab('pickups')}
      >
        <Text style={[styles.tabText, selectedTab === 'pickups' && styles.activeTabText]}>
          Pickup Requests
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'deliveries' && styles.activeTab]}
        onPress={() => setSelectedTab('deliveries')}
      >
        <Text style={[styles.tabText, selectedTab === 'deliveries' && styles.activeTabText]}>
          Active Deliveries
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
        onPress={() => setSelectedTab('completed')}
      >
        <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPickupRequests = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pickup Requests</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => setShowQRScanner(true)}
        >
          <Text style={styles.scanButtonText}>📱 Scan QR</Text>
        </TouchableOpacity>
      </View>
      
      {pickupRequests.map(request => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestId}>#{request.transactionId}</Text>
            <View style={[
              styles.statusBadge,
              request.status === 'pending' ? styles.pendingBadge : 
              request.status === 'picked' ? styles.pickedBadge : styles.deliveredBadge
            ]}>
              <Text style={styles.statusText}>{request.status}</Text>
            </View>
          </View>
          
          <Text style={styles.itemName}>{request.itemName}</Text>
          
          <View style={styles.requestDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seller:</Text>
              <Text style={styles.detailValue}>{request.sellerName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{request.sellerPhone}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{request.pickupLocation}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>ZMW {request.amount}</Text>
            </View>
          </View>
          
          <View style={styles.requestActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Call Seller</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQRScannerModal = () => (
    <Modal
      visible={showQRScanner}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQRScanner(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Scan QR Code</Text>
          
          <View style={styles.qrScannerPlaceholder}>
            <Text style={styles.qrScannerText}>📱</Text>
            <Text style={styles.qrScannerText}>QR Scanner</Text>
            <Text style={styles.qrScannerSubtext}>Point camera at QR code</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowQRScanner(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderVerificationModal = () => (
    <Modal
      visible={showVerificationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowVerificationModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Item Verification</Text>
          
          {scannedData && (
            <View style={styles.verificationInfo}>
              <Text style={styles.verificationLabel}>Transaction ID:</Text>
              <Text style={styles.verificationValue}>{scannedData.transactionId}</Text>
              
              <Text style={styles.verificationLabel}>Amount:</Text>
              <Text style={styles.verificationValue}>ZMW {scannedData.amount}</Text>
              
              <Text style={styles.verificationLabel}>Item:</Text>
              <Text style={styles.verificationValue}>{scannedData.itemName || 'Not specified'}</Text>
            </View>
          )}
          
          <Text style={styles.verificationInstructions}>
            Please verify the item matches the description and is in good condition.
          </Text>
          
          <View style={styles.verificationButtons}>
            <TouchableOpacity 
              style={[styles.verificationButton, styles.rejectButton]}
              onPress={() => handleVerification(false)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.verificationButton, styles.approveButton]}
              onPress={() => handleVerification(true)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {renderHeader()}
      {renderStats()}
      {renderTabs()}
      {renderPickupRequests()}
      
      {renderQRScannerModal()}
      {renderVerificationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  settingsButton: {
    color: '#fff',
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    color: '#28a745',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  pickedBadge: {
    backgroundColor: '#d1ecf1',
  },
  deliveredBadge: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
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
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrScannerPlaceholder: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrScannerText: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrScannerSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  verificationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  verificationInstructions: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  verificationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  verificationButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CourierDashboardScreen; 