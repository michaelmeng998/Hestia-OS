import React from 'react';
import { Alert, View, StyleSheet, Text, TouchableHighlight, Button } from 'react-native';
import { connect } from 'react-redux';

export default class OpenCloseBar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,

        }
    }

    _toggleShop() {
        this.setState({
            open: !this.state.open
        })
    }



    render() {
        const open = this.state.open;
        let text;
        if (open) {
            text = <Text style={{fontSize: 20}}>Open</Text>;
        } else {
            text = <Text style={{fontSize: 20}}>Closed</Text>;
        }
        return (
            <TouchableHighlight onPress={() => this._toggleShop()} underlayColor="white">
                <View style={[styles.container, {backgroundColor: this.state.open? "#bef754" : "#ff3030"}]}>
                    {text}
                </View>
            </TouchableHighlight>
        
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        height: 40,
        flex: 1,
        // flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

    }
})