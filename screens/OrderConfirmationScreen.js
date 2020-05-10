import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  View
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
  Text
} from "native-base";
import moment from "moment";
import { connect } from "react-redux";
import ConfirmBar from "../components/ConfirmBar";
import firebase from "react-native-firebase";

class OrderConfirmationScreen extends React.Component {
  static navigationOptions = {
    title: "Cart"
  };

  constructor(props) {
    super(props);
    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;

    this.orderType = this.props.navigation.state.params.orderType;

    if (this.props.order.delivery.isDelivery) {
      this.location = this.props.order.delivery.location;
      this.time = this.props.order.delivery.time;
      this.timeLabel = this.props.order.delivery.timeLabel;
    } else {
      this.location = this.props.order.delivery.pickupLocation;
      this.time = this.props.order.delivery.pickupTime;
      this.timeLabel = this.props.order.delivery.pickupTimeLabel;
    }

    this.note = this.props.order.delivery.noteToChef;

    this.customerOrder = {
      date: this.props.order.delivery.date,
      isDelivery: this.props.order.delivery.isDelivery,
      location: this.location,
      time: this.time,
      timeLabel: this.timeLabel,
      noteToChef: this.note
    };

    this.customerOrderStatus = "P"; // Pending status
  }

  componentDidMount() {}

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <View>
            <Text style={styles.subTitle}>{this.orderType + " Details"}</Text>
            <Text style={{ padding: 5 }}>{this.location.name}</Text>
            <View
              style={{
                justifyContent: "space-evenly",
                flexWrap: "wrap",
                flexDirection: "row",
                padding: 5
              }}
            >
              <Text style={{ flex: 1 }}>
                {moment(this.time).format("MMMM Do")}
              </Text>
              <Text style={{ flex: 1 }}>{this.timeLabel}</Text>
            </View>
            <Text style={styles.subTitle}>Items</Text>
            <List>
              {this.props.order.items.map((value, key) => (
                <ListItem style={styles.listItem} key={key}>
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
                          marginLeft: 10
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
                    <View></View>
                  )}
                </ListItem>
              ))}
            </List>

            <Text style={styles.subTitle}>Note to Chef</Text>
            <Text style={{ padding: 5 }}>{this.note}</Text>
          </View>
        </Content>
        <Footer>
          <FooterTab style={{ flexDirection: "column" }}>
            <ConfirmBar
              customerOrder={this.customerOrder}
              customerOrderStatus={this.customerOrderStatus}
              navigation={this.props.navigation}
            />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    order: state.order
  };
};

export default connect(mapStateToProps)(OrderConfirmationScreen);

const styles = StyleSheet.create({
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff"
  },
  subTitle: {
    paddingTop: 10,
    fontWeight: "bold"
  },
  listItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 5
    // justifyContent: "flex-start"
  },
  quantityContainer: {
    flexDirection: "row"
  }
});
