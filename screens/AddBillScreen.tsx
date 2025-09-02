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
import { COLORS, SIZES, icons } from '../constants';

interface AddBillScreenProps {
  navigation: { 
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface BillProvider {
  id: string;
  name: string;
  icon: any;
  color: string;
  category: string;
  fields: string[];
  examples: string[];
}

const AddBillScreen = ({ navigation }: AddBillScreenProps) => {
  const [selectedProvider, setSelectedProvider] = useState<BillProvider | null>(null);
  const [billData, setBillData] = useState<{[key: string]: string}>({});
  const [showProviderModal, setShowProviderModal] = useState(false);

  const billProviders = [
    // TV Services
    { name: 'DSTV', category: 'TV', icon: icons.dstv, color: '#FF6B35' },
    { name: 'GOTV', category: 'TV', icon: icons.gotv, color: '#0066CC' },
    { name: 'TOPSTAR', category: 'TV', icon: icons.topstar, color: '#00AA55' },
    { name: 'StarTimes', category: 'TV', icon: '📺', color: '#FF6B35' },
    
    // Utilities
    { name: 'ZESCO', category: 'Utilities', icon: icons.zesco, color: '#FFD700' },
    { name: 'Water Bill', category: 'Utilities', icon: icons.waterbill, color: '#0066FF' },
    { name: 'Lusaka Water', category: 'Utilities', icon: icons.waterbill, color: '#0066FF' },
    { name: 'Kitwe Water', category: 'Utilities', icon: icons.waterbill, color: '#0066FF' },
    { name: 'Ndola Water', category: 'Utilities', icon: icons.waterbill, color: '#0066FF' },
    
    // Mobile
    { name: 'Airtel', category: 'Mobile', icon: icons.airtel, color: '#FF0000' },
    { name: 'MTN', category: 'Mobile', icon: icons.mtn, color: '#FFD700' },
    { name: 'Zamtel', category: 'Mobile', icon: icons.zamtel, color: '#0066CC' },
    
    // Insurance
    { name: 'Zambia State Insurance', category: 'Insurance', icon: '🛡️', color: '#6F42C1' },
    { name: 'Professional Insurance', category: 'Insurance', icon: '🛡️', color: '#6F42C1' },
    { name: 'Phoenix Insurance', category: 'Insurance', icon: '🛡️', color: '#6F42C1' },
    { name: 'Madison Insurance', category: 'Insurance', icon: '🛡️', color: '#6F42C1' },
    
    // Education
    { name: 'University of Zambia', category: 'Education', icon: '📚', color: '#FD7E14' },
    { name: 'Copperbelt University', category: 'Education', icon: '📚', color: '#FD7E14' },
    { name: 'Mulungushi University', category: 'Education', icon: '📚', color: '#FD7E14' },
    { name: 'Private School Fees', category: 'Education', icon: '📚', color: '#FD7E14' },
    
    // Rent
    { name: 'Monthly Rent', category: 'Rent', icon: '🏠', color: '#28A745' },
    { name: 'Property Management', category: 'Rent', icon: '🏠', color: '#28A745' },
    
    // Internet
    { name: 'Zamtel Internet', category: 'Internet', icon: '🌐', color: '#17A2B8' },
    { name: 'MTN Internet', category: 'Internet', icon: '🌐', color: '#17A2B8' },
    { name: 'Airtel Internet', category: 'Internet', icon: '🌐', color: '#17A2B8' },
    { name: 'Liquid Telecom', category: 'Internet', icon: '🌐', color: '#17A2B8' },
    
    // Banking
    { name: 'Bank Loan', category: 'Banking', icon: '🏦', color: '#20C997' },
    { name: 'Credit Card', category: 'Banking', icon: '🏦', color: '#20C997' },
    { name: 'Bank Charges', category: 'Banking', icon: '🏦', color: '#20C997' },
    
    // Government
    { name: 'ZRA Tax', category: 'Government', icon: '🏛️', color: '#DC3545' },
    { name: 'Council Rates', category: 'Government', icon: '🏛️', color: '#DC3545' },
    { name: 'Passport Fees', category: 'Government', icon: '🏛️', color: '#DC3545' },
    { name: 'Driver\'s License', category: 'Government', icon: '🏛️', color: '#DC3545' }
  ];

  const categories = [
    { id: 'TV', name: 'TV Services', icon: '📺' },
    { id: 'Utilities', name: 'Utilities', icon: '⚡' },
    { id: 'Mobile', name: 'Mobile', icon: '📱' },
    { id: 'Insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'Education', name: 'Education', icon: '📚' },
    { id: 'Rent', name: 'Rent', icon: '🏠' },
    { id: 'Internet', name: 'Internet', icon: '🌐' },
    { id: 'Banking', name: 'Banking', icon: '🏦' },
    { id: 'Government', name: 'Government', icon: '🏛️' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProviders = billProviders.filter(provider => {
    if (selectedCategory === 'all') return true;
    return provider.category === selectedCategory;
  });

  const handleProviderSelect = (provider: BillProvider) => {
    setSelectedProvider(provider);
    setBillData({});
    setShowProviderModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setBillData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBill = () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a bill provider');
      return;
    }

    const requiredFields = selectedProvider.fields;
    const missingFields = requiredFields.filter(field => !billData[field]);

    if (missingFields.length > 0) {
      Alert.alert('Error', `Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    Alert.alert(
      'Save Bill',
      `Save ${selectedProvider.name} bill details?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            Alert.alert(
              'Success',
              `${selectedProvider.name} bill saved successfully!`,
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
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
      <Text style={styles.headerTitle}>Add New Bill</Text>
      <View style={{ width: 50 }} />
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

  const renderProviderGrid = () => (
    <View style={styles.providerSection}>
      <Text style={styles.sectionTitle}>Select Bill Provider</Text>
      <View style={styles.providerGrid}>
        {filteredProviders.map(provider => (
          <TouchableOpacity
            key={provider.name}
            style={styles.providerCard}
            onPress={() => handleProviderSelect(provider)}
          >
            <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
              <Image source={provider.icon} style={styles.providerIconImage} />
            </View>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerCategory}>{provider.category}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBillForm = () => {
    if (!selectedProvider) return null;

    return (
      <View style={styles.formSection}>
        <View style={styles.selectedProviderHeader}>
          <Image source={selectedProvider.icon} style={styles.selectedProviderIcon} />
          <View>
            <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
            <Text style={styles.selectedProviderCategory}>{selectedProvider.category}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeProviderButton}
            onPress={() => setShowProviderModal(true)}
          >
            <Text style={styles.changeProviderText}>Change</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.formTitle}>Bill Details</Text>
        
        {selectedProvider.fields.map((field, index) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{field}</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedProvider.examples[index]}
              value={billData[field] || ''}
              onChangeText={(value) => handleInputChange(field, value)}
            />
          </View>
        ))}

        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveBill}
          >
            <Text style={styles.saveButtonText}>Save Bill</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProviderModal = () => (
    <Modal
      visible={showProviderModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProviderModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Bill Provider</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {billProviders.map(provider => (
              <TouchableOpacity
                key={provider.name}
                style={styles.modalProviderItem}
                onPress={() => handleProviderSelect(provider)}
              >
                <Image source={provider.icon} style={styles.modalProviderIcon} />
                <View style={styles.modalProviderInfo}>
                  <Text style={styles.modalProviderName}>{provider.name}</Text>
                  <Text style={styles.modalProviderCategory}>{provider.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowProviderModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {renderHeader()}
      {renderCategoryFilter()}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
      >
        {!selectedProvider ? renderProviderGrid() : renderBillForm()}
      </ScrollView>
      
      {renderProviderModal()}
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
  providerSection: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  providerCard: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  providerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  providerIconImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  providerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  providerCategory: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  formSection: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
  },
  selectedProviderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedProviderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  selectedProviderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedProviderCategory: {
    fontSize: 14,
    color: '#666',
  },
  changeProviderButton: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeProviderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalProviderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalProviderIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  modalProviderInfo: {
    flex: 1,
  },
  modalProviderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalProviderCategory: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default AddBillScreen; 