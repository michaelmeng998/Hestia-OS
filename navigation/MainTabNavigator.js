import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import Icon from "react-native-vector-icons/Ionicons";
import TabBarIcon from "../components/TabBarIcon";
import SettingsScreen from "../screens/SettingsScreen";
import ChangeCredentialsScreen from "../screens/ChangeCredentialsScreen";
import CustomerOrdersScreen from "../screens/CustomerOrdersScreen";
import CustomerNavigator from "./CustomerNavigator";

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
  ChangeCredentials: ChangeCredentialsScreen,
});

SettingsStack.navigationOptions = {
  tabBarLabel: "Settings",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === "ios" ? "ios-settings" : "md-settings"}
    />
  )
};

export default createBottomTabNavigator(
  {
    // CustomerNavigator,
    // SettingsStack
    Home: {
      screen: CustomerNavigator,
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-home" color={tintColor} size={24} />
        )
      }
    },
    Orders: {
      screen: CustomerOrdersScreen,
      navigationOptions: {
        tabBarLabel: "Orders",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="md-list-box" color={tintColor} size={24} />
        )
      }
    },
    Settings: {
      screen: SettingsStack,
      navigationOptions: {
        tabBarLabel: "Settings",
        tabBarIcon: ({ tintColor }) => (
          <Icon
            name={Platform.OS === "ios" ? "ios-settings" : "md-settings"}
            color={tintColor}
            size={24}
          />
        )
      }
    }
  },
  {
    tabBarOptions: {
      activeTintColor: "black",
      inactiveTintColor: "grey",
      style: {
        backgroundColor: "white",
        borderTopWidth: 0,
        shadowOffset: { width: 5, height: 3 },
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 5
      }
    }
  }
);
