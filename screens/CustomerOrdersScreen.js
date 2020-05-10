import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

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
import { TabView, TabBar } from "react-native-tab-view";
import CustomerOrderList from "../components/OrderList";

import firebase from "react-native-firebase";
import localization from "../constants/Localization";

import { connect } from 'react-redux';

class CustomerOrdersScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: `${localization.settings}`,
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.orders
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.state = {
      upcomingOrders: [],
      pastOrders: [],

      index: 0,
      routes: [
        { key: "upcoming", title: localization.upcoming },
        { key: "past", title: localization.pending },
      ],
    };
    this.unsubscribe_orders = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.orders });

      this.setState({
        routes: [
          { key: "upcoming", title: localization.upcoming },
          { key: "past", title: localization.pending },
        ]
      })
    }
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;
    this.customer_orders = firebase
      .firestore()
      .collection("customers")
      .doc(this.customer_id)
      .collection("orders")
      .orderBy("orderSchedule.time.startTime");
    this.unsubscribe_orders = this.customer_orders.onSnapshot(
      this._onCollectionUpdateOrders
    );
  }

  componentWillUnmount() {
    this.unsubscribe_orders();
  }

  _onCollectionUpdateOrders = (querySnapshot) => {
    var upcomingOrders = [];
    var pastOrders = [];

    querySnapshot.forEach((doc) => {
      var data = doc.data();
      var id = doc.id;
      var orderStatus = this._getOrderStatus(data.orderStatus);
      var sort = 0;
      data = {
        ...data,
        uuid: id,
        sort: sort,
        orderStatus: orderStatus,
      };

      if (
        data.orderStatus.text == "(Pending...)" ||
        data.orderStatus.text == "(Confirmed)" ||
        data.orderStatus.text == "(On The Way)"
      ) {
        upcomingOrders.push(data);
      } else if (
        data.orderStatus.text == "(Completed)" ||
        data.orderStatus.text == "(Rejected)"
      ) {
        pastOrders.push(data);
      }
    });
    this.setState({
      upcomingOrders: upcomingOrders,
      pastOrders: pastOrders,
    });
  };

  _getOrderStatus = (orderStatus) => {
    if (orderStatus == "P") {
      orderStatus = {
        text: "(Pending...)",
        color: "black",
        sort: 3,
      };
    }
    if (orderStatus == "C") {
      orderStatus = {
        text: "(Confirmed)",
        color: "green",
        sort: 2,
      };
    }
    if (orderStatus == "I") {
      orderStatus = {
        text: "(On The Way)",
        color: "green",
        sort: 1,
      };
    }
    if (orderStatus == "R") {
      orderStatus = {
        text: "(Rejected)",
        color: "red",
        sort: 2,
      };
    }
    if (orderStatus == "D") {
      orderStatus = {
        text: "(Completed)",
        color: "#808080",
        sort: 1,
      };
    }
    return orderStatus;
  };

  _renderScene = ({ route }) => {
    switch (route.key) {
      case "upcoming":
        return <CustomerOrderList orderList={this.state.upcomingOrders} />;
      case "past":
        return <CustomerOrderList orderList={this.state.pastOrders} />;
      default:
        return null;
    }
  };

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <TabView
            style={styles.container}
            navigationState={this.state}
            renderScene={this._renderScene}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                activeColor={"black"}
                inactiveColor={"#808080"} // gray
                indicatorStyle={{ backgroundColor: "black" }}
                style={{ backgroundColor: "white" }}
              />
            )}
            onIndexChange={(index) => this.setState({ index })}
            initialLayout={{ width: Dimensions.get("window").width }}
          />
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
      settings: state.settings
  }
}

export default connect(mapStateToProps, null)(CustomerOrdersScreen);

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
});
