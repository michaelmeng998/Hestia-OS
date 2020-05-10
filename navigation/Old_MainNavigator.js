import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
import Icon from "react-native-vector-icons/Ionicons";
import KitchenHomeScreen from "../screens/KitchenHomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ManageMenuScreen from "../screens/ManageMenuScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import LocationPickerScreen from "../screens/LocationPickerScreen";
import TimePickerScreen from "../screens/TimePickerScreen";
import ManageKitchenImagesScreen from "../screens/ManageKitchenImagesScreen";
import AddItemsScreen from "../screens/AddItemsScreen";
import UploadImagesScreen from "../screens/UploadImagesScreen";
import KitchenSettingsScreen from "../screens/KitchenSettingsScreen";
import ChangeCredentialsScreen from "../screens/ChangeCredentialsScreen";
import LocalizationScreen from "../screens/LocalizationScreen";
import EditItemsScreen from "../screens/EditItemsScreen";

const Orders = createStackNavigator({
  Orders: OrdersScreen
  // Home: KitchenHomeScreen,
  // Customers: ManageCustomersScreen,
  // Finances: ManageCustomersScreen,
  // StoreStatistics: StoreStatisticsScreen
});
const Menu = createStackNavigator({
  Menu: ManageMenuScreen,
  AddItems: AddItemsScreen,
  ManageKitchenImages: ManageKitchenImagesScreen,
  UploadImages: UploadImagesScreen,
  EditItems: EditItemsScreen
});
const Schedule = createStackNavigator({
  Schedule: ScheduleScreen,
  LocationPicker: LocationPickerScreen,
  TimePicker: TimePickerScreen
});
const Images = createStackNavigator({
  ManageKitchenImages: ManageKitchenImagesScreen,
  UploadImages: UploadImagesScreen
});

const Settings = createStackNavigator({
  KitchenSettings: KitchenSettingsScreen,
  ChangeCredentials: ChangeCredentialsScreen,
  SelectLanguage: LocalizationScreen
});
export default createBottomTabNavigator(
  {
    Orders: {
      screen: Orders,
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-cash" color={tintColor} size={24} />
        )
      }
    },
    Menu: {
      screen: Menu,
      navigationOptions: {
        tabBarLabel: "Menu",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="md-book" color={tintColor} size={24} />
        )
      }
    },
    Schedule: {
      screen: Schedule,
      navigationOptions: {
        tabBarLabel: "Schedule",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="md-calendar" color={tintColor} size={24} />
        )
      }
    },
    Images: {
      screen: Images,
      navigationOptions: {
        tabBarLabel: "Images",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="ios-images" color={tintColor} size={24} />
        )
      }
    },
    Settings: {
      screen: Settings,
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
