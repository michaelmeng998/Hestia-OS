import React, { Component } from 'react'
import { View, Switch, StyleSheet } from 'react-native'

// https://www.tutorialspoint.com/react_native/react_native_switch.htm
export default SwitchButton = (props) => {
   return (
      <View style = {styles.container}>
         <Switch
         onValueChange = {props.toggleOpen}
         value = {props.open}
         trackColor = {{ false: props.falseColor, true: props.trueColor }} 
         ios_backgroundColor = {props.falseColor} />
      </View>
   )
}

const styles = StyleSheet.create ({
   container: {
      flex: 1,
      alignItems: 'center',
      marginTop: 10
   }
})