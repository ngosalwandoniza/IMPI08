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
    View
} from 'react-native';
import { COLORS, SIZES, icons } from '../constants';

interface BillPaymentScreenProps {
  navigation: { 
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface Bill {
  id: string;
  name: string;
  icon: any;
  color: string;
  accountNumber: string;
  meterNumber?: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'overdue' | 'paid';
  category: string;
  description?: string;
}

const BillPaymentScreen = ({ navigation }: BillPaymentScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Mock data with actual icons
  const bills: Bill[] = [
    {
      id: '1',
      name: 'DSTV Premium',
      icon: icons.dstv,
      color: '#FF6B35',
      accountNumber: '123456789',
      amount: 450,
      dueDate: '2024-12-15',
      status: 'due',
      category: 'TV',
      description: 'Premium + Compact Package'
    },
    {
      id: '2',
      name: 'ZESCO',
      icon: icons.zesco,
      color: '#FFD700',
      accountNumber: '12345678',
      meterNumber: 'MTR12345678',
      amount: 320,
      dueDate: '2024-12-20',
      status: 'due',
      category: 'Utilities'
    },
    {
      id: '3',
      name: 'Water Bill',
      icon: icons.waterbill,
      color: '#0066FF',
      accountNumber: 'WB789456',
      amount: 180,
      dueDate: '2024-12-10',
      status: 'overdue',
      category: 'Utilities'
    },
    {
      id: '4',
      name: 'GOTV',
      icon: icons.gotv,
      color: '#0066CC',
      accountNumber: 'GT987654',
      amount: 280,
      dueDate: '2024-12-25',
      status: 'due',
      category: 'TV'
    },
    {
      id: '5',
      name: 'TOPSTAR',
      icon: icons.topstar,
      color: '#00AA55',
      accountNumber: 'TS456789',
      amount: 150,
      dueDate: '2024-12-18',
      status: 'due',
      category: 'TV'
    },
    {
      id: '6',
      name: 'Airtel Data',
      icon: icons.airtel,
      color: '#FF0000',
      accountNumber: '0977123456',
      amount: 120,
      dueDate: '2024-12-22',
      status: 'due',
      category: 'Mobile'
    },
    {
      id: '7',
      name: 'MTN Data',
      icon: icons.mtn,
      color: '#FFD700',
      accountNumber: '0966123456',
      amount: 95,
      dueDate: '2024-12-23',
      status: 'due',
      category: 'Mobile'
    },
    {
      id: '8',
      name: 'Vehicle Insurance',
      icon: '🛡️',
      color: '#6F42C1',
      accountNumber: 'INS123456',
      amount: 250,
      dueDate: '2024-12-30',
      status: 'due',
      category: 'Insurance'
    },
    {
      id: '9',
      name: 'Home Insurance',
      icon: '🛡️',
      color: '#6F42C1',
      accountNumber: 'INS789012',
      amount: 200,
      dueDate: '2024-12-28',
      status: 'due',
      category: 'Insurance'
    },
    {
      id: '10',
      name: 'Monthly Rent',
      icon: '🏠',
      color: '#28A745',
      accountNumber: 'RENT001',
      amount: 2500,
      dueDate: '2024-12-01',
      status: 'overdue',
      category: 'Rent'
    },
    {
      id: '11',
      name: 'Internet Bill',
      icon: '🌐',
      color: '#17A2B8',
      accountNumber: 'NET456789',
      amount: 350,
      dueDate: '2024-12-26',
      status: 'due',
      category: 'Internet'
    },
    {
      id: '12',
      name: 'School Fees',
      icon: '📚',
      color: '#FD7E14',
      accountNumber: 'EDU123456',
      amount: 800,
      dueDate: '2024-12-31',
      status: 'due',
      category: 'Education'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Bills' },
    { id: 'TV', name: 'TV Services' },
    { id: 'Utilities', name: 'Utilities' },
    { id: 'Mobile', name: 'Mobile' },
    { id: 'Insurance', name: 'Insurance' },
    { id: 'Education', name: 'Education' },
    { id: 'Rent', name: 'Rent' },
    { id: 'Internet', name: 'Internet' },
    { id: 'Banking', name: 'Banking' },
    { id: 'Government', name: 'Government' }
  ];

  const popularBills = [
    { name: 'DSTV', icon: icons.dstv, color: '#FF6B35', count: 2, total: 730 },
    { name: 'GOTV', icon: icons.gotv, color: '#0066CC', count: 1, total: 280 },
    { name: 'TOPSTAR', icon: icons.topstar, color: '#00AA55', count: 1, total: 150 },
    { name: 'ZESCO', icon: icons.zesco, color: '#FFD700', count: 1, total: 320 },
    { name: 'Water', icon: icons.waterbill, color: '#0066FF', count: 1, total: 180 },
    { name: 'Airtel', icon: icons.airtel, color: '#FF0000', count: 1, total: 120 },
    { name: 'MTN', icon: icons.mtn, color: '#FFD700', count: 1, total: 95 },
    { name: 'Zamtel', icon: icons.zamtel, color: '#0066CC', count: 1, total: 85 },
    { name: 'Insurance', icon: '🛡️', color: '#6F42C1', count: 2, total: 450 },
    { name: 'Rent', icon: '🏠', color: '#28A745', count: 1, total: 2500 },
    { name: 'Internet', icon: '🌐', color: '#17A2B8', count: 1, total: 350 },
    { name: 'Education', icon: '📚', color: '#FD7E14', count: 1, total: 800 }
  ];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bill.accountNumber.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || bill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalDue = bills
    .filter(bill => bill.status !== 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const dueSoonBills = bills.filter(bill => bill.status === 'due');

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  const handlePayBill = (bill: Bill, amount: number) => {
    Alert.alert(
      'Confirm Payment',
      `Pay ZMW ${amount.toFixed(2)} for ${bill.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            Alert.alert(
              'Payment Successful!',
              `ZMW ${amount.toFixed(2)} paid for ${bill.name}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowBillDetails(false);
                    setSelectedBill(null);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handlePayAll = () => {
    Alert.alert(
      'Pay All Bills',
      `Pay ZMW ${totalDue.toFixed(2)} for all due bills?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay All',
          onPress: () => {
            Alert.alert(
              'Payment Successful!',
              `ZMW ${totalDue.toFixed(2)} paid for all bills`,
              [{ text: 'OK' }]
            );
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
      <Text style={styles.headerTitle}>Bill Payments</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => navigation.navigate('BillHistoryScreen')}>
          <Text style={styles.headerActionButton}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddBillScreen')}>
          <Text style={styles.headerActionButton}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search bills..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderQuickPaySummary = () => (
    <View style={styles.quickPayContainer}>
      <View style={styles.quickPayInfo}>
        <Text style={styles.quickPayLabel}>Quick Pay</Text>
        <Text style={styles.quickPayAmount}>ZMW {totalDue.toFixed(2)}</Text>
        <Text style={styles.quickPayDetails}>
          {overdueBills.length} overdue • {dueSoonBills.length} due soon
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.payAllButton}
        onPress={handlePayAll}
        disabled={totalDue === 0}
      >
        <Text style={styles.payAllButtonText}>Pay All</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.selectedCategoryText
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPopularBills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Popular Bills</Text>
      <View style={styles.popularGrid}>
        {popularBills.map((bill, index) => (
          <TouchableOpacity
            key={index}
            style={styles.popularBillCard}
            onPress={() => setSelectedCategory(bill.name === 'DSTV' || bill.name === 'GOTV' || bill.name === 'TOPSTAR' ? 'TV' : 'Utilities')}
          >
            <View style={[styles.popularIcon, { backgroundColor: bill.color }]}>
              <Image source={bill.icon} style={styles.popularIconImage} />
            </View>
            <Text style={styles.popularName}>{bill.name}</Text>
            <Text style={styles.popularCount}>{bill.count} bills</Text>
            <Text style={styles.popularTotal}>ZMW {bill.total}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBillsList = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bills</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {filteredBills.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📋</Text>
          <Text style={styles.emptyStateText}>No bills found</Text>
        </View>
      ) : (
        filteredBills.map(bill => (
          <TouchableOpacity
            key={bill.id}
            style={styles.billCard}
            onPress={() => handleBillPress(bill)}
          >
            <View style={styles.billHeader}>
              <View style={styles.billInfo}>
                <Image source={bill.icon} style={styles.billIcon} />
                <View style={styles.billDetails}>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billAccount}>
                    Account: {bill.accountNumber}
                    {bill.meterNumber && ` • Meter: ${bill.meterNumber}`}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                bill.status === 'overdue' ? styles.overdueBadge :
                bill.status === 'due' ? styles.dueBadge : styles.paidBadge
              ]}>
                <Text style={styles.statusText}>{bill.status}</Text>
              </View>
            </View>
            
            <View style={styles.billFooter}>
              <View style={styles.billAmount}>
                <Text style={styles.amountLabel}>Due {bill.dueDate}</Text>
                <Text style={styles.amountValue}>ZMW {bill.amount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.billActions}>
                <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => handlePayBill(bill, bill.amount)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.scheduleButton}>
                  <Text style={styles.scheduleButtonText}>Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderBillDetailsModal = () => (
    <Modal
      visible={showBillDetails}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBillDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedBill && (
            <>
              <View style={styles.modalHeader}>
                <Image source={selectedBill.icon} style={styles.modalIcon} />
                <Text style={styles.modalTitle}>{selectedBill.name}</Text>
              </View>
              
              <View style={styles.billDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account:</Text>
                  <Text style={styles.detailValue}>{selectedBill.accountNumber}</Text>
                </View>
                
                {selectedBill.meterNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Meter:</Text>
                    <Text style={styles.detailValue}>{selectedBill.meterNumber}</Text>
                  </View>
                )}
                
                {selectedBill.description && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Package:</Text>
                    <Text style={styles.detailValue}>{selectedBill.description}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.detailValue}>ZMW {selectedBill.amount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Due Date:</Text>
                  <Text style={styles.detailValue}>{selectedBill.dueDate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[
                    styles.detailValue,
                    selectedBill.status === 'overdue' ? styles.overdueText :
                    selectedBill.status === 'due' ? styles.dueText : styles.paidText
                  ]}>
                    {selectedBill.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.paymentOptions}>
                <Text style={styles.optionsTitle}>Payment Options:</Text>
                
                <TouchableOpacity 
                  style={styles.paymentOption}
                  onPress={() => handlePayBill(selectedBill, selectedBill.amount)}
                >
                  <Text style={styles.optionText}>Pay Full Amount (ZMW {selectedBill.amount.toFixed(2)})</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.paymentOption}>
                  <Text style={styles.optionText}>Pay Partial Amount</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.paymentOption}>
                  <Text style={styles.optionText}>Schedule Payment</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowBillDetails(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.payNowButton}
                  onPress={() => handlePayBill(selectedBill, selectedBill.amount)}
                >
                  <Text style={styles.payNowButtonText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
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
      {renderSearchBar()}
      {renderQuickPaySummary()}
      {renderCategoryFilter()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPopularBills()}
        {renderBillsList()}
      </ScrollView>
      
      {renderBillDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 100,
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    color: '#fff',
    fontSize: 18,
  },
  searchContainer: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  quickPayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  quickPayInfo: {
    flex: 1,
  },
  quickPayLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quickPayAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickPayDetails: {
    fontSize: 12,
    color: '#666',
  },
  payAllButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 8,
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
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularBillCard: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  popularIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  popularIconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  popularName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  popularCount: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  popularTotal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  billCard: {
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
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  billAccount: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueBadge: {
    backgroundColor: '#f8d7da',
  },
  dueBadge: {
    backgroundColor: '#fff3cd',
  },
  paidBadge: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billAmount: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  billActions: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  billDetails: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  overdueText: {
    color: '#dc3545',
  },
  dueText: {
    color: '#fd7e14',
  },
  paidText: {
    color: '#28a745',
  },
  paymentOptions: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  paymentOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
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
  payNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillPaymentScreen; 