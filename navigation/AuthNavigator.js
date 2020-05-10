import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';

import NewLoginScreen from '../screens/NewLoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';


export default createStackNavigator({
  LoginScreen: NewLoginScreen,
  CreateAccountScreen: CreateAccountScreen
})

