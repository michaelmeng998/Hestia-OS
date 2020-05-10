import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import TabBarIcon from "../components/TabBarIcon";
import SettingsScreen from "../screens/SettingsScreen";
import ChangeCredentialsScreen from "../screens/ChangeCredentialsScreen";
import CustomerOrdersScreen from "../screens/CustomerOrdersScreen";
import CustomerNavigator from "./CustomerNavigator";
import LocalizationClientScreen from "../screens/LocalizationClientScreen";
import CustomTabBar from "../components/CustomTabBar";

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
  ChangeCredentials: ChangeCredentialsScreen,
  SelectLanguage: LocalizationClientScreen
});

const OrdersStack = createStackNavigator({
  Orders: CustomerOrdersScreen
});

export default createBottomTabNavigator({
    Customer_Home: {
        screen: CustomerNavigator
    },
    Customer_Orders: {
        screen: OrdersStack
    },
    Customer_Settings: {
        screen: SettingsStack
    }
  },
  {
    tabBarComponent: CustomTabBar
  }
);
