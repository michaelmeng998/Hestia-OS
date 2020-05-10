import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  CheckBox,
  Container,
  Content,
  Footer,
  FooterTab,
  List,
  ListItem,
  Text,
} from "native-base";
import ConfirmBar from "../components/ConfirmBar";

import moment from "moment";
import _ from "lodash";
import colors from "../constants/Colors";
import localization from "../constants/Localization";

import { connect } from "react-redux";

class CustomerCartScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: `${localization.settings}`,
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? `${localization.checkout} ${localization.cart}`
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.orderType = this.props.order.delivery.isDelivery
      ? localization.delivery
      : localization.pickup;
    // OK since stacknavigator, component unmounted when you go back to edit order schedule
    if (this.props.order.delivery.isDelivery) {
      this.location = this.props.order.delivery.location;
      this.time = this.props.order.delivery.time;
      this.timeLabel = this.props.order.delivery.timeLabel;
      this.deliveryFee = this.props.navigation.state.params.deliveryFee;
    } else {
      this.location = this.props.order.delivery.pickupLocation;
      this.time = this.props.order.delivery.pickupTime;
      this.timeLabel = this.props.order.delivery.pickupTimeLabel;
    }

    this.validSchedule =
      !_.isEmpty(this.location) && this.timeLabel ? true : false;

    this.note = this.props.order.delivery.noteToChef;

    this.customerOrder = {
      deliveryFee: this.deliveryFee,
      date: this.props.order.delivery.date,
      isDelivery: this.props.order.delivery.isDelivery,
      location: this.location,
      time: this.time,
      timeLabel: this.timeLabel,
      noteToChef: this.note,
    };

    this.customerOrderStatus = "P"; // Pending status
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: `${localization.checkout} ${localization.cart}` });
    }
  }

  _getOrderSchedule = () => {
    if (this.validSchedule) {
      // order is valid
      return (
        <View>
          <Text style={styles.subTitle}>{this.orderType}</Text>
          <Text style={{ padding: 5 }}>{this.location.name}</Text>
          <View
            style={{
              justifyContent: "space-evenly",
              flexWrap: "wrap",
              flexDirection: "row",
              padding: 5,
            }}
          >
            <Text style={{ flex: 1 }}>
              {moment(this.time).format("MMMM Do")}
            </Text>
            <Text style={{ flex: 1 }}>{this.timeLabel}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View>
          <Text style={{ color: colors.errorText }}>
            {localization.missingDetails1}
          </Text>
          <Text style={{ color: colors.errorText }}>
            {localization.missingDetails2}
          </Text>
        </View>
      );
    }
  };

  // Assume key is index of value in items array
  _editItem = (value, key) => {
    let validMenuIems =
      this.props.navigation.state.params.foodItems &&
      this.props.navigation.state.params.drinkItems;
    if (value.customizationOn && validMenuIems) {
      var menuItems = this.props.navigation.state.params.foodItems.concat(
        this.props.navigation.state.params.drinkItems
      );

      var item_index = menuItems.findIndex((item) => {
        return value.uuid.includes(item.uuid);
      });

      if (item_index != -1) {
        this.props.navigation.navigate("CustomizeOrder", {
          itemInfo: menuItems[item_index],
          editOrder: true,
          order: value,
          itemsIndex: key,
        });
      }
    }
  };

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <View>
            {this._getOrderSchedule()}
            <Text style={styles.subTitle}>{localization.items}</Text>
            <List>
              {this.props.order.items.map((value, key) => (
                <ListItem
                  style={styles.listItem}
                  key={key}
                  onPress={() => this._editItem(value, key)}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ flex: 2, fontSize: 20 }}>{value.name}</Text>
                    <Text style={{ flex: 1, fontSize: 20 }}>
                      x {value.quantity}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 20 }}>
                      {"\u0024"}
                      {(value.quantity * value.price).toFixed(2)}
                    </Text>
                  </View>
                  {value.customizationOn ? (
                    value.customization.map((customization, key) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          marginTop: 5,
                          marginLeft: 10,
                        }}
                      >
                        <Text style={{ flex: 1, color: "gray" }}>
                          {customization.headerName}:
                        </Text>
                        <Text style={{ flex: 2, color: "gray" }}>
                          {customization.optionName}
                        </Text>
                        <Text style={{ flex: 1, color: "gray" }}>
                          {"\u0024"}
                          {parseFloat(customization.optionPrice).toFixed(2)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View />
                  )}
                </ListItem>
              ))}
              {this.props.order.items.length == 0 && (
                <Text style={{ color: colors.errorText }}>
                  {localization.empty} {localization.cart}
                </Text>
              )}
              {this.orderType === "Delivery" && (
                <List>
                  <ListItem style={styles.listItem}>
                    <View
                      style={{
                        flexDirection: "row",
                      }}
                    >
                      <Text style={{ flex: 3, fontSize: 20 }}>
                        {localization.delivery} {localization.fee}:
                      </Text>
                      <Text style={{ flex: 1, fontSize: 20 }}>
                        {"\u0024"}
                        {parseFloat(this.deliveryFee).toFixed(2)}
                      </Text>
                    </View>
                  </ListItem>
                </List>
              )}
            </List>
          </View>
        </Content>
        <Footer>
          <FooterTab style={{ flexDirection: "column" }}>
            <ConfirmBar
              customerOrder={this.customerOrder}
              customerOrderStatus={this.customerOrderStatus}
              navigation={this.props.navigation}
              validSchedule={this.validSchedule}
              isCartEmpty={this.props.order.items.length == 0 ? true : false}
            />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    order: state.order,
    settings: state.settings
  };
};

export default connect(mapStateToProps)(CustomerCartScreen);

const styles = StyleSheet.create({
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  subTitle: {
    paddingTop: 10,
    fontWeight: "bold",
  },
  listItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 5,
    // justifyContent: "flex-start"
  },
  quantityContainer: {
    flexDirection: "row",
  },
});
