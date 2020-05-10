import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  List,
  ListItem,
  Accordion
} from "native-base";

import moment from "moment";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";
import colors from '../constants/Colors';

import CardItem from "../components/CollapsibleCard";

export default class OrderDaysList extends React.Component {

  cardStyles = {
    'container': styles.cardContainerDay
  }
  cardOrderStyles = {
    'container': styles.cardContainerOrder
  }

  constructor(props) {
    super(props);
    var user = firebase.auth().currentUser;
    this.merchantId = user.uid;

    this.state = {
      // Sorted by date, then time?
      orderDays: {}
    }
    
    this.expandedFlags = {};

    this.toggleCard = this.toggleCard.bind(this);
    this.expandedProp = 'expanded';

    this.merchant_inventory = firebase
    .firestore()
    .collection("merchants")
    .doc(this.merchantId)
    .collection("inventory");
  }

  // Comparator function which checks order status code against
  //  provided list of order status (os) codes
  _isOrderStatusOneOf = (osCode, osList) => {
    for (var i = 0; i < osList.length; i++) {
      if (osCode == osList[i]) {
        return true;
      }
    }
    return false;
  };

  componentDidMount() {
    this._sortOrders();
  }

  _compareOrders( a, b ) {
    let aType = a.orderSchedule.isDelivery ? 'D' : 'P';
    let bType = b.orderSchedule.isDelivery ? 'D' : 'P';
    if ( aType < bType ){
      return -1;
    }
    if ( aType > bType ){
      return 1;
    }
    return 0;
  }

  _sortOrders = () => {
    // Sort orders by day
    // Chained sort into all of this.
    let sortODays = Object.keys(this.props.orderDays).sort().reduce((accumulator, currentValue) => {
      accumulator[currentValue] = this.props.orderDays[currentValue];

      // Sort orders by type
      accumulator[currentValue].orders.sort(this._compareOrders);
      
      // Only need to add flags for new orders
      if (!this.expandedFlags[currentValue]) {
        this.expandedFlags[currentValue] = { 'flag': false, 'orders': {} };
      }
      for (var i in this.props.orderDays[currentValue].orders) {
        if (!this.expandedFlags[currentValue].orders[this.props.orderDays[currentValue].orders[i].id]) {
          this.expandedFlags[currentValue].orders[this.props.orderDays[currentValue].orders[i].id] = false;
        }
      } 

      return accumulator;
      }, {});

    this.setState({
      orderDays: sortODays
    })
  }

  // override default lifecycle method, need account for weekChange
  componentDidUpdate(prevProps) {
    if ((this.props.orderCount != prevProps.orderCount) || (this.props.startDayOfWeek != prevProps.startDayOfWeek)) {
      this._sortOrders();
    }
  }

  toggleCard = (date, toggleVal, id) => {
    if (id) {
      for (var orderId in this.expandedFlags[date].orders) {
        let flag = false;
        if (orderId == id) {
          flag = toggleVal;
        }
        this.expandedFlags[date].orders[orderId] = flag;
      }
    } else {
      for (var day in this.expandedFlags) {
        let flag = false;
        if (day == date) {
          flag = toggleVal;
        }
        this.expandedFlags[day].flag = flag;
      }
    }
    newState = this.state;
    this.setState(newState);
  }

  _confirmOrderAction(orderId, customerInfo, orderStatusCode, alertText) {
    Alert.alert(
      localization.confirmUpdate,
      alertText,
      [
        {
          text: localization.cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: localization.ok,
          onPress: () => {
            var customerOrderDocRef = firebase
              .firestore()
              .collection("customers")
              .doc(customerInfo.customerId)
              .collection("orders")
              .doc(customerInfo.orderId);
  
              // Use date as doc id for inventory collections
              // Then use itemID(uuid) as doc id for date collections
              
              firebase.firestore().runTransaction(async transaction => {
                if (orderStatusCode == 'R') {
                  // Use transaction to ensure we are read/writet to up-to-date and consistent data
                  // Create ref to inventory date doc
                  var invDateRefDoc = this.merchant_inventory.doc(customerInfo.orderDate);

                  // If order was rejected, Update Inventory
                  const invDateDoc = await transaction.get(invDateRefDoc);                  
                  var updatedInventory = {};
                  if (invDateDoc.exists) {
                    let prevInventory = invDateDoc.data();
                    // Find item(s) and decrement order count

                    customerInfo.cartItems.forEach(item => {
                      if (!updatedInventory.hasOwnProperty(item.uuid)) {
                        updatedInventory[item.uuid] = 0;
                      }
                      let prevQuantity = prevInventory.hasOwnProperty(item.uuid) ? prevInventory[item.uuid] : 0;
                      updatedInventory[item.uuid] = Math.max(0, prevQuantity - item.quantity);
                    });
  
                    transaction.set(invDateRefDoc, updatedInventory, { merge: true });
                  } else {
                    return;
                  }
                } 
                transaction.update(this.props.merchOrderRefColl.doc(orderId), { orderStatus: orderStatusCode });
                transaction.update(customerOrderDocRef, { orderStatus: orderStatusCode });
                return;
                
              }).then(function() {
                console.log(`Order succesfully updated: ${orderId}`);
              }).catch(function(error) {
                console.log(`Order (${orderId}) rejected - Transaction failed: `, error);
              });

          }
        }
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <View style={{ paddingTop: 20 }}>
        {Object.keys(this.state.orderDays).map((value, key) => 
            <CardItem
            cardStyles={this.cardStyles}
            orderDate={value}
            cardTitle={moment(value).format("dddd, MMMM Do")}

            expanded={this.expandedFlags[value].flag}
            toggleCard={this.toggleCard}
            key={key}
            >
              <View style={styles.orderCardsContainer}>
                  {this.state.orderDays[value].orders.map((order, key) =>
                    <CardItem
                    orderColor={order.orderSchedule.isDelivery ? this.props.orderColor.delivery : this.props.orderColor.pickup}
                    cardStyles={this.cardOrderStyles}
                    orderDate={value}
                    cardTitle={`${order.customer_name}`}
                    cardSubtitlePhone={`Phone: ${order.customer_phone_number}`}
                    cardSubtitleTotal={`Total: $${order.orderValue}`}

                    expanded={this.expandedFlags[value].orders[order.id]}
                    toggleCard={this.toggleCard}
                    
                    orderId={order.id}
                    key={key}
                    >
                        <View style={[styles.receiptBox]}>
                            {
                              /* Scheduling information */
                              <View>
                                <Text
                                  style={[
                                    styles.orderHeaderText,
                                    { paddingTop: 10 }
                                  ]}
                                >
                                  {order.orderSchedule.isDelivery
                                    ? "Delivery"
                                    : "Pickup"}
                                </Text>
                                {/* TODO: clean all old customer orders from firebase */}
                                {order.orderSchedule.location && (
                                  <Text style={styles.orderHeaderText}>
                                    {order.orderSchedule.location.name}
                                  </Text>
                                )}
                                <Text style={styles.orderHeaderText}>
                                  {moment(order.orderSchedule.date).format(
                                    "dddd, MMMM Do"
                                  )}
                                </Text>
                                <Text style={styles.orderHeaderText}>
                                  {order.orderSchedule.timeLabel}
                                </Text>
                                <Text style={styles.orderHeaderText}>
                                  Note to Chef:
                                </Text>
                                <Text style={styles.secondaryText}>
                                  {order.orderSchedule.noteToChef}
                                </Text>
                              </View>
                            }
                            <View
                              style={[
                                styles.lineDividerStyle,
                                { paddingTop: 20 }
                              ]}
                            />
                            <Text>Receipt</Text>
                            {order.cartItems.map((orderItem, orderKey) => (
                              <ListItem
                                style={{
                                  justifyContent: "flex-start",
                                  flexDirection: "column"
                                }}
                                key={orderKey}
                              >
                                <View style={{ flexDirection: "row" }}>
                                  <Text style={{ flex: 1 }}>
                                    {orderItem.quantity} X
                                  </Text>
                                  <Text style={{ flex: 3 }}>
                                    {orderItem.name}
                                  </Text>
                                  <Text>
                                    {"\u0024"}
                                    {parseFloat(orderItem.price).toFixed(2)}
                                  </Text>
                                </View>
                                {orderItem.customizationOn &&
                                  orderItem.customization.map(
                                    (options, index) => (
                                      <View
                                        noBorder
                                        style={{
                                          marginTop: 5,
                                          marginLeft: 10,
                                          flexDirection: "row"
                                        }}
                                        key={index}
                                      >
                                        <Text
                                          style={{
                                            flex: 1,
                                            color: "gray"
                                          }}
                                        >
                                          {options.headerName}:
                                        </Text>
                                        <Text
                                          style={{ flex: 1, color: "gray" }}
                                        >
                                          {options.optionName}
                                        </Text>
                                        <Text
                                          style={{
                                            paddingLeft: 4,
                                            marginRight: 8,
                                            color: "gray"
                                          }}
                                        >
                                          {"\u0024"}
                                          {parseFloat(
                                            options.optionPrice
                                          ).toFixed(2)}
                                        </Text>
                                      </View>
                                    )
                                  )}
                              </ListItem>
                            ))}
                            <ListItem
                              noBorder
                              style={{ justifyContent: "space-between" }}
                            >
                              <Text style={styles.secondaryText}>Total</Text>
                              <Text style={{ fontWeight: "bold" }}>
                                ${order.orderValue}
                              </Text>
                            </ListItem>

                            {/* Add order option buttons 
                                                                
                                                                TODO: Further review needed for order transaction process
                                                                 Provide a way for merchant to cancel orders / delay delivery notice
                                                                 due to unexpected events

                                                            */}
                            <View style={styles.orderOptionsList}>
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "P"
                              ]) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    this._confirmOrderAction(
                                      order.id,
                                      {
                                        orderDate: value,
                                        customerId: order.customer_uuid,
                                        orderId: order.customerOrderId,
                                        cartItems: order.cartItems
                                      },
                                      "C",
                                      localization.confirmOrder
                                    )
                                  }
                                >
                                  <View
                                    style={[
                                      styles.orderStatusIButton,
                                      { backgroundColor: "green" }
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        { textAlign: "center", color: "white" },
                                        styles.timeIntervalList
                                      ]}
                                    >
                                      {localization.confirm}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "P"
                              ]) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    this._confirmOrderAction(
                                      order.id,
                                      {
                                        orderDate: value,
                                        customerId: order.customer_uuid,
                                        orderId: order.customerOrderId,
                                        cartItems: order.cartItems
                                      },
                                      "R",
                                      localization.rejectOrder
                                    )
                                  }
                                >
                                  <View
                                    style={[
                                      styles.orderStatusIButton,
                                      { backgroundColor: "red" }
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        { textAlign: "center", color: "white" },
                                        styles.timeIntervalList
                                      ]}
                                    >
                                      {localization.reject}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "C"
                              ]) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    this._confirmOrderAction(
                                      order.id,
                                      {
                                        orderDate: value,
                                        customerId: order.customer_uuid,
                                        orderId: order.customerOrderId,
                                        cartItems: order.cartItems
                                      },
                                      "I",
                                      localization.setOrderDeliveryInProgress
                                    )
                                  }
                                >
                                  <View
                                    style={[
                                      styles.orderStatusIButton,
                                      { backgroundColor: "blue" }
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        { textAlign: "center", color: "white" },
                                        styles.timeIntervalList
                                      ]}
                                    >
                                      {localization.inProgress}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "I"
                              ]) && (
                                <TouchableOpacity
                                  onPress={() =>
                                    this._confirmOrderAction(
                                      order.id,
                                      {
                                        orderDate: value,
                                        customerId: order.customer_uuid,
                                        orderId: order.customerOrderId,
                                        cartItems: order.cartItems
                                      },
                                      "D",
                                      localization.setOrderDelivered
                                    )
                                  }
                                >
                                  <View
                                    style={[
                                      styles.orderStatusIButton,
                                      { backgroundColor: "#808080" }
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        { textAlign: "center", color: "white" },
                                        styles.timeIntervalList
                                      ]}
                                    >
                                      {localization.delivered}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "D"
                              ]) && (
                                <View
                                  style={[
                                    styles.orderStatusIButton,
                                    { backgroundColor: "green" }
                                  ]}
                                >
                                  <Text
                                    style={[
                                      { textAlign: "center", color: "white" },
                                      styles.timeIntervalList
                                    ]}
                                  >
                                    {localization.delivered}
                                  </Text>
                                </View>
                              )}
                              {this._isOrderStatusOneOf(order.orderStatus, [
                                "R"
                              ]) && (
                                <View
                                  style={[
                                    styles.orderStatusIButton,
                                    { backgroundColor: "red" }
                                  ]}
                                >
                                  <Text
                                    style={[
                                      { textAlign: "center", color: "white" },
                                      styles.timeIntervalList
                                    ]}
                                  >
                                    {localization.rejected}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                    </CardItem>
                  )}
              </View>
            </CardItem>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20
  },
  orderCardsContainer: {
    marginTop: 15,
  },
  accordionHeader: {
    flex: 1
  },
  firstRowHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcc66"
  },
  secondRowHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcc66"
  },
  menuItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: "#aaa"
  },
  dateHeader: {
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "black",
    justifyContent: "space-between"
  },
  disabledColor: {
    color: "#BEBEBE"
  },
  defaultTextColor: {
    color: "white"
  },
  orderList: {
    paddingTop: 5
  },
  orderOptionsList: {
    fontSize: 12,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  orderStatusIButton: {
    flexDirection: "column",
    marginRight: 5,
    marginBottom: 5,
    padding: 8,
    borderRadius: 10
  },
  // Styles for individual orders
  lineDividerStyle: {
    paddingTop: 10,

    alignSelf: "stretch",
    width: "100%",

    borderBottomColor: "gray",
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  orderHeaderText: {
    paddingBottom: 10,
    fontSize: 15
  },
  secondaryText: {
    color: "#808080" // Gray
  },
  orderStatusStyle: {
    fontWeight: "bold"
  },
  scene: {
    flex: 1
  },
  orderFlexHeader: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap"
    // alignItems: 'flex-start' // if you want to fill rows left to right
  },
  receiptBox: {
      borderRadius: 7,
      backgroundColor: colors.secColor,
      
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,
      
      elevation: 7,

      marginTop: 10,
      marginBottom: 10,
      marginLeft: 5,
      padding: 10,
  },
  // Styles passed to CollapsibleCard
  cardContainerDay: {
    flex: 1,
    justifyContent: 'center',
    
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  cardContainerOrder: {
    flex: 1,
    justifyContent: 'center',
    
    paddingHorizontal: 20,
    marginBottom: 5,
  //   paddingTop: (Platform.OS === 'ios') ? 20 : 0
  }
});
