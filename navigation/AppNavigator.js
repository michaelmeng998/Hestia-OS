import React from 'react';
import { createSwitchNavigator } from 'react-navigation';

import LoadingScreen from '../screens/LoadingScreen';
import MainKitchenNavigator from './CustomMainNavigator';
import MainCustomerNavigator from './CustomMainTabNavigator'
import AuthStack from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import MainTabNavigator from './MainTabNavigator';

export default createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
        LoadingScreen: LoadingScreen,
        Auth: AuthStack,
        Kitchen: MainKitchenNavigator,
        Customer: MainCustomerNavigator,
    }, {
        initialRouteName: 'LoadingScreen'
    }
);