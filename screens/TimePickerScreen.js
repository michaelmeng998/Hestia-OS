import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";

import {
  Container,
  Content,
  Button,
  Text,
  List,
  ListItem,
  Accordion,
  Left,
  Right,
} from "native-base";
import Icon from "react-native-vector-icons/Ionicons";

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { connect } from "react-redux";
import localization from "../constants/Localization";
import moment from "moment";

class TimePickerScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.add + " " + localization.time
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    // Treat this.state as if it were immutable.

    this.state = {
      isVisible: false,
      timeType: "",
      startTime: null,
      endTime: null,
    };

    this.delivery = localization.delivery;
    this.pickup = localization.pickup;

    (this.isDelivery = this.props.navigation.state.params.isDelivery
      ? true
      : false),
      (this.orderType = this.isDelivery ? this.delivery : this.pickup);

    if (!this.isDelivery) {
      this.placeID = this.props.navigation.state.params.value.location.placeID;
    }

    this.props.navigation.setParams({
      title: localization.add + " " + localization.time,
    });
  }

  _showDatePicker = (type) => {
    console.log("setdatepicker");
    this.setState({
      isVisible: true,
      timeType: type,
    });
    console.log("time visible: " + this.state.isVisible);
  };

  _hideDatePicker = () => {
    this.setState({
      isVisible: false,
      timeType: "",
    });
  };

  _handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    console.log("date hour,min: " + date.getHours() + ", " + date.getMinutes());

    if (this.state.timeType == "start") {
      this.setState({
        startTime: moment(date),
      });
    } else {
      // end time
      this.setState({
        endTime: moment(date),
      });
    }

    this._hideDatePicker();
  };

  _addDeliveryTimeInterval() {
    // assumption that start/end time have been provided
    // let orderType = this.isDelivery ? this.props.deliveryType : this.props.pickupType;
    if (this.isDelivery) {
      this.props.addDeliveryTimeInterval({
        startTime: this.state.startTime,
        endTime: this.state.endTime,
      });
    } else {
      this.props.addPickupTimeInterval({
        placeID: this.placeID,
        startTime: this.state.startTime,
        endTime: this.state.endTime,
      });
    }

    this.props.navigation.goBack();
  }

  _confirmDeliveryTimeInterval() {
    let deliveryTimeInterval =
      this.state.startTime.format("h:mm A") +
      " - " +
      this.state.endTime.format("h:mm A");
    let alertTitle = localization.confirm + localization.time;
    Alert.alert(
      alertTitle,
      deliveryTimeInterval,
      [
        {
          text: localization.cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: localization.ok,
          onPress: () => this._addDeliveryTimeInterval(),
        },
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          {/* <View style={styles.flexBox}></View> */}
          <View style={styles.content}>
            <View style={styles.touchPad}>
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={() => this._showDatePicker("start")}
              >
                <Text style={{ paddingRight: 10, color: "white" }}>
                  {localization.add} {this.orderType} {localization.startTime}
                </Text>
                <Icon
                  style={{ color: "white" }}
                  size={20}
                  name="ios-time"
                ></Icon>
              </TouchableOpacity>
              {this.state.startTime && (
                <Text style={styles.selectedTimeStyle}>
                  {this.state.startTime.format("h:mm A")}
                </Text>
              )}
            </View>

            <View style={styles.touchPad}>
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={() => this._showDatePicker("end")}
              >
                <Text style={{ paddingRight: 10, color: "white" }}>
                  {localization.add} {this.orderType} {localization.endTime}
                </Text>
                <Icon
                  style={{ color: "white" }}
                  size={20}
                  name="ios-time"
                ></Icon>
              </TouchableOpacity>
              {this.state.endTime && (
                <Text style={styles.selectedTimeStyle}>
                  {this.state.endTime.format("h:mm A")}
                </Text>
              )}
            </View>
          </View>
          {this.state.startTime && this.state.endTime && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginTop: 20,
                marginBottom: 50,
              }}
            >
              <Button
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "100%",
                  backgroundColor: "black",
                }}
                primary
                onPress={() => this._confirmDeliveryTimeInterval()}
              >
                <Text style={{ textAlign: "center", color: "white" }}>
                  {localization.add} {this.orderType} {localization.time}
                </Text>
              </Button>
            </View>
          )}

          <DateTimePickerModal
            isVisible={this.state.isVisible}
            cancelTextIOS={localization.cancel}
            confirmTextIOS={localization.confirm}
            mode="time"
            titleIOS={localization.pickATime}
            // isDarkModeEnabled={true}
            onConfirm={this._handleConfirm}
            onCancel={this._hideDatePicker}
          />
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    deliveryColor: state.scheduler.orderColor.delivery,
    pickupColor: state.scheduler.orderColor.pickup,
    deliveryType: state.scheduler.orderTypes.delivery,
    pickupType: state.scheduler.orderTypes.pickup,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addPickupTimeInterval: (dateRange) =>
      dispatch({
        type: "ADD_PIKCUP_TIME_INTERVAL",
        payload: dateRange,
      }),
    addDeliveryTimeInterval: (dateRange) =>
      dispatch({
        type: "ADD_DELIVERY_TIME_INTERVAL",
        payload: dateRange,
      }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TimePickerScreen);

const styles = StyleSheet.create({
  content: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    height: 500,
  },
  flexBox: {
    flex: 1,
    height: 100,
  },
  touchPad: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  addTimeButton: {
    borderRadius: 7,
    backgroundColor: "black",
    flexDirection: "row",
    padding: 8,
  },
  contentContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  addressColor: {
    color: "#686868",
  },
  marginSearchIcon: {
    marginRight: 10,
  },
  alignmentVertical: {
    paddingTop: 15,
  },
  selectedTimeStyle: {
    textAlign: "center",
    paddingTop: 10,
    textDecorationLine: "underline",
  },
});
