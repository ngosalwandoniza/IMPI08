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
import { COLORS, SIZES, images } from '../constants';

interface EscrowPaymentScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface Courier {
  id: string;
  name: string;
  logo: any;
  rating: number;
  deliveryTime: string;
  fee: number;
}

const EscrowPaymentScreen = ({ navigation }: EscrowPaymentScreenProps) => {
  const [itemDetails, setItemDetails] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  
  const [sellerInfo, setSellerInfo] = useState({
    name: '',
    phone: '',
    location: '',
  });
  
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [showCourierModal, setShowCourierModal] = useState(false);

  const categories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Books',
    'Sports',
    'Beauty',
    'Home & Garden',
    'Other'
  ];

  const couriers: Courier[] = [
    {
      id: '1',
      name: 'PowerTools Express',
      logo: images.icon,
      rating: 4.8,
      deliveryTime: '1-2 days',
      fee: 75
    },
    {
      id: '2',
      name: 'Platinum Logistics',
      logo: images.icon,
      rating: 4.6,
      deliveryTime: '2-3 days',
      fee: 65
    },
    {
      id: '3',
      name: 'FastTrack Delivery',
      logo: images.icon,
      rating: 4.9,
      deliveryTime: 'Same day',
      fee: 95
    }
  ];

  const calculateFees = () => {
    const itemPrice = parseFloat(itemDetails.price) || 0;
    const courierFee = selectedCourier?.fee || 0;
    const escrowFee = itemPrice * 0.10; // 10% escrow fee
    const platformFee = itemPrice * 0.05; // 5% platform fee
    
    return {
      itemPrice,
      courierFee,
      escrowFee,
      platformFee,
      total: itemPrice + courierFee + escrowFee + platformFee
    };
  };

  const fees = calculateFees();

  const handleProceedToPayment = () => {
    if (!itemDetails.name || !itemDetails.price || !sellerInfo.name || !sellerInfo.phone || !selectedCourier) {
      Alert.alert('Error', 'Please fill in all required fields and select a courier');
      return;
    }

    Alert.alert(
      'Confirm Escrow Payment',
      `Total Amount: ZMW ${fees.total.toFixed(2)}\n\nThis payment will be held in escrow until the item is delivered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Payment', 
          onPress: () => {
            Alert.alert(
              'Payment Successful!',
              'Your payment has been held in escrow. A QR code has been sent to the seller. The seller will take the item to the courier for verification.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('EscrowTrackingScreen', {
                    transactionId: `ESC${Date.now()}`,
                    itemDetails,
                    sellerInfo,
                    courier: selectedCourier,
                    fees
                  })
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderItemDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Item Details</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemDetails.name}
        onChangeText={(value) => setItemDetails(prev => ({ ...prev, name: value }))}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={itemDetails.description}
        onChangeText={(value) => setItemDetails(prev => ({ ...prev, description: value }))}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Price (ZMW)"
        value={itemDetails.price}
        onChangeText={(value) => setItemDetails(prev => ({ ...prev, price: value }))}
        keyboardType="numeric"
      />
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.pickerOption,
              itemDetails.category === category && styles.selectedOption
            ]}
            onPress={() => setItemDetails(prev => ({ ...prev, category }))}
          >
            <Text style={[
              styles.pickerOptionText,
              itemDetails.category === category && styles.selectedOptionText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSellerInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Seller Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Seller Name"
        value={sellerInfo.name}
        onChangeText={(value) => setSellerInfo(prev => ({ ...prev, name: value }))}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Seller Phone Number"
        value={sellerInfo.phone}
        onChangeText={(value) => setSellerInfo(prev => ({ ...prev, phone: value }))}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Pickup Location"
        value={sellerInfo.location}
        onChangeText={(value) => setSellerInfo(prev => ({ ...prev, location: value }))}
      />
    </View>
  );

  const renderCourierSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Courier Service</Text>
      
      <TouchableOpacity 
        style={styles.courierSelector}
        onPress={() => setShowCourierModal(true)}
      >
        {selectedCourier ? (
          <View style={styles.selectedCourier}>
            <Image source={selectedCourier.logo} style={styles.courierLogo} />
            <View style={styles.courierInfo}>
              <Text style={styles.courierName}>{selectedCourier.name}</Text>
              <Text style={styles.courierDetails}>
                ⭐ {selectedCourier.rating} • {selectedCourier.deliveryTime} • ZMW {selectedCourier.fee}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.courierPlaceholder}>Select a courier service</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeeBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fee Breakdown</Text>
      
      <View style={styles.feeItem}>
        <Text style={styles.feeLabel}>Item Price</Text>
        <Text style={styles.feeValue}>ZMW {fees.itemPrice.toFixed(2)}</Text>
      </View>
      
      <View style={styles.feeItem}>
        <Text style={styles.feeLabel}>Courier Fee</Text>
        <Text style={styles.feeValue}>ZMW {fees.courierFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.feeItem}>
        <Text style={styles.feeLabel}>Escrow Fee (10%)</Text>
        <Text style={styles.feeValue}>ZMW {fees.escrowFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.feeItem}>
        <Text style={styles.feeLabel}>Platform Fee (5%)</Text>
        <Text style={styles.feeValue}>ZMW {fees.platformFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>ZMW {fees.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderCourierModal = () => (
    <Modal
      visible={showCourierModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCourierModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Courier Service</Text>
          
          {couriers.map(courier => (
            <TouchableOpacity
              key={courier.id}
              style={[
                styles.courierOption,
                selectedCourier?.id === courier.id && styles.selectedCourierOption
              ]}
              onPress={() => {
                setSelectedCourier(courier);
                setShowCourierModal(false);
              }}
            >
              <Image source={courier.logo} style={styles.courierOptionLogo} />
              <View style={styles.courierOptionInfo}>
                <Text style={styles.courierOptionName}>{courier.name}</Text>
                <Text style={styles.courierOptionDetails}>
                  ⭐ {courier.rating} • {courier.deliveryTime}
                </Text>
                <Text style={styles.courierOptionFee}>ZMW {courier.fee}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowCourierModal(false)}
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escrow Payment</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderItemDetails()}
        {renderSellerInfo()}
        {renderCourierSelection()}
        {renderFeeBreakdown()}
        
        {/* Proceed Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToPayment}>
            <Text style={styles.proceedButtonText}>
              Proceed to Payment - ZMW {fees.total.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {renderCourierModal()}
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
  section: {
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
  courierSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedCourier: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courierLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  courierInfo: {
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  courierDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  courierPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  chevron: {
    fontSize: 20,
    color: '#666',
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 16,
    color: '#333',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  buttonContainer: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  courierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedCourierOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f8ff',
  },
  courierOptionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  courierOptionInfo: {
    flex: 1,
  },
  courierOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  courierOptionDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  courierOptionFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
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
});

export default EscrowPaymentScreen; 