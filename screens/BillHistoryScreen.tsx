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
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SIZES, icons } from '../constants';

interface BillHistoryScreenProps {
  navigation: { 
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface BillPayment {
  id: string;
  billName: string;
  icon: any;
  accountNumber: string;
  amount: number;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
  receiptUrl?: string;
  paymentMethod: string;
}

const BillHistoryScreen = ({ navigation }: BillHistoryScreenProps) => {
  const [selectedPayment, setSelectedPayment] = useState<BillPayment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data with actual icons
  const billPayments: BillPayment[] = [
    {
      id: '1',
      billName: 'DSTV Premium',
      icon: icons.dstv,
      accountNumber: '123456789',
      amount: 450,
      paymentDate: '2024-11-15',
      status: 'completed',
      transactionId: 'TXN123456789',
      paymentMethod: 'Mobile Money',
      receiptUrl: 'receipt_1.pdf'
    },
    {
      id: '2',
      billName: 'ZESCO',
      icon: icons.zesco,
      accountNumber: '12345678',
      amount: 320,
      paymentDate: '2024-11-10',
      status: 'completed',
      transactionId: 'TXN123456790',
      paymentMethod: 'Bank Transfer',
      receiptUrl: 'receipt_2.pdf'
    },
    {
      id: '3',
      billName: 'Water Bill',
      icon: icons.waterbill,
      accountNumber: 'WB789456',
      amount: 180,
      paymentDate: '2024-11-05',
      status: 'completed',
      transactionId: 'TXN123456791',
      paymentMethod: 'Mobile Money',
      receiptUrl: 'receipt_3.pdf'
    },
    {
      id: '4',
      billName: 'GOTV',
      icon: icons.gotv,
      accountNumber: 'GT987654',
      amount: 280,
      paymentDate: '2024-11-20',
      status: 'pending',
      transactionId: 'TXN123456792',
      paymentMethod: 'Mobile Money'
    },
    {
      id: '5',
      billName: 'TOPSTAR',
      icon: icons.topstar,
      accountNumber: 'TS456789',
      amount: 150,
      paymentDate: '2024-10-28',
      status: 'failed',
      transactionId: 'TXN123456793',
      paymentMethod: 'Bank Transfer'
    }
  ];

  const filters = [
    { id: 'all', name: 'All Payments', count: billPayments.length },
    { id: 'completed', name: 'Completed', count: billPayments.filter(p => p.status === 'completed').length },
    { id: 'pending', name: 'Pending', count: billPayments.filter(p => p.status === 'pending').length },
    { id: 'failed', name: 'Failed', count: billPayments.filter(p => p.status === 'failed').length }
  ];

  const filteredPayments = billPayments.filter(payment => {
    if (selectedFilter === 'all') return true;
    return payment.status === selectedFilter;
  });

  const totalSpent = billPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handlePaymentPress = (payment: BillPayment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (payment: BillPayment) => {
    Alert.alert(
      'Download Receipt',
      `Download receipt for ${payment.billName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            Alert.alert('Success', 'Receipt downloaded successfully!');
          }
        }
      ]
    );
  };

  const handleShareReceipt = (payment: BillPayment) => {
    Alert.alert(
      'Share Receipt',
      `Share receipt for ${payment.billName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            Alert.alert('Success', 'Receipt shared successfully!');
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Payment History</Text>
      <TouchableOpacity>
        <Text style={styles.exportButton}>📊</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spent</Text>
        <Text style={styles.summaryAmount}>ZMW {totalSpent.toFixed(2)}</Text>
        <Text style={styles.summaryPeriod}>This month</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Payments</Text>
        <Text style={styles.summaryCount}>{billPayments.length}</Text>
        <Text style={styles.summaryPeriod}>Total</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Success Rate</Text>
        <Text style={styles.summaryRate}>
          {Math.round((billPayments.filter(p => p.status === 'completed').length / billPayments.length) * 100)}%
        </Text>
        <Text style={styles.summaryPeriod}>Completed</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
    >
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            selectedFilter === filter.id && styles.selectedFilter
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === filter.id && styles.selectedFilterText
          ]}>
            {filter.name}
          </Text>
          <Text style={[
            styles.filterCount,
            selectedFilter === filter.id && styles.selectedFilterCount
          ]}>
            {filter.count}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPaymentItem = (payment: BillPayment) => (
    <TouchableOpacity
      key={payment.id}
      style={styles.paymentCard}
      onPress={() => handlePaymentPress(payment)}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Image source={payment.icon} style={styles.paymentIcon} />
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentName}>{payment.billName}</Text>
            <Text style={styles.paymentAccount}>Account: {payment.accountNumber}</Text>
            <Text style={styles.paymentMethod}>{payment.paymentMethod}</Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          payment.status === 'completed' ? styles.completedBadge :
          payment.status === 'pending' ? styles.pendingBadge : styles.failedBadge
        ]}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <View style={styles.paymentAmount}>
          <Text style={styles.amountValue}>ZMW {payment.amount.toFixed(2)}</Text>
          <Text style={styles.paymentDate}>{payment.paymentDate}</Text>
        </View>
        
        <View style={styles.paymentActions}>
          {payment.receiptUrl && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDownloadReceipt(payment)}
            >
              <Text style={styles.actionButtonText}>📥</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShareReceipt(payment)}
          >
            <Text style={styles.actionButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReceiptModal = () => (
    <Modal
      visible={showReceiptModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowReceiptModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedPayment && (
            <>
              <View style={styles.modalHeader}>
                <Image source={selectedPayment.icon} style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Payment Receipt</Text>
              </View>
              
              <View style={styles.receiptDetails}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Bill:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.billName}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Account:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.accountNumber}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount:</Text>
                  <Text style={styles.receiptValue}>ZMW {selectedPayment.amount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.paymentDate}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction ID:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.transactionId}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Method:</Text>
                  <Text style={styles.receiptValue}>{selectedPayment.paymentMethod}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status:</Text>
                  <Text style={[
                    styles.receiptValue,
                    selectedPayment.status === 'completed' ? styles.completedText :
                    selectedPayment.status === 'pending' ? styles.pendingText : styles.failedText
                  ]}>
                    {selectedPayment.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.receiptActions}>
                {selectedPayment.receiptUrl && (
                  <TouchableOpacity 
                    style={styles.receiptButton}
                    onPress={() => handleDownloadReceipt(selectedPayment)}
                  >
                    <Text style={styles.receiptButtonText}>📥 Download Receipt</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.receiptButton}
                  onPress={() => handleShareReceipt(selectedPayment)}
                >
                  <Text style={styles.receiptButtonText}>📤 Share Receipt</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {renderHeader()}
      {renderSummary()}
      {renderFilters()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.paymentsContainer}>
          {filteredPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateText}>No payments found</Text>
            </View>
          ) : (
            filteredPayments.map(renderPaymentItem)
          )}
        </View>
      </ScrollView>
      
      {renderReceiptModal()}
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
  exportButton: {
    color: '#fff',
    fontSize: 18,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: 10,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 10,
    color: '#666',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#fff',
  },
  filterCount: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  selectedFilterCount: {
    color: '#fff',
  },
  paymentsContainer: {
    padding: SIZES.padding,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentAccount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
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
  failedBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    flex: 1,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
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
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  completedText: {
    color: '#28a745',
  },
  pendingText: {
    color: '#fd7e14',
  },
  failedText: {
    color: '#dc3545',
  },
  receiptActions: {
    marginBottom: 20,
  },
  receiptButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillHistoryScreen; 