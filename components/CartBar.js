import React from "react";
import {
  Alert,
  AsyncStorage,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";

class CartBar extends React.Component {
  constructor(props) {
    super(props);
    this.merchantId = this.props.navigation.state.params.uuid;
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      // re-render component
      this.setState({});
    }
  }

  componentDidMount() {
    this.merchant = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchantId)
      .get()
      .then((doc) => {
        data = doc.data();
        this.merchant_name = data.name;
        this.minOrderValue = data.minOrderValue;
        this.deliveryFee = data.deliveryFee;
        this.merchant_email = data.email;
      });
  }
  _checkoutButton = (minOrderValue, price) => {
    if (this.props.order.items.length === 0) {
      return <Text style={{ color: "white", paddingRight: 5 }}>{localization.empty}</Text>;
    } else {
      if (minOrderValue > 0 && price < parseFloat(minOrderValue)) {
        return (
          <Text style={{ color: "white", paddingRight: 5 }}>
            Min: ${parseFloat(minOrderValue).toFixed(2)}
          </Text>
        );
      } else {
        return (
          <TouchableOpacity
            style={{
              borderColor: "white",
              borderWidth: 1,
              backgroundColor: "black",
              borderRadius: 30,
              padding: 10,
              flexDirection: "row",
            }}
            onPress={() =>
              this.props.navigation.navigate("Cart", {
                merchant_uuid: this.props.navigation.state.params.uuid,
                deliveryFee: this.deliveryFee,
                foodItems: this.props.foodItems,
                drinkItems: this.props.drinkItems,
              })
            }
          >
            <Text style={{ color: "white" }}>{localization.check} {localization.cart}</Text>
          </TouchableOpacity>
        );
      }
    }
  };
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
      <View style={styles.CartBar}>
        <Text style={{ color: "white", paddingLeft: 5 }}>
          {localization.items}: {this._calculateQuantity()}
        </Text>
        <Text style={{ color: "white" }}>
          {localization.cart}: {"\u0024"}
          {this._calculatePrice()}
        </Text>
        {this._checkoutButton(this.minOrderValue, this._calculatePrice())}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    order: state.order,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(CartBar);

const styles = StyleSheet.create({
  CartBar: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 5,
  },
});
