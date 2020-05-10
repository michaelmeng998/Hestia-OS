import React from 'react';
import { Alert, View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

export default class Ratings extends React.Component {

    render() {
        return (
            <View>
                <Text>{this.props.rating}</Text>
            </View>
        );
    }
}