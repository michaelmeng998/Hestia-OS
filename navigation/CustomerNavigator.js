import React from "react";
import { Platform } from "react-native";
import { createStackNavigator } from "react-navigation";

import HomeScreen from "../screens/HomeScreen";
import KitchenScreen from "../screens/KitchenScreen";
import CartScreen from "../screens/CartScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";
import LocationPickerScreen from "../screens/LocationPickerScreen";
import CustomizeOrderScreen from "../screens/CustomerCustomizeOrderScreen";
import CustomerCartScreen from "../screens/CustomerCartScreen";

export default createStackNavigator({
  Home: HomeScreen,
  Kitchen: KitchenScreen,
  // Cart: CartScreen,
  Cart: CustomerCartScreen,
  Delivery: DeliveryScreen,
  OrderConfirmation: OrderConfirmationScreen,
  LocationPicker: LocationPickerScreen,
  CustomizeOrder: CustomizeOrderScreen
  // Schedule: ManageScheduleScreen,
  // Customers: ManageCustomersScreen,
  // Finances: ManageCustomersScreen,
  // StoreStatistics: StoreStatisticsScreen
});
