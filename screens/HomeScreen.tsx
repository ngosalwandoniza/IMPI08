import React, { useEffect, useState } from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { COLORS, FONTS, icons, SIZES } from '../constants';
import { features } from '../data/features';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { getAuthToken } from './LoginScreen';

const HomeScreen = (props: any) => {
    const [userProfile, setUserProfile] = useState<{ username?: string; email?: string } | null>(null);
    const [walletBalance, setWalletBalance] = useState<string>('0.00');
    const navigation = useNavigation();
    const route = useRoute();
    const email = ((route.params as any)?.email as string) || (props?.route?.params?.email as string);
    const[walletId,setWalletId] = useState<string | null>(null);
    // Use activity tracking hook
    const { recordActivity } = useActivityTracking();

    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = await getAuthToken();
            if (!token) return;
            try {
                const response = await fetch('http://10.228.195.3:8000/api/accounts/profile/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                }
            } catch (e) {}
        };
        fetchProfile();
        // Fetch wallet details as well
        const fetchWalletDetails = async () => {
            const token = await getAuthToken();
            if(!token) return;
            try{
                const response = await fetch('http://10.228.195.3:8000//api/wallet/',{
                    headers:{
                        'Authorization': `Bearer ${token}`,
                        'Content-Type':'application/json',
                    },
                });
                if(response.ok){
                    const data = await response.json();
                    console.log('Wallet details response:',data);
                    if (data.wallet_id) {
                        setWalletId(data.wallet_id);
                    } else {
                        setWalletId('Not found');
                    }
                } else {
                    setWalletId('Error');
                }
            } catch(e){
                setWalletId('Error');
                console.log('Error fetching wallet details',e);
            }
        };
        fetchWalletDetails();
    }, []);

    // Use useFocusEffect to refresh balance when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            const fetchWalletBalance = async () => {
                const token = await getAuthToken();
                if (!token) return;
                try {
                    const response = await fetch('http://10.228.195.3:8000/api/wallet/balance/', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setWalletBalance(data.balance);
                        }
                    }
                } catch (e) {
                    console.log('Error fetching wallet balance:', e);
                }
            };
            fetchWalletBalance();
        }, [])
    );

    const displayUsername = userProfile?.username || 'No username found';

    // Record activity on any user interaction
    const handleUserInteraction = () => {
        recordActivity();
    };

    function renderHeader() {
        return (
            <View style={{ flexDirection: 'row', marginVertical: SIZES.padding * 2}}>
                <View style={{ flex: 1}}>
                    <Text style={{ ...FONTS.h2, fontSize: 20 }}>Welcome, {displayUsername}!</Text>
                    <Text style={{ ...FONTS.body4,color:COLORS.gray}}>
                        Wallet ID: {walletId ? walletId : 'Loading...'}
                    </Text>
                </View>
                <View style={{
                    alignItems: "center",
                    justifyContent: 'center'
                }}>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            width: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: COLORS.lightGray
                        }}
                        onPress={() => {
                            handleUserInteraction();
                            (navigation as any).navigate('NotificationsScreen');
                        }}
                    >
                        <Image 
                            source={icons.bell}
                            resizeMode="contain"
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: COLORS.secondary
                            }}
                        />
                        <View style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            height: 10,
                            width: 10,
                            backgroundColor: COLORS.red,
                            borderRadius: 5
                        }}>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    function renderBalance() {
        return (
            <View style={{
                backgroundColor: COLORS.primary,
                borderRadius: 20,
                padding: SIZES.padding * 2,
                marginBottom: SIZES.padding * 2
            }}>
                <Text style={{
                    color: COLORS.white,
                    ...FONTS.body4,
                    opacity: 0.8
                }}>
                    Available Balance
                </Text>
                <Text style={{
                    color: COLORS.white,
                    ...FONTS.h1,
                    marginTop: 5
                }}>
                    ZMW {parseFloat(walletBalance).toFixed(2)}
                </Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: SIZES.padding
                }}>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            paddingHorizontal: SIZES.padding,
                            paddingVertical: 8,
                            borderRadius: 15
                        }}
                        onPress={() => {
                            handleUserInteraction();
                            (navigation as any).navigate('DepositScreen');
                        }}
                    >
                        <Text style={{
                            color: COLORS.white,
                            ...FONTS.body4
                        }}>
                            Add Money
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            paddingHorizontal: SIZES.padding,
                            paddingVertical: 8,
                            borderRadius: 15
                        }}
                        onPress={() => {
                            handleUserInteraction();
                            (navigation as any).navigate('WithdrawalScreen');
                        }}
                    >
                        <Text style={{
                            color: COLORS.white,
                            ...FONTS.body4
                        }}>
                            Withdrawal
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    function renderFeatures() {
        const renderItem = ({ item }: { item: any }) => (
            <TouchableOpacity
                key={item.id}
                style={{
                    marginBottom: SIZES.padding * 2,
                    width: 70,
                    alignItems: 'center',
                }}
                onPress={() => {
                    handleUserInteraction();
                    if (item.screen === 'Transfer') {
                        (navigation as any).navigate('TransferScreen');
                    } else if (item.screen === 'LinkAccount') {
                        (navigation as any).navigate('LinkAccount');
                    } else if (item.screen === 'TopUp') {
                        (navigation as any).navigate('TopUpScreen');
                    } else if (item.screen === 'BillPayment') {
                        (navigation as any).navigate('BillPaymentScreen');
                    } else if (item.screen === 'Savings') {
                        (navigation as any).navigate('SavingsScreen');
                    } else if (item.screen === 'EscrowPayment') {
                        (navigation as any).navigate('EscrowPaymentScreen');
                    } else if (item.screen === 'VirtualCards') {
                        (navigation as any).navigate('VirtualCardsScreen');
                    } else if (item.screen === 'MerchantRegistration') {
                        (navigation as any).navigate('MerchantRegistration');
                    } else {
                        console.log('Tapped:', item.title);
                    }
                }}
            >
                <View
                    style={{
                        height: 60,
                        width: 60,
                        marginBottom: 8,
                        backgroundColor: item.tint + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 15,
                    }}
                >
                    {typeof item.icon === 'string' ? (
                        <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                    ) : (
                        <Image 
                            source={item.icon}
                            resizeMode="contain"
                            style={{
                                width: 25,
                                height: 25,
                                tintColor: item.tint
                            }}
                        />
                    )}
                </View>
                <Text style={{
                    ...FONTS.body4,
                    color: COLORS.black,
                    textAlign: 'center',
                    fontSize: 10
                }}>
                    {item.title}
                </Text>
            </TouchableOpacity>
        );

        return (
            <View style={{ marginBottom: SIZES.padding * 2 }}>
                <Text style={{
                    ...FONTS.h3,
                    marginBottom: SIZES.padding
                }}>
                    Quick Actions
                </Text>
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    paddingHorizontal: SIZES.padding
                }}>
                    {features.map((item) => renderItem({ item }))}
                </View>
            </View>
        )
    }

    function renderRecentTransactions() {
        const transactions = [
            { id: 1, type: 'Sent', amount: '-ZMW 50.00', recipient: 'John Doe', time: '2 hours ago', icon: icons.send },
            { id: 2, type: 'Received', amount: '+ZMW 120.00', recipient: 'Jane Smith', time: '1 day ago', icon: icons.wallet },
            { id: 3, type: 'Payment', amount: '-ZMW 25.00', recipient: 'Coffee Shop', time: '2 days ago', icon: icons.bill },
        ]

        interface Transaction {
            id: number;
            type: string;
            amount: string;
            recipient: string;
            time: string;
            icon: any;
        }

        const renderTransaction = ({ item }: { item: Transaction }) => (
            <TouchableOpacity 
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SIZES.padding,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.lightGray
                }}
                onPress={handleUserInteraction}
            >
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: item.type === 'Sent' ? COLORS.lightRed : COLORS.lightGreen,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SIZES.padding
                }}>
                    <Image 
                        source={item.icon}
                        resizeMode="contain"
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: item.type === 'Sent' ? COLORS.red : COLORS.primary
                        }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...FONTS.body3, color: COLORS.black }}>
                        {item.recipient}
                    </Text>
                    <Text style={{ ...FONTS.body4, color: COLORS.gray }}>
                        {item.time}
                    </Text>
                </View>
                <Text style={{ 
                    ...FONTS.body3, 
                    color: item.type === 'Sent' ? COLORS.red : COLORS.primary,
                    fontWeight: '600'
                }}>
                    {item.amount}
                </Text>
            </TouchableOpacity>
        )

        return (
            <View style={{ marginTop: SIZES.padding * 2 }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SIZES.padding
                }}>
                    <Text style={{ ...FONTS.h4, color: COLORS.black }}>
                        Recent Transactions
                    </Text>
                    <TouchableOpacity onPress={() => {
                        handleUserInteraction();
                        (navigation as any).navigate('MoneyHistory');
                    }}>
                        <Text style={{ 
                            color: COLORS.primary, 
                            ...FONTS.body4,
                            textDecorationLine: 'underline'
                        }}>
                            View All
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 15,
                    padding: SIZES.padding
                }}>
                    {transactions.map((item) => (
                        <View key={item.id}>
                            {renderTransaction({ item })}
                        </View>
                    ))}
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGray}}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingBottom: 120}}
                showsVerticalScrollIndicator={false}
                onScroll={handleUserInteraction}
            >
                { renderHeader()}
                { renderBalance()}
                { renderFeatures()}
                { renderRecentTransactions()}
            </ScrollView>
        </View>
    )
}

export default HomeScreen