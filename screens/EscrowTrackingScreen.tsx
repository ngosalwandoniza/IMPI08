import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS, SIZES } from '../constants';

interface EscrowTrackingScreenProps {
  navigation: { navigate: (screen: string, params?: any) => void };
  route: { params: any };
}

interface TransactionStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  time?: string;
}

const EscrowTrackingScreen = ({ navigation, route }: EscrowTrackingScreenProps) => {
  const { transactionId, itemDetails, sellerInfo, courier, fees } = route.params;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<TransactionStep[]>([
    {
      id: 1,
      title: 'Payment Made',
      description: 'Payment held in escrow',
      status: 'completed',
      time: '2 min ago'
    },
    {
      id: 2,
      title: 'QR Code Sent',
      description: 'Seller received QR code',
      status: 'current',
      time: '1 min ago'
    },
    {
      id: 3,
      title: 'Item Pickup',
      description: 'Seller takes item to courier',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Courier Verification',
      description: 'Courier scans QR and verifies item',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Payment Released',
      description: 'Seller receives payment',
      status: 'pending'
    },
    {
      id: 6,
      title: 'Item Delivered',
      description: 'Item delivered to you',
      status: 'pending'
    }
  ]);

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < 6) {
          const newSteps = steps.map(step => {
            if (step.id === prev + 1) {
              return { ...step, status: 'current' as const, time: 'Just now' };
            } else if (step.id <= prev) {
              return { ...step, status: 'completed' as const };
            }
            return step;
          });
          setSteps(newSteps);
          return prev + 1;
        }
        return prev;
      });
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, [currentStep, steps]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'current':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '⏳';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Transaction Tracking</Text>
      <View style={{ width: 50 }} />
    </View>
  );

  const renderTransactionInfo = () => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Transaction Details</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.transactionId}>ID: {transactionId}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Item:</Text>
          <Text style={styles.infoValue}>{itemDetails.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>ZMW {fees.total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Seller:</Text>
          <Text style={styles.infoValue}>{sellerInfo.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Courier:</Text>
          <Text style={styles.infoValue}>{courier.name}</Text>
        </View>
      </View>
    </View>
  );

  const renderProgressSteps = () => (
    <View style={styles.progressSection}>
      <Text style={styles.sectionTitle}>Transaction Progress</Text>
      
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={styles.stepIconContainer}>
            <Text style={styles.stepIcon}>{getStepIcon(step.status)}</Text>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                step.status === 'completed' ? styles.completedLine : styles.pendingLine
              ]} />
            )}
          </View>
          
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[
                styles.stepTitle,
                step.status === 'completed' && styles.completedText,
                step.status === 'current' && styles.currentText
              ]}>
                {step.title}
              </Text>
              {step.time && (
                <Text style={styles.stepTime}>{step.time}</Text>
              )}
            </View>
            
            <Text style={[
              styles.stepDescription,
              step.status === 'completed' && styles.completedText
            ]}>
              {step.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEstimatedTime = () => (
    <View style={styles.estimatedSection}>
      <Text style={styles.sectionTitle}>Estimated Timeline</Text>
      
      <View style={styles.timelineCard}>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineTime}>Today</Text>
          <Text style={styles.timelineEvent}>Payment & QR Code Sent</Text>
        </View>
        
        <View style={styles.timelineItem}>
          <Text style={styles.timelineTime}>Tomorrow</Text>
          <Text style={styles.timelineEvent}>Item Pickup & Verification</Text>
        </View>
        
        <View style={styles.timelineItem}>
          <Text style={styles.timelineTime}>Day 3</Text>
          <Text style={styles.timelineEvent}>Item Delivered</Text>
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Contact Seller</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
        <Text style={styles.secondaryButtonText}>Contact Courier</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.actionButton, styles.tertiaryButton]}>
        <Text style={styles.tertiaryButtonText}>Report Issue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTransactionInfo()}
        {renderProgressSteps()}
        {renderEstimatedTime()}
        {renderActions()}
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
  infoSection: {
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
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressSection: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  stepLine: {
    width: 2,
    height: 40,
  },
  completedLine: {
    backgroundColor: COLORS.primary,
  },
  pendingLine: {
    backgroundColor: '#e0e0e0',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stepTime: {
    fontSize: 12,
    color: '#666',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    color: COLORS.primary,
  },
  currentText: {
    color: '#ff9500',
  },
  estimatedSection: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  timelineCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 60,
  },
  timelineEvent: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionsSection: {
    padding: SIZES.padding,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tertiaryButton: {
    backgroundColor: '#dc3545',
  },
  tertiaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EscrowTrackingScreen; 