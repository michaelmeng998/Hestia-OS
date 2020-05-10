import React from 'react';
import { Alert, View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

class MenuItem extends React.Component {

    render() {
        return (
            <View style={{paddingTop: 5}}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", backgroundColor: "#ffcc66", alignItems: "center"}}>
                    <Text>{this.props.item.price}</Text>
                    <Text>{this.props.item.name}</Text>
                    <Button
                        onPress={() => this.props.addItemToCart(this.props.item)}
                        title="+"
                        color="#000"
                    >/</Button>
                </View>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addItemToCart:(product) => dispatch({
            type: 'ADD_TO_CART',
            payload: product
        })
    }
}

export default connect(null, mapDispatchToProps)(MenuItem);