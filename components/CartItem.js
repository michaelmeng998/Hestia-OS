import React from 'react';
import { Alert, View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

class CartItem extends React.Component {

    render() {
        return (
            <View style={{paddingTop: 5}}>
                <View style={{height: 30, flexDirection: "row", justifyContent: 'space-between', alignItems: "center", backgroundColor: "#ffcc66"}}>
                    <Text>{this.props.item.price * this.props.item.quantity}</Text>
                    <Text>{this.props.item.quantity} x {this.props.item.name}</Text>
                    <Button
                        onPress={() => this.props.addItemToCart(this.props.item)}
                        title="-"
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

export default connect(null, mapDispatchToProps)(CartItem);