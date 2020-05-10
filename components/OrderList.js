import React from "react";
import { View, StyleSheet } from "react-native";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  List,
  ListItem,
  Accordion,
} from "native-base";

import moment from "moment";
import localization from "../constants/Localization";

export default class OrderList extends React.Component {
  constructor(props) {
    super(props);
  }

  _orderType = (isDelivery) => {
    return isDelivery ? localization.delivery : localization.pickup;
  };

  render() {
    return (
      <View style={styles.scene}>
        <Text>{this.props.counter}</Text>
        <List>
          {this.props.orderList.map((value, key) => {
            return (
              <View style={{ paddingBottom: 5 }}>
                <ListItem
                  itemHeader
                  style={{
                    marginLeft: null,
                    paddingTop: 10,
                    paddingBottom: 10,
                    backgroundColor: "White",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                  key={key}
                >
                  <Text
                    style={{ color: "black", fontSize: 18, fontWeight: "bold" }}
                  >
                    {value.merchant_name}
                  </Text>
                  <Text
                    style={[
                      styles.orderStatusStyle,
                      { color: value.orderStatus.color },
                    ]}
                  >
                    {value.orderStatus.text}
                  </Text>
                </ListItem>
                {
                  /* Scheduling information */
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "space-between",
                      paddingTop: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.orderHeaderText]}>
                        {this._orderType(value.orderSchedule.isDelivery)}
                      </Text>
                      {/* TODO: clean all old customer orders from firebase */}
                      {value.orderSchedule && value.orderSchedule.location && (
                        <Text style={styles.orderHeaderText}>
                          {moment(value.orderSchedule.date).format(
                            "dddd, MMMM Do"
                          )}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.orderHeaderText}>
                        {value.orderSchedule.location.name}
                      </Text>
                      <Text style={styles.orderHeaderText}>
                        {value.orderSchedule.timeLabel}
                      </Text>
                    </View>
                    <Text style={[styles.orderHeaderText]}>
                      Email: {value.merchant_email}
                    </Text>
                    <Text style={{ fontSize: 15, paddingBottom: 5 }}>
                      Note to Chef:
                    </Text>
                    <Text style={{ padding: 5, color: "gray" }}>
                      {value.orderSchedule.noteToChef}
                    </Text>
                  </View>
                }
                <Text style={{ paddingTop: 5 }}>Receipt</Text>
                {value.cartItems.map((orderItem, orderKey) => (
                  <ListItem
                    noBorder
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                    key={orderKey}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ flex: 2 }}>{orderItem.name}</Text>
                      <Text style={{ flex: 1 }}>x {orderItem.quantity}</Text>
                      <Text>
                        {"\u0024"}
                        {parseFloat(orderItem.price).toFixed(2)}
                      </Text>
                    </View>
                  </ListItem>
                ))}
                {value.orderSchedule.isDelivery && (
                  <ListItem
                    noBorder
                    style={{ justifyContent: "space-between" }}
                  >
                    <Text style={styles.secondaryText}>Delivery</Text>
                    <Text style={{ fontWeight: "bold" }}>
                      {"\u0024"}
                      {value.deliveryFee}
                    </Text>
                    {console.log(value.deliveryFee)}
                  </ListItem>
                )}
                <ListItem noBorder style={{ justifyContent: "space-between" }}>
                  <Text style={styles.secondaryText}>Total</Text>
                  <Text style={{ fontWeight: "bold" }}>
                    {"\u0024"}
                    {value.orderValue}
                  </Text>
                </ListItem>
                <View style={[styles.lineDividerStyle, { paddingTop: 20 }]} />
              </View>
            );
          })}
        </List>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  accordionHeader: {
    flex: 1,
  },
  firstRowHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcc66",
  },
  secondRowHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcc66",
  },
  menuItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: "#aaa",
  },
  lineDividerStyle: {
    paddingTop: 10,

    alignSelf: "stretch",
    width: "100%",

    borderBottomColor: "gray",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orderHeaderText: {
    paddingBottom: 10,
    fontSize: 15,
  },
  secondaryText: {
    color: "black",
    fontWeight: "bold",
  },
  orderStatusStyle: {
    fontWeight: "bold",
  },
  scene: {
    flex: 1,
  },
});
