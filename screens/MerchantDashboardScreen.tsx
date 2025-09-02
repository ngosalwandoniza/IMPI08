import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SIZES } from '../constants';

interface MerchantDashboardScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

const MerchantDashboardScreen = ({ navigation }: MerchantDashboardScreenProps) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Mock data
  const todaySales = 1250;
  const totalTransactions = 45;
  const pendingAmount = 320;

  const recentTransactions = [
    { id: 1, amount: 250, customer: 'John Doe', time: '2 min ago', status: 'completed' },
    { id: 2, amount: 180, customer: 'Jane Smith', time: '5 min ago', status: 'completed' },
    { id: 3, amount: 450, customer: 'Mike Johnson', time: '10 min ago', status: 'pending' },
    { id: 4, amount: 120, customer: 'Sarah Wilson', time: '15 min ago', status: 'completed' },
  ];

  const generateQRCode = () => {
    if (!qrAmount || parseFloat(qrAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setShowQRModal(true);
  };

  const generateQRData = () => {
    const data = {
      type: 'merchant_payment',
      merchantId: 'MERCH001',
      amount: qrAmount,
      timestamp: new Date().toISOString(),
      transactionId: `TXN${Date.now()}`,
    };
    return JSON.stringify(data);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Merchant Dashboard</Text>
      <TouchableOpacity>
        <Text style={styles.settingsButton}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Today's Sales</Text>
        <Text style={styles.statValue}>ZMW {todaySales}</Text>
        <Text style={styles.statChange}>+12% from yesterday</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Transactions</Text>
        <Text style={styles.statValue}>{totalTransactions}</Text>
        <Text style={styles.statChange}>Today</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>Pending</Text>
        <Text style={styles.statValue}>ZMW {pendingAmount}</Text>
        <Text style={styles.statChange}>3 transactions</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowQRModal(true)}>
          <Text style={styles.actionButtonText}>Generate QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.actionButtonText}>View Receipts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.tertiaryButton]}>
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.courierButton]}
          onPress={() => navigation.navigate('CourierDashboardScreen')}
        >
          <Text style={styles.actionButtonText}>Courier Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.transactionsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {recentTransactions.map(transaction => (
        <View key={transaction.id} style={styles.transactionItem}>
          <View style={styles.transactionInfo}>
            <Text style={styles.customerName}>{transaction.customer}</Text>
            <Text style={styles.transactionTime}>{transaction.time}</Text>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text style={styles.amountText}>ZMW {transaction.amount}</Text>
            <View style={[
              styles.statusBadge,
              transaction.status === 'completed' ? styles.completedBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                transaction.status === 'completed' ? styles.completedText : styles.pendingText
              ]}>
                {transaction.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQRModal = () => (
    <Modal
      visible={showQRModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQRModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Generate QR Code</Text>
          
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount (ZMW)"
            value={qrAmount}
            onChangeText={setQrAmount}
            keyboardType="numeric"
          />
          
          {qrAmount && parseFloat(qrAmount) > 0 && (
            <View style={styles.qrContainer}>
              <QRCode
                value={generateQRData()}
                size={200}
                color="black"
                backgroundColor="white"
              />
              <Text style={styles.qrInfo}>Amount: ZMW {qrAmount}</Text>
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]} 
              onPress={generateQRCode}
            >
              <Text style={styles.confirmButtonText}>Generate</Text>
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
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderStats()}
        {renderQuickActions()}
        {renderRecentTransactions()}
      </ScrollView>
      
      {renderQRModal()}
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
  quickActionsContainer: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
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
  tertiaryButton: {
    backgroundColor: '#17a2b8',
  },
  courierButton: {
    backgroundColor: '#fd7e14',
  },
  transactionsContainer: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#d4edda',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  completedText: {
    color: '#155724',
  },
  pendingText: {
    color: '#856404',
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
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  qrInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MerchantDashboardScreen; 