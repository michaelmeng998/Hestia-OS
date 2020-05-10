import React from 'react';
import { View, StyleSheet, TouchableHighlight, Text, Button, Image } from 'react-native';


export default class Subcategory extends React.Component {

    render() {
        return (
            <TouchableHighlight onPress={() => this.props.navigation.navigate(this.props.navigateScreen)} underlayColor="white">
                <View style={{backgroundColor: "#ffcc66", height: '30%', width: '40%', justifyContent: "center", alignItems: "center"}}>
                    <Text style={{textAlign: "center"}}>{this.props.name}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}