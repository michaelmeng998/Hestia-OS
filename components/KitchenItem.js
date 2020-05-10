import React from 'react';
import { View, StyleSheet, TouchableHighlight, Text, Button, Image } from 'react-native';

import KitchenPreview from '../components/KitchenPreview';
import Ratings from '../components/Ratings';

export default class KitchenItem extends React.Component {

    render() {
        return (
            <TouchableHighlight onPress={() => this.props.navigation.navigate('Restaurant')} underlayColor="white">
                <View style={styles.favoritesListItem}>
                    <KitchenPreview/>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffcc66", paddingnTop: 3, paddingLeft: 5, paddingRight: 5}}>
                        {/* <Button 
                            onPress={() => this.props.navigation.navigate('Restaurant')}
                            title={this.props.kitchenName}
                            color="#fcd12c"
                        /> */}
                        <Text style={{fontSize: 20}}>{this.props.kitchenName}</Text>
                        <Ratings rating={this.props.rating}/>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    imageContainer: {
        flex: 1
    },

    favoritesListItem: {
        marginTop: 10,
		backgroundColor: "#efefef"
    }
})

