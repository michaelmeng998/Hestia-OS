import React from "react";
import {
  Alert,
  AsyncStorage,
  View,
  StyleSheet,
  Text,
  Button,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

// const ONTARIO_TAX = 1.13

class CheckoutBar extends React.Component {
  constructor(props) {
    super(props);
  }

  _calculateQuantity = () => {
    var quantity = 0;
    var cartItemsLength = this.props.order.items.length;
    for (i = 0; i < cartItemsLength; i++) {
      quantity += this.props.order.items[i].quantity;
    }
    return quantity;
  };

  _calculatePrice = () => {
    var price = 0;
    var cartItemsLength = this.props.order.items.length;
    for (i = 0; i < cartItemsLength; i++) {
      price +=
        this.props.order.items[i].quantity *
        parseFloat(this.props.order.items[i].price).toPrecision(5);
    }
    return price.toFixed(2);
  };

  render() {
    return (
      <View style={styles.CheckoutBar}>
        <Text style={{ color: "white", paddingLeft: 5 }}>
          Items: {this._calculateQuantity()}
        </Text>
        <Text style={{ color: "white" }}>
          Subtotal: {"\u0024"}
          {this._calculatePrice()}
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            borderColor: "white",
            borderWidth: 1,
            backgroundColor: "black",
            borderRadius: 30,
            padding: 10
          }}
          onPress={() =>
            this.props.navigation.navigate("Delivery", {
              merchant_uuid: this.props.navigation.state.params.merchant_uuid
            })
          }
        >
          <Text style={{ color: "white" }}>Locations</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    order: state.order
  };
};

export default connect(mapStateToProps)(CheckoutBar);

const styles = StyleSheet.create({
  CheckoutBar: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "black",
    paddingHorizontal: 5
  }
});
