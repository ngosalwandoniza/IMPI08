import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { AutoLogoutService } from './services/AutoLogoutService';

import Tabs from './navigation/tabs';
import { MoneyHistory, SignupScreen } from './screens';
import OtpConfirmationScreen from './screens/OtpConfirmationScreen';

import AddBillScreen from './screens/AddBillScreen';
import BillHistoryScreen from './screens/BillHistoryScreen';
import BillPaymentScreen from './screens/BillPaymentScreen';
import CourierDashboardScreen from './screens/CourierDashboardScreen';
import DepositScreen from './screens/DepositScreen';
import EscrowPaymentScreen from './screens/EscrowPaymentScreen';
import EscrowTrackingScreen from './screens/EscrowTrackingScreen';
import LandingScreen from './screens/LandingScreen';
import LinkAccountScreen from './screens/LinkAccountScreen';
import LoginScreen from './screens/LoginScreen';
import MerchantDashboardScreen from './screens/MerchantDashboardScreen';
import MerchantRegistrationScreen from './screens/MerchantRegistrationScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SavingsScreen from './screens/SavingsScreen';
import SettingsScreen from './screens/SettingsScreen';
import TopUpScreen from './screens/TopUpScreen';
import TransferScreen from './screens/TransferScreen';
import VirtualCardsScreen from './screens/VirtualCardsScreen';
import WithdrawalScreen from './screens/WithdrawalScreen';

export default function App() {
  const navigationRef = useRef<any>(null);

  const [loaded] = useFonts({
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Black': require('./assets/fonts/Roboto-Black.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf')
  });

  useEffect(() => {
    // Initialize auto-logout service
    const initializeAutoLogout = async () => {
      await AutoLogoutService.initialize(() => {
        // Logout callback
        Alert.alert(
          'Session Expired',
          'You have been logged out due to inactivity.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (navigationRef.current) {
                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: 'Landing' }],
                  });
                }
              }
            }
          ]
        );
      });
    };

    initializeAutoLogout();

    // Cleanup on unmount
    return () => {
      AutoLogoutService.cleanup();
    };
  }, []);

  if (!loaded){
    return null;
  }

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      border: 'transparent'
    }
  }

  const Stack = createStackNavigator()

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false}} initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="OtpConfirmation" component={OtpConfirmationScreen} />
        <Stack.Screen name="Wallet" component={MoneyHistory} />
        <Stack.Screen name="MoneyHistory" component={MoneyHistory} />
        <Stack.Screen name="MainTabs" component={Tabs} />       
        <Stack.Screen name="LinkAccount" component={LinkAccountScreen} />
        <Stack.Screen name="DepositScreen" component={DepositScreen} />
        <Stack.Screen name="TransferScreen" component={TransferScreen} />
        <Stack.Screen name="TopUpScreen" component={TopUpScreen} />
        <Stack.Screen name="WithdrawalScreen" component={WithdrawalScreen} />
        <Stack.Screen name="SavingsScreen" component={SavingsScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="MerchantRegistration" component={MerchantRegistrationScreen} />
        <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} />
        <Stack.Screen name="EscrowPaymentScreen" component={EscrowPaymentScreen} />
        <Stack.Screen name="EscrowTrackingScreen" component={EscrowTrackingScreen as any} />
        <Stack.Screen name="CourierDashboardScreen" component={CourierDashboardScreen} />
        <Stack.Screen name="VirtualCardsScreen" component={VirtualCardsScreen} />
        <Stack.Screen name="BillPaymentScreen" component={BillPaymentScreen} />
        <Stack.Screen name="BillHistoryScreen" component={BillHistoryScreen} />
        <Stack.Screen name="AddBillScreen" component={AddBillScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});