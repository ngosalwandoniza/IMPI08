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
import { COLORS, SIZES } from '../constants';

interface VirtualCardsScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
}

interface VirtualCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  type: 'debit' | 'credit';
  status: 'active' | 'blocked' | 'expired';
  color: string;
}

const VirtualCardsScreen = ({ navigation }: VirtualCardsScreenProps) => {
  const [cards, setCards] = useState<VirtualCard[]>([
    {
      id: '1',
      cardNumber: '**** **** **** 1234',
      cardHolder: 'John Doe',
      expiryDate: '12/25',
      cvv: '123',
      balance: 2500,
      type: 'debit',
      status: 'active',
      color: '#1e3a8a'
    },
    {
      id: '2',
      cardNumber: '**** **** **** 5678',
      cardHolder: 'John Doe',
      expiryDate: '09/26',
      cvv: '456',
      balance: 1800,
      type: 'credit',
      status: 'active',
      color: '#059669'
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [newCardData, setNewCardData] = useState({
    cardHolder: '',
    type: 'debit' as 'debit' | 'credit',
    initialBalance: ''
  });

  const handleCreateCard = () => {
    if (!newCardData.cardHolder || !newCardData.initialBalance) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const initialBalance = parseFloat(newCardData.initialBalance);
    if (isNaN(initialBalance) || initialBalance <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newCard: VirtualCard = {
      id: Date.now().toString(),
      cardNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
      cardHolder: newCardData.cardHolder,
      expiryDate: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2)}`,
      cvv: String(Math.floor(Math.random() * 900) + 100),
      balance: initialBalance,
      type: newCardData.type,
      status: 'active',
      color: newCardData.type === 'debit' ? '#1e3a8a' : '#059669'
    };

    setCards(prev => [newCard, ...prev]);
    setNewCardData({ cardHolder: '', type: 'debit', initialBalance: '' });
    setShowCreateModal(false);
    
    Alert.alert('Success', 'Virtual card created successfully!');
  };

  const handleCardAction = (card: VirtualCard, action: string) => {
    switch (action) {
      case 'block':
        setCards(prev => prev.map(c => 
          c.id === card.id ? { ...c, status: 'blocked' as const } : c
        ));
        Alert.alert('Success', 'Card blocked successfully');
        break;
      case 'unblock':
        setCards(prev => prev.map(c => 
          c.id === card.id ? { ...c, status: 'active' as const } : c
        ));
        Alert.alert('Success', 'Card unblocked successfully');
        break;
      case 'delete':
        Alert.alert(
          'Delete Card',
          'Are you sure you want to delete this card?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setCards(prev => prev.filter(c => c.id !== card.id));
                Alert.alert('Success', 'Card deleted successfully');
              }
            }
          ]
        );
        break;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Virtual Cards</Text>
      <TouchableOpacity onPress={() => setShowCreateModal(true)}>
        <Text style={styles.addButton}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCard = (card: VirtualCard) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.cardContainer, { backgroundColor: card.color }]}
      onPress={() => {
        setSelectedCard(card);
        setShowCardDetails(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{card.type.toUpperCase()}</Text>
        <View style={[
          styles.statusIndicator,
          card.status === 'active' ? styles.activeIndicator :
          card.status === 'blocked' ? styles.blockedIndicator :
          styles.expiredIndicator
        ]} />
      </View>
      
      <Text style={styles.cardNumber}>{card.cardNumber}</Text>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardHolderLabel}>CARD HOLDER</Text>
          <Text style={styles.cardHolder}>{card.cardHolder}</Text>
        </View>
        
        <View>
          <Text style={styles.expiryLabel}>EXPIRES</Text>
          <Text style={styles.expiryDate}>{card.expiryDate}</Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.cardAction}
          onPress={() => handleCardAction(card, card.status === 'active' ? 'block' : 'unblock')}
        >
          <Text style={styles.cardActionText}>
            {card.status === 'active' ? '🔒 Block' : '🔓 Unblock'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cardAction}
          onPress={() => handleCardAction(card, 'delete')}
        >
          <Text style={styles.cardActionText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Virtual Card</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Card Holder Name"
            value={newCardData.cardHolder}
            onChangeText={(value) => setNewCardData(prev => ({ ...prev, cardHolder: value }))}
          />
          
          <Text style={styles.label}>Card Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                newCardData.type === 'debit' && styles.selectedType
              ]}
              onPress={() => setNewCardData(prev => ({ ...prev, type: 'debit' }))}
            >
              <Text style={[
                styles.typeOptionText,
                newCardData.type === 'debit' && styles.selectedTypeText
              ]}>
                Debit Card
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeOption,
                newCardData.type === 'credit' && styles.selectedType
              ]}
              onPress={() => setNewCardData(prev => ({ ...prev, type: 'credit' }))}
            >
              <Text style={[
                styles.typeOptionText,
                newCardData.type === 'credit' && styles.selectedTypeText
              ]}>
                Credit Card
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Initial Balance (ZMW)"
            value={newCardData.initialBalance}
            onChangeText={(value) => setNewCardData(prev => ({ ...prev, initialBalance: value }))}
            keyboardType="numeric"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateCard}
            >
              <Text style={styles.createButtonText}>Create Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCardDetailsModal = () => (
    <Modal
      visible={showCardDetails}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCardDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Card Details</Text>
          
          {selectedCard && (
            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Number:</Text>
                <Text style={styles.detailValue}>{selectedCard.cardNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Holder:</Text>
                <Text style={styles.detailValue}>{selectedCard.cardHolder}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date:</Text>
                <Text style={styles.detailValue}>{selectedCard.expiryDate}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CVV:</Text>
                <Text style={styles.detailValue}>{selectedCard.cvv}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance:</Text>
                <Text style={styles.detailValue}>ZMW {selectedCard.balance.toFixed(2)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{selectedCard.status}</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowCardDetails(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💳</Text>
              <Text style={styles.emptyStateTitle}>No Virtual Cards</Text>
              <Text style={styles.emptyStateText}>
                Create your first virtual card to start making secure online payments.
              </Text>
              <TouchableOpacity 
                style={styles.createFirstButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstButtonText}>Create Your First Card</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cards.map(renderCard)
          )}
        </View>
      </ScrollView>
      
      {renderCreateModal()}
      {renderCardDetailsModal()}
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
  addButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.padding,
  },
  cardContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardType: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeIndicator: {
    backgroundColor: '#10b981',
  },
  blockedIndicator: {
    backgroundColor: '#ef4444',
  },
  expiredIndicator: {
    backgroundColor: '#f59e0b',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardHolderLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardHolder: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expiryLabel: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 4,
  },
  expiryDate: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTypeText: {
    color: '#fff',
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
  createButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
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
  closeButton: {
    backgroundColor: COLORS.primary,
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

export default VirtualCardsScreen; 