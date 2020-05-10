import React from "react";
import {
  Alert,
  AsyncStorage,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { connect } from "react-redux";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";

// const ONTARIO_TAX = 1.13

class ConfirmBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLoader: false,
    };

    var user = firebase.auth().currentUser;
    this.customerId = user.uid;
    this.merchantId = this.props.navigation.state.params.merchant_uuid;
  }

  componentDidMount() {
    this.customer_orders = firebase
      .firestore()
      .collection("customers")
      .doc(this.customerId)
      .collection("orders");
    this.merchant_orders = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchantId)
      .collection("orders");
    this.orders = firebase.firestore().collection("orders");
    this.customer = firebase
      .firestore()
      .collection("customers")
      .doc(this.customerId)
      .get()
      .then((doc) => {
        data = doc.data();
        this.customer_name = data.name;
        this.customer_email = data.email;
        this.customer_phone_number = data.phone_number;
      });
    this.merchant = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchantId)
      .get()
      .then((doc) => {
        data = doc.data();
        this.merchant_name = data.name;
        this.merchant_email = data.email;
      });

    this.merchant_inventory = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchantId)
      .collection("inventory");
  }

  _sendOrder = () => {
    this._confirm_showLoader();

    // Prepare Order to Send to Backend
    var cartItemsLength = this.props.order.items.length;
    var cartItemsSendCustomerDoc = {
      deliveryFee: parseFloat(this.props.customerOrder.deliveryFee).toFixed(2),
      cartItems: [],
      orderValue: this._calculatePrice(),
      orderSchedule: this.props.customerOrder,
      orderStatus: this.props.customerOrderStatus,
      merchant_uuid: this.merchantId,
      merchant_name: this.merchant_name,
      merchant_email: this.merchant_email,
    };

    // Don't really need this collection
    var cartItemsSendOverallDoc = {
      deliveryFee: parseFloat(this.props.customerOrder.deliveryFee).toFixed(2),
      cartItems: [],
      orderValue: this._calculatePrice(),
      orderSchedule: this.props.customerOrder,
      merchant_uuid: this.merchantId,
      merchant_name: this.merchant_name,
      merchant_email: this.merchant_email,
      customer_uuid: this.customerId,
    };

    var cartItemsSendMerchantDoc = {
      deliveryFee: parseFloat(this.props.customerOrder.deliveryFee).toFixed(2),
      merchant_name: this.merchant_name,
      merchant_email: this.merchant_email,
      customer_name: this.customer_name,
      customer_uuid: this.customerId,
      customer_email: this.customer_email,
      customer_phone_number: this.customer_phone_number,
      cartItems: [],
      orderValue: this._calculatePrice(),
      orderSchedule: this.props.customerOrder,
      orderStatus: this.props.customerOrderStatus,
      fulfilled: false,
    };

    for (i = 0; i < cartItemsLength; i++) {
      if (cartItemsLength > 0) {
        cartItemsSendCustomerDoc.cartItems.push(this.props.order.items[i]);
        cartItemsSendOverallDoc.cartItems.push(this.props.order.items[i]);
        cartItemsSendMerchantDoc.cartItems.push(this.props.order.items[i]);
      }
    }

    // Send Order to Backend
    this.customer_orders.add(cartItemsSendCustomerDoc).then((orderRef) => {
      cartItemsSendMerchantDoc["customerOrderId"] = orderRef.id;
      this.merchant_orders.add(cartItemsSendMerchantDoc).then(() => {
        this.orders.add(cartItemsSendOverallDoc).then(() => {
          // Update inventory
          // Use date as doc id for inventory collections
          // Then use itemID(uuid) as doc id for date collections

          // Use transaction to ensure we are read/write to up-to-date and consistent data
          // Create ref to inventory date doc
          var invDateRefDoc = this.merchant_inventory.doc(
            cartItemsSendMerchantDoc.orderSchedule.date
          );

          firebase
            .firestore()
            .runTransaction(async (transaction) => {
              const invDateDoc = await transaction.get(invDateRefDoc);

              var updatedInventory = {};
              // Update item counters
              if (invDateDoc.exists) {
                let prevInventory = invDateDoc.data();

                cartItemsSendMerchantDoc.cartItems.forEach((item) => {
                  if (!updatedInventory.hasOwnProperty(item.uuid)) {
                    updatedInventory[item.uuid] = 0;
                  }
                  let prevQuantity = prevInventory.hasOwnProperty(item.uuid)
                    ? prevInventory[item.uuid]
                    : 0;
                  updatedInventory[item.uuid] = prevQuantity + item.quantity;
                });
                transaction.set(invDateRefDoc, updatedInventory, {
                  merge: true,
                });
              } else {
                cartItemsSendMerchantDoc.cartItems.forEach((item) => {
                  if (!updatedInventory.hasOwnProperty(item.uuid)) {
                    updatedInventory[item.uuid] = 0;
                  }
                  updatedInventory[item.uuid] += item.quantity;
                });

                transaction.set(invDateRefDoc, updatedInventory);
              }

              return updatedInventory;
            })
            .then(function() {
              console.log("Order Inv Transaction successfully committed!");
              this._confirrm_hideLoader();
            })
            .catch(function(error) {
              console.log("Order Inv Transaction failed: ", error);
            });

          this.props.eraseCart();
          this.props.navigation.popToTop();
          Alert.alert(
            "Thank You!",
            "Order has been sent to merchant, please check Orders tab for updates!"
          );
        });
      });
    });
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
    let deliveryFee = 0;
    if (
      this.props.customerOrder.isDelivery &&
      this.props.customerOrder.deliveryFee > 0
    ) {
      deliveryFee = parseFloat(this.props.customerOrder.deliveryFee);
    }
    var price = 0;
    var cartPrice = 0;
    var cartItemsLength = this.props.order.items.length;
    for (i = 0; i < cartItemsLength; i++) {
      cartPrice +=
        this.props.order.items[i].quantity *
        parseFloat(this.props.order.items[i].price).toPrecision(5);
    }
    price = cartPrice + deliveryFee;
    return price.toFixed(2);
  };

  _confirm_showLoader = () => {
    this.setState({ showLoader: true });
  };
  _confirrm_hideLoader = () => {
    this.setState({ showLoader: false });
  };

  render() {
    return (
      <View style={styles.ConfirmBar}>
        <Text style={{ color: "white", paddingLeft: 5 }}>
          {localization.items}: {this._calculateQuantity()}
        </Text>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
          {localization.total}: {"\u0024"}
          {this._calculatePrice()}
        </Text>
        {this.props.validSchedule &&
          !this.props.isCartEmpty &&
          !this.state.showLoader && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                borderColor: "white",
                borderWidth: 1,
                backgroundColor: "black",
                borderRadius: 30,
                padding: 10,
              }}
              onPress={() => this._sendOrder()}
            >
              <Text style={{ color: "white" }}>{localization.purchase}</Text>
            </TouchableOpacity>
          )}
        {this.state.showLoader && (
          // Bit redundant here - but formatting sakes
          <ActivityIndicator
            style={{ padding: 10 }}
            animating={this.state.showLoader}
            size="large"
            color="white"
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    order: state.order,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    eraseCart: () =>
      dispatch({
        type: "ERASE_CART",
      }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmBar);

const styles = StyleSheet.create({
  ConfirmBar: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 5,
  },
});
