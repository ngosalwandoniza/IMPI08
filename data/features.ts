import { icons } from '../constants';

export const features = [
    {
        id: 1,
        title: 'Transfer',
        icon: icons.send,
        tint: '#FF6B35',
        screen: 'Transfer'
    },
    {
        id: 2,
        title: 'Link Account',
        icon: icons.user,
        tint: '#28A745',
        screen: 'LinkAccount'
    },
    {
        id: 3,
        title: 'Top Up',
        icon: icons.phone,
        tint: '#17A2B8',
        screen: 'TopUp'
    },
    {
        id: 4,
        title: 'Bill Payment',
        icon: icons.bill,
        tint: '#6F42C1',
        screen: 'BillPayment'
    },
    {
        id: 5,
        title: 'Savings',
        icon: '💰',
        tint: '#FFD700',
        screen: 'Savings'
    },
    {
        id: 6,
        title: 'Escrow',
        icon: icons.escrow,
        tint: '#20C997',
        screen: 'EscrowPayment'
    },
    {
        id: 7,
        title: 'Virtual Cards',
        icon: '💳',
        tint: '#FD7E14',
        screen: 'VirtualCards'
    },
    {
        id: 8,
        title: 'Merchant Account',
        icon: icons.merchant,
        tint: '#6F42C1',
        screen: 'MerchantRegistration'
    }
];

export default features; 