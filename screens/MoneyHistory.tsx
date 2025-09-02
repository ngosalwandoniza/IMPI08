import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
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
import history from '../data/history';

interface Transaction {
    id: number;
    date: string;
    receiverLogo: string;
    receiverName: string;
    transferAmt: string;
    type?: 'sent' | 'received' | 'payment' | 'topup' | 'withdrawal';
    category?: string;
    status?: 'completed' | 'pending' | 'failed';
    reference?: string;
}

const MoneyHistory = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Enhanced transaction data with additional fields
    const enhancedHistory: Transaction[] = history.map((item: any, index) => ({
        ...item,
        type: ['sent', 'received', 'payment', 'topup', 'withdrawal'][index % 5] as any,
        category: ['Entertainment', 'Food', 'Utilities', 'Education', 'Technology'][index % 5],
        status: 'completed' as const,
        reference: `TXN${String(item.id).padStart(6, '0')}`
    }));

    const filters = [
        { id: 'all', label: 'All', icon: 'list' },
        { id: 'sent', label: 'Sent', icon: 'arrow-up' },
        { id: 'received', label: 'Received', icon: 'arrow-down' },
        { id: 'payment', label: 'Payments', icon: 'card' },
        { id: 'topup', label: 'Top Up', icon: 'add-circle' },
        { id: 'withdrawal', label: 'Withdrawal', icon: 'remove-circle' }
    ];

    const filteredTransactions = useMemo(() => {
        let filtered = enhancedHistory;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(transaction =>
                transaction.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.type === selectedFilter);
        }

        return filtered;
    }, [searchQuery, selectedFilter]);

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'sent': return { name: 'arrow-up', color: '#DC3545' };
            case 'received': return { name: 'arrow-down', color: '#28A745' };
            case 'payment': return { name: 'card', color: '#007BFF' };
            case 'topup': return { name: 'add-circle', color: '#FFC107' };
            case 'withdrawal': return { name: 'remove-circle', color: '#6F42C1' };
            default: return { name: 'swap-horizontal', color: '#6C757D' };
        }
    };

    const getTransactionAmount = (transaction: Transaction) => {
        const icon = getTransactionIcon(transaction.type || 'payment');
        const prefix = transaction.type === 'sent' || transaction.type === 'withdrawal' ? '-' : '+';
        return { prefix, icon };
    };

    const renderHeader = () => (
        <LinearGradient
            colors={["#e8f5e9", "#fff", "#e0f7fa"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>Transaction History</Text>
                    
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Ionicons name="filter" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={COLORS.gray} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{filteredTransactions.length}</Text>
                        <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            K{filteredTransactions.reduce((sum, t) => sum + parseFloat(t.transferAmt), 0).toFixed(2)}
                        </Text>
                        <Text style={styles.statLabel}>Total Amount</Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );

    const renderFilterChips = () => (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterChipsContainer}
            contentContainerStyle={styles.filterChipsContent}
        >
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter.id}
                    style={[
                        styles.filterChip,
                        selectedFilter === filter.id && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedFilter(filter.id)}
                >
                    <Ionicons 
                        name={filter.icon as any} 
                        size={16} 
                        color={selectedFilter === filter.id ? COLORS.white : COLORS.primary} 
                    />
                    <Text style={[
                        styles.filterChipText,
                        selectedFilter === filter.id && styles.filterChipTextActive
                    ]}>
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderTransactionItem = ({ item }: { item: Transaction }) => {
        const amountInfo = getTransactionAmount(item);
        
        return (
            <TouchableOpacity 
                style={styles.transactionCard}
                onPress={() => {
                    setSelectedTransaction(item);
                    setShowTransactionModal(true);
                }}
            >
                <View style={styles.transactionLeft}>
                    <View style={styles.transactionIconContainer}>
                        <Image 
                            source={{ uri: item.receiverLogo }}
                            style={styles.transactionIcon}
                        />
                        <View style={styles.transactionTypeIndicator}>
                            <Ionicons 
                                name={amountInfo.icon.name as any} 
                                size={12} 
                                color={amountInfo.icon.color} 
                            />
                        </View>
                    </View>
                    
                    <View style={styles.transactionDetails}>
                        <Text style={styles.transactionName}>{item.receiverName}</Text>
                        <Text style={styles.transactionCategory}>{item.category}</Text>
                        <Text style={styles.transactionDate}>{item.date}</Text>
                    </View>
                </View>

                <View style={styles.transactionRight}>
                    <Text style={[
                        styles.transactionAmount,
                        { color: amountInfo.prefix === '+' ? '#28A745' : '#DC3545' }
                    ]}>
                        {amountInfo.prefix}K{item.transferAmt}
                    </Text>
                    <View style={styles.transactionStatus}>
                        <View style={[styles.statusDot, { backgroundColor: '#28A745' }]} />
                        <Text style={styles.statusText}>Completed</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderTransactionModal = () => (
        <Modal
            visible={showTransactionModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTransactionModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {selectedTransaction && (
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Transaction Details</Text>
                                <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                                    <Ionicons name="close" size={24} color={COLORS.gray} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.transactionDetailCard}>
                                <Image 
                                    source={{ uri: selectedTransaction.receiverLogo }}
                                    style={styles.detailIcon}
                                />
                                <Text style={styles.detailName}>{selectedTransaction.receiverName}</Text>
                                <Text style={styles.detailCategory}>{selectedTransaction.category}</Text>
                                
                                <View style={styles.detailAmount}>
                                    <Text style={styles.detailAmountText}>
                                        K{selectedTransaction.transferAmt}
                                    </Text>
                                </View>

                                <View style={styles.detailInfo}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date:</Text>
                                        <Text style={styles.detailValue}>{selectedTransaction.date}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Reference:</Text>
                                        <Text style={styles.detailValue}>{selectedTransaction.reference}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Status:</Text>
                                        <View style={styles.detailStatus}>
                                            <View style={styles.statusDot} />
                                            <Text style={styles.detailValue}>Completed</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="download" size={20} color={COLORS.primary} />
                                    <Text style={styles.actionButtonText}>Download Receipt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="share" size={20} color={COLORS.primary} />
                                    <Text style={styles.actionButtonText}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.filterModalContent}>
                    <Text style={styles.filterModalTitle}>Filter Transactions</Text>
                    
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={styles.filterOption}
                            onPress={() => {
                                setSelectedFilter(filter.id);
                                setShowFilterModal(false);
                            }}
                        >
                            <View style={styles.filterOptionLeft}>
                                <Ionicons name={filter.icon as any} size={20} color={COLORS.primary} />
                                <Text style={styles.filterOptionText}>{filter.label}</Text>
                            </View>
                            {selectedFilter === filter.id && (
                                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderFilterChips()}
            
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderTransactionItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.transactionList}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyStateTitle}>No transactions found</Text>
                        <Text style={styles.emptyStateText}>
                            {searchQuery ? 'Try adjusting your search' : 'Your transaction history will appear here'}
                        </Text>
                    </View>
                }
            />

            {renderTransactionModal()}
            {renderFilterModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerGradient: {
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    filterButton: {
        padding: 8,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 15,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.black,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    filterChipsContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: 15,
    },
    filterChipsContent: {
        paddingHorizontal: 20,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: 10,
        backgroundColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: COLORS.primary,
        marginLeft: 5,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.white,
    },
    transactionList: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionIconContainer: {
        position: 'relative',
        marginRight: 15,
    },
    transactionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    transactionTypeIndicator: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: 2,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    transactionCategory: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: COLORS.gray,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    transactionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        color: COLORS.gray,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.gray,
        marginTop: 15,
        marginBottom: 5,
    },
    emptyStateText: {
        fontSize: 14,
        color: COLORS.gray,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    transactionDetailCard: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        marginBottom: 20,
    },
    detailIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    detailName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 5,
    },
    detailCategory: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 15,
    },
    detailAmount: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    detailAmountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    detailInfo: {
        width: '100%',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.gray,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.black,
        fontWeight: '500',
    },
    detailStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    actionButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 8,
    },
    filterModalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        width: '80%',
    },
    filterModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 20,
        textAlign: 'center',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    filterOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterOptionText: {
        fontSize: 16,
        color: COLORS.black,
        marginLeft: 15,
    },
});

export default MoneyHistory;