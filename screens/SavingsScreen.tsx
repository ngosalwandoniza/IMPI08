import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
  deadline: string;
  createdAt: string;
  description: string;
}

const SavingsScreen: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      title: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 3200,
      icon: '🛡️',
      color: '#6F42C1',
      deadline: '2024-06-30',
      createdAt: '2024-01-01',
      description: 'Save for unexpected expenses'
    },
    {
      id: '2',
      title: 'Vacation Fund',
      targetAmount: 3000,
      currentAmount: 1800,
      icon: '✈️',
      color: '#17A2B8',
      deadline: '2024-08-15',
      createdAt: '2024-02-01',
      description: 'Trip to South Africa'
    },
    {
      id: '3',
      title: 'New Phone',
      targetAmount: 1500,
      currentAmount: 950,
      icon: '📱',
      color: '#28A745',
      deadline: '2024-05-20',
      createdAt: '2024-03-01',
      description: 'iPhone 15 Pro'
    }
  ]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    description: '',
    deadline: '',
    icon: '💰'
  });
  const [addAmount, setAddAmount] = useState('');

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#28A745';
    if (progress >= 60) return '#FFC107';
    if (progress >= 40) return '#FD7E14';
    return '#DC3545';
  };

  const addNewGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      icon: newGoal.icon,
      color: '#FF6B35',
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString().split('T')[0],
      description: newGoal.description
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', targetAmount: '', description: '', deadline: '', icon: '💰' });
    setShowAddGoal(false);
  };

  const addMoneyToGoal = () => {
    if (!selectedGoal || !addAmount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const updatedGoals = goals.map(goal =>
      goal.id === selectedGoal.id
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    );

    setGoals(updatedGoals);
    setAddAmount('');
    setShowAddMoney(false);
    setSelectedGoal(null);
    Alert.alert('Success', `Added K${amount} to ${selectedGoal.title}`);
  };

  const formatCurrency = (amount: number) => {
    return `K${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Savings Goals</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddGoal(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Overall Progress */}
        <View style={styles.overallCard}>
          <Text style={styles.overallTitle}>Total Savings Progress</Text>
          <View style={styles.overallStats}>
            <View style={styles.statItem}>
              <Text style={styles.statAmount}>{formatCurrency(totalSaved)}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statAmount}>{formatCurrency(totalTarget)}</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statAmount}>{overallProgress.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(overallProgress, 100)}%`,
                  backgroundColor: getProgressColor(overallProgress)
                }
              ]} 
            />
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = getDaysRemaining(goal.deadline);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => {
                  setSelectedGoal(goal);
                  setShowAddMoney(true);
                }}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalIconContainer}>
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </View>
                  <View style={styles.goalProgress}>
                    <Text style={styles.goalProgressText}>{progress.toFixed(1)}%</Text>
                  </View>
                </View>

                <View style={styles.goalAmounts}>
                  <Text style={styles.goalCurrent}>
                    {formatCurrency(goal.currentAmount)}
                  </Text>
                  <Text style={styles.goalTarget}>
                    / {formatCurrency(goal.targetAmount)}
                  </Text>
                </View>

                <View style={styles.goalProgressBar}>
                  <View 
                    style={[
                      styles.goalProgressFill, 
                      { 
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: getProgressColor(progress)
                      }
                    ]} 
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.goalDeadline}>
                    Due: {formatDate(goal.deadline)}
                  </Text>
                  <Text style={[
                    styles.goalDaysRemaining,
                    { color: daysRemaining < 30 ? '#DC3545' : '#6C757D' }
                  ]}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trending-up" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Savings Tips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Auto Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="analytics" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddGoal(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Goal Title"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({...newGoal, title: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Target Amount (K)"
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal({...newGoal, targetAmount: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({...newGoal, description: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Deadline (YYYY-MM-DD)"
              value={newGoal.deadline}
              onChangeText={(text) => setNewGoal({...newGoal, deadline: text})}
            />

            <TouchableOpacity style={styles.modalButton} onPress={addNewGoal}>
              <Text style={styles.modalButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={showAddMoney}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Goal</Text>
              <TouchableOpacity onPress={() => setShowAddMoney(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
              <View style={styles.selectedGoalInfo}>
                <Text style={styles.selectedGoalTitle}>{selectedGoal.title}</Text>
                <Text style={styles.selectedGoalProgress}>
                  {formatCurrency(selectedGoal.currentAmount)} / {formatCurrency(selectedGoal.targetAmount)}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Amount to Add (K)"
              value={addAmount}
              onChangeText={setAddAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.modalButton} onPress={addMoneyToGoal}>
              <Text style={styles.modalButtonText}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 15,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  goalDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  goalProgress: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  goalCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  goalTarget: {
    fontSize: 14,
    color: COLORS.gray,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
    color: COLORS.gray,
  },
  goalDaysRemaining: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: COLORS.dark,
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedGoalInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  selectedGoalProgress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
  },
});

export default SavingsScreen; 