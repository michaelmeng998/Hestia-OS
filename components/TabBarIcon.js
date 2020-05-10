import React from 'react';
import { View, StyleSheet, TouchableHighlight, Text, Button, Image } from 'react-native';

import Colors from '../constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default class TabBarIcon extends React.Component {
  render() {
    return (
      <Icon
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={this.props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
    );
  }
}