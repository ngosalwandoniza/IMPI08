import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { COLORS } from '../constants';

interface Notification {
    id: string;
    type: 'transaction' | 'security' | 'promotion' | 'system' | 'announcement';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    priority: 'high' | 'medium' | 'low';
    action?: string;
    data?: any;
}

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Sample notifications data
    const notifications: Notification[] = [
        {
            id: '1',
            type: 'transaction',
            title: 'Payment Successful',
            message: 'Your payment of ZMW 150.00 to DSTV has been completed successfully. Transaction ID: TXN001234',
            timestamp: '2 minutes ago',
            isRead: false,
            priority: 'high',
            action: 'View Receipt',
            data: { amount: 'ZMW 150.00', recipient: 'DSTV', transactionId: 'TXN001234' }
        },
        {
            id: '2',
            type: 'security',
            title: 'New Device Login',
            message: 'A new device has logged into your account from Lusaka, Zambia. If this wasn\'t you, please contact support immediately.',
            timestamp: '1 hour ago',
            isRead: false,
            priority: 'high',
            action: 'Review Activity',
            data: { location: 'Lusaka, Zambia', device: 'iPhone 15' }
        },
        {
            id: '3',
            type: 'promotion',
            title: 'Special Offer: 50% Off Airtime',
            message: 'Get 50% off on all airtime purchases this weekend! Use code WEEKEND50 at checkout. Valid until Sunday.',
            timestamp: '3 hours ago',
            isRead: true,
            priority: 'medium',
            action: 'Shop Now',
            data: { promoCode: 'WEEKEND50', validUntil: 'Sunday' }
        },
        {
            id: '4',
            type: 'announcement',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM. Some services may be temporarily unavailable.',
            timestamp: '1 day ago',
            isRead: true,
            priority: 'medium',
            action: 'Learn More',
            data: { maintenanceTime: '2:00 AM - 4:00 AM', date: 'Sunday' }
        },
        {
            id: '5',
            type: 'transaction',
            title: 'Money Received',
            message: 'You received ZMW 500.00 from John Doe. Your new balance is ZMW 2,950.00',
            timestamp: '2 days ago',
            isRead: true,
            priority: 'high',
            action: 'View Details',
            data: { amount: 'ZMW 500.00', sender: 'John Doe', newBalance: 'ZMW 2,950.00' }
        },
        {
            id: '6',
            type: 'system',
            title: 'App Update Available',
            message: 'A new version of Impiy is available with improved security features and bug fixes. Update now for the best experience.',
            timestamp: '3 days ago',
            isRead: true,
            priority: 'low',
            action: 'Update Now',
            data: { version: '2.1.0', features: ['Security improvements', 'Bug fixes'] }
        },
        {
            id: '7',
            type: 'promotion',
            title: 'Referral Bonus',
            message: 'Invite friends to Impiy and earn ZMW 50 for each successful referral! Share your referral code: IMPIY123',
            timestamp: '1 week ago',
            isRead: true,
            priority: 'medium',
            action: 'Invite Friends',
            data: { bonus: 'ZMW 50', referralCode: 'IMPIY123' }
        },
        {
            id: '8',
            type: 'security',
            title: 'Password Changed',
            message: 'Your account password was successfully changed. If you didn\'t make this change, please contact support.',
            timestamp: '1 week ago',
            isRead: true,
            priority: 'high',
            action: 'Review Security',
            data: { changeTime: '1 week ago' }
        }
    ];

    const filters = [
        { id: 'all', label: 'All', icon: 'notifications' },
        { id: 'transaction', label: 'Transactions', icon: 'card' },
        { id: 'security', label: 'Security', icon: 'shield' },
        { id: 'promotion', label: 'Promotions', icon: 'gift' },
        { id: 'announcement', label: 'Announcements', icon: 'megaphone' },
        { id: 'system', label: 'System', icon: 'settings' }
    ];

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === 'all') {
            return notifications;
        }
        return notifications.filter(notification => notification.type === selectedFilter);
    }, [selectedFilter]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'transaction': return { name: 'card', color: '#28A745' };
            case 'security': return { name: 'shield-checkmark', color: '#DC3545' };
            case 'promotion': return { name: 'gift', color: '#FFC107' };
            case 'announcement': return { name: 'megaphone', color: '#007BFF' };
            case 'system': return { name: 'settings', color: '#6C757D' };
            default: return { name: 'notifications', color: '#6C757D' };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#DC3545';
            case 'medium': return '#FFC107';
            case 'low': return '#6C757D';
            default: return '#6C757D';
        }
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
                    
                    <Text style={styles.headerTitle}>Notifications</Text>
                    
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={() => Alert.alert('Mark All Read', 'All notifications marked as read')}
                    >
                        <Text style={styles.markAllText}>Mark All Read</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{notifications.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{unreadCount}</Text>
                        <Text style={styles.statLabel}>Unread</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{filteredNotifications.length}</Text>
                        <Text style={styles.statLabel}>Filtered</Text>
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

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const icon = getNotificationIcon(item.type);
        
        return (
            <TouchableOpacity 
                style={[
                    styles.notificationCard,
                    !item.isRead && styles.unreadCard
                ]}
                onPress={() => {
                    setSelectedNotification(item);
                    setShowDetailModal(true);
                }}
            >
                <View style={styles.notificationLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name as any} size={24} color={icon.color} />
                    </View>
                    
                    <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitle}>{item.title}</Text>
                            {!item.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                            {item.message}
                        </Text>
                        <Text style={styles.notificationTime}>{item.timestamp}</Text>
                    </View>
                </View>

                <View style={styles.notificationRight}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
                    <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailModal = () => (
        <Modal
            visible={showDetailModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDetailModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {selectedNotification && (
                        <>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Notification Details</Text>
                                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                    <Ionicons name="close" size={24} color={COLORS.gray} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.notificationDetailCard}>
                                <View style={styles.detailIconContainer}>
                                    <Ionicons 
                                        name={getNotificationIcon(selectedNotification.type).name as any} 
                                        size={40} 
                                        color={getNotificationIcon(selectedNotification.type).color} 
                                    />
                                </View>
                                
                                <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
                                <Text style={styles.detailMessage}>{selectedNotification.message}</Text>
                                
                                <View style={styles.detailInfo}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Time:</Text>
                                        <Text style={styles.detailValue}>{selectedNotification.timestamp}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Priority:</Text>
                                        <View style={styles.detailPriority}>
                                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(selectedNotification.priority) }]} />
                                            <Text style={styles.detailValue}>{selectedNotification.priority}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Status:</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedNotification.isRead ? 'Read' : 'Unread'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {selectedNotification.action && (
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setShowDetailModal(false);
                                        Alert.alert('Action', `Executing: ${selectedNotification.action}`);
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>{selectedNotification.action}</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderFilterChips()}
            
            <FlatList
                data={filteredNotifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notificationList}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyStateTitle}>No notifications</Text>
                        <Text style={styles.emptyStateText}>
                            {selectedFilter === 'all' 
                                ? 'You\'re all caught up!' 
                                : `No ${selectedFilter} notifications found`
                            }
                        </Text>
                    </View>
                }
            />

            {renderDetailModal()}
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
    markAllButton: {
        padding: 8,
    },
    markAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
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
    notificationList: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    notificationCard: {
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
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 4,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 12,
        color: COLORS.gray,
    },
    notificationRight: {
        alignItems: 'center',
    },
    priorityIndicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        marginBottom: 8,
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
    notificationDetailCard: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        marginBottom: 20,
    },
    detailIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 10,
        textAlign: 'center',
    },
    detailMessage: {
        fontSize: 16,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
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
    detailPriority: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NotificationsScreen; 