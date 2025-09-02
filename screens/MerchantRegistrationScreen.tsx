import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, SIZES } from '../constants';

interface MerchantRegistrationScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

const MerchantRegistrationScreen = ({ navigation }: MerchantRegistrationScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    businessType: '',
    businessAddress: '',
    city: '',
    phoneNumber: '',
    email: '',
    
    // Owner Information
    ownerName: '',
    ownerID: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    
    // Business Documents
    businessLicense: null,
    taxCertificate: null,
    bankStatement: null,
    
    // Account Setup
    username: '',
    password: '',
    confirmPassword: '',
  });

  const businessTypes = [
    'Retail Store',
    'Restaurant',
    'Electronics Shop',
    'Clothing Store',
    'Grocery Store',
    'Pharmacy',
    'Hardware Store',
    'Beauty Salon',
    'Other'
  ];

  const banks = [
    'ZANACO',
    'Barclays Bank',
    'Stanbic Bank',
    'First National Bank',
    'Indo Zambia Bank',
    'Cavmont Bank',
    'Finance Bank',
    'Other'
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.businessName || !formData.businessType || !formData.businessAddress || 
            !formData.city || !formData.phoneNumber || !formData.email) {
          Alert.alert('Error', 'Please fill in all business information fields');
          return false;
        }
        break;
      case 2:
        if (!formData.ownerName || !formData.ownerID || !formData.ownerPhone || !formData.ownerEmail) {
          Alert.alert('Error', 'Please fill in all owner information fields');
          return false;
        }
        break;
      case 3:
        if (!formData.bankName || !formData.accountNumber || !formData.accountHolderName) {
          Alert.alert('Error', 'Please fill in all bank information fields');
          return false;
        }
        break;
      case 4:
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          Alert.alert('Error', 'Please fill in all account setup fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          Alert.alert('Error', 'Password must be at least 8 characters long');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Registration Submitted',
      'Your merchant account application has been submitted for review. We will contact you within 2-3 business days.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MerchantDashboard')
        }
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(step => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.activeStep : styles.inactiveStep
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step ? styles.activeStepText : styles.inactiveStepText
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.activeLine : styles.inactiveLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderBusinessInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={formData.businessName}
        onChangeText={(value) => updateFormData('businessName', value)}
      />
      
      <Text style={styles.label}>Business Type</Text>
      <View style={styles.pickerContainer}>
        {businessTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.pickerOption,
              formData.businessType === type && styles.selectedOption
            ]}
            onPress={() => updateFormData('businessType', type)}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.businessType === type && styles.selectedOptionText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Business Address"
        value={formData.businessAddress}
        onChangeText={(value) => updateFormData('businessAddress', value)}
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.city}
        onChangeText={(value) => updateFormData('city', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Business Phone Number"
        value={formData.phoneNumber}
        onChangeText={(value) => updateFormData('phoneNumber', value)}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Business Email"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
      />
    </View>
  );

  const renderOwnerInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Owner Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Owner Full Name"
        value={formData.ownerName}
        onChangeText={(value) => updateFormData('ownerName', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="National ID Number"
        value={formData.ownerID}
        onChangeText={(value) => updateFormData('ownerID', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Owner Phone Number"
        value={formData.ownerPhone}
        onChangeText={(value) => updateFormData('ownerPhone', value)}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Owner Email"
        value={formData.ownerEmail}
        onChangeText={(value) => updateFormData('ownerEmail', value)}
        keyboardType="email-address"
      />
    </View>
  );

  const renderBankInfo = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Bank Information</Text>
      
      <Text style={styles.label}>Bank Name</Text>
      <View style={styles.pickerContainer}>
        {banks.map(bank => (
          <TouchableOpacity
            key={bank}
            style={[
              styles.pickerOption,
              formData.bankName === bank && styles.selectedOption
            ]}
            onPress={() => updateFormData('bankName', bank)}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.bankName === bank && styles.selectedOptionText
            ]}>
              {bank}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Account Number"
        value={formData.accountNumber}
        onChangeText={(value) => updateFormData('accountNumber', value)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Account Holder Name"
        value={formData.accountHolderName}
        onChangeText={(value) => updateFormData('accountHolderName', value)}
      />
    </View>
  );

  const renderAccountSetup = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Account Setup</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(value) => updateFormData('username', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        secureTextEntry
      />
      
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        <Text style={styles.requirement}>• At least 8 characters long</Text>
        <Text style={styles.requirement}>• Include uppercase and lowercase letters</Text>
        <Text style={styles.requirement}>• Include at least one number</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBusinessInfo();
      case 2:
        return renderOwnerInfo();
      case 3:
        return renderBankInfo();
      case 4:
        return renderAccountSetup();
      default:
        return renderBusinessInfo();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant Registration</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.nextButton, currentStep === 4 && styles.submitButton]} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 4 ? 'Submit Application' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  inactiveStep: {
    backgroundColor: '#e0e0e0',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: '#fff',
  },
  inactiveStepText: {
    color: '#666',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 5,
  },
  activeLine: {
    backgroundColor: COLORS.primary,
  },
  inactiveLine: {
    backgroundColor: '#e0e0e0',
  },
  stepContent: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MerchantRegistrationScreen; 