import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  createBottomTabNavigator
} from "react-navigation";
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
import CustomMerchantTabBar from "../components/CustomTabBar";

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
export default createBottomTabNavigator({
  Orders: {
    screen: Orders,
  },
  Menu: {
    screen: Menu,
  },
  Schedule: {
    screen: Schedule,
  },
  Images: {
    screen: Images,
  },
  Settings: {
    screen: Settings,
  }
}, {
    tabBarComponent: CustomMerchantTabBar
});
