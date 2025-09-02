import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import {
    Image
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, icons } from "../constants";
import { HomeScreen as Home, MoneyHistory, ProfileScreen, ScanScreen as Scan } from "../screens";

const Tab = createBottomTabNavigator()

const Tabs = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: COLORS.white,
                        elevation: 0,
                        height: 80,
                        paddingBottom: 20,
                        paddingTop: 10,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.lightGray
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.gray,
                    headerShown: false
                }}
            >
                <Tab.Screen
                    name="Home"
                    children={props => <Home {...props} />}
                    options={{
                        tabBarIcon: ({ focused, color }) => (
                            <Image
                                source={icons.wallet}
                                resizeMode="contain"
                                style={{
                                    width: 25,
                                    height: 25,
                                    tintColor: color
                                }}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ focused, color }) => (
                            <Image
                                source={icons.user}
                                resizeMode="contain"
                                style={{
                                    width: 25,
                                    height: 25,
                                    tintColor: color
                                }}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="Scan"
                    component={Scan}
                    options={{
                        tabBarIcon: ({ focused, color }) => (
                            <Image
                                source={icons.scan}
                                resizeMode="contain"
                                style={{
                                    width: 25,
                                    height: 25,
                                    tintColor: color
                                }}
                            />
                        ),
                    }}
                />
                <Tab.Screen
                    name="History"
                    component={MoneyHistory}
                    options={{
                        tabBarIcon: ({ focused, color }) => (
                            <Image
                                source={icons.reload}
                                resizeMode="contain"
                                style={{
                                    width: 25,
                                    height: 25,
                                    tintColor: color
                                }}
                            />
                        ),
                    }}
                />
            </Tab.Navigator>
        </SafeAreaView>
    )
}

export default Tabs; 