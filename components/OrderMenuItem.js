import React from 'react';
import { Alert, View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

export default class OrderMenuItem extends React.Component {

    render() {
        return (
            <View style={{paddingTop: 5}}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", backgroundColor: "#c9c9c9", alignItems: "center"}}>
                    <Text>{this.props.item.name}</Text>
                    <Text>{this.props.item.quantity}</Text>
                </View>
            </View>
        );
    }
}