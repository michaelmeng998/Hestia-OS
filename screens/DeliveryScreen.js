import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Picker,
  TextInput
} from "react-native";

import {
  Button,
  CheckBox,
  Container,
  Content,
  Footer,
  FooterTab,
  ListItem,
  Text,
  Radio,
  Left,
  Right
} from "native-base";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import DeliveryContinueButton from "../components/DeliveryContinueButton";

import ClientSchedulerStrip from "../components/ClientSchedulerStrip";
import moment from "moment";

import Icon from "react-native-vector-icons/Ionicons";

class DeliveryScreen extends React.Component {
  static navigationOptions = {};

  constructor(props) {
    super(props);
    this.state = {
      dropoff_locations: [],
      open_days: {},
      currently_selected: null,

      deliveryTPickerVisible: false,
      pickupTPickerVisible: false,
      pickupLocationIndex: -1
    };
    this.unsubscribe_dropoff_locations = null;
    this.unsubscribe_schedule_locations = null;
  }

  componentDidMount() {
    this.dropoff_locations = firebase
      .firestore()
      .collection("dropoff_locations");
    this.schedule = firebase
      .firestore()
      .collection("merchants")
      .doc(this.props.navigation.state.params.merchant_uuid)
      .collection("schedule");

    this.merchant_schedule = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection("schedule");
    this.unsubscribe_dropoff_locations = this.dropoff_locations.onSnapshot(
      this._onCollectionUpdateDropoffLocations
    );
    this.unsubscribe_schedule = this.schedule.onSnapshot(
      this._onCollectionUpdateSchedule
    );
  }

  _onCollectionUpdateDropoffLocations = querySnapshot => {
    var dropoff_locations = [];
    querySnapshot.forEach(doc => {
      const { name, address, city, province, country } = doc.data();
      const uuid = doc.id;

      dropoff_locations.push({
        name: name,
        address: address,
        city: city,
        province: province,
        country: country,
        uuid: uuid
      });

      this.setState({
        dropoff_locations: dropoff_locations
      });
    });
  };

  _getTimeLabel(startTime, endTime) {
    let start = moment(startTime).format("h:mm A");
    let end = moment(endTime).format("h:mm A");
    console.log("BABY: " + start + " - " + end);
    return start + " - " + end;
  }

  _getTimeLabelArray(timeLabel, hours) {
    for (var i = 0; i < hours.length; i++) {
      timeLabel.push(this._getTimeLabel(hours[i].startTime, hours[i].endTime));
    }
  }

  _addScheduleTimeLabels(schedule) {
    // labels for delivery times
    let newSchedule = {
      ...schedule
    };

    let deliveryLabel = [];
    if (!schedule.deliverySchedule) {
      schedule.deliverySchedule = [];
    }
    this._getTimeLabelArray(deliveryLabel, schedule.deliverySchedule);
    newSchedule.deliveryLabel = deliveryLabel;

    // labels for pickup times
    if (!schedule.pickupSchedule) {
      schedule.pickupSchedule = [];
    }
    for (var j = 0; j < schedule.pickupSchedule.length; j++) {
      let hoursLabel = [];
      let hoursSchedule = schedule.pickupSchedule[j].hours
        ? schedule.pickupSchedule[j].hours
        : [];
      this._getTimeLabelArray(hoursLabel, hoursSchedule);
      newSchedule.pickupSchedule[j].hoursLabel = hoursLabel;
    }
    return newSchedule;
  }

  _onCollectionUpdateSchedule = querySnapshot => {
    var open_days = [];
    querySnapshot.forEach(doc => {
      var date = doc.id;
      var openDay = doc.data();
      var schedule = openDay.schedule ? openDay.schedule : {};
      var openDayWithLabels = this._addScheduleTimeLabels(schedule);
      open_days[date] = { schedule: openDayWithLabels };
    });

    this.setState(
      prevState => {
        return {
          ...prevState,
          open_days: open_days
        };
      },
      () => {
        this._reindexPickupLocation();
      }
    );
  };

  _updateAddress = value => {
    this.setState({
      currently_selected: value.uuid
    });
    this.props.addDeliveryAddress(value.address);
  };

  _toggleOrderType = isDelivery => {
    this.props.toggleOrderType(isDelivery);
  };

  _toggleDeliveryTimePicker = () => {
    this.setState({
      deliveryTPickerVisible: !this.state.deliveryTPickerVisible
    });
  };

  _togglePickupTimePicker = () => {
    this.setState({
      pickupTPickerVisible: !this.state.pickupTPickerVisible
    });
  };

  _getOrderType(isDelivery) {
    return isDelivery
      ? this.props.orderTypes.delivery
      : this.props.orderTypes.pickup;
  }

  _isDeliveryAndOpen() {
    return (
      this.props.delivery.isDelivery &&
      this.props.delivery.date in this.state.open_days &&
      this.state.open_days[this.props.delivery.date].schedule.deliverySchedule
    );
  }

  _isPickupAndOpen() {
    return (
      !this.props.delivery.isDelivery &&
      this.props.delivery.date in this.state.open_days &&
      this.state.open_days[this.props.delivery.date].schedule.pickupSchedule
    );
  }

  _isPickupLocationSelected() {
    return this.props.delivery.pickupLocation.placeID;
  }

  _isOpen() {
    return this.props.delivery.date in this.state.open_days;
  }

  _isDeliveryTimeAvailable() {
    return (
      this.state.open_days[this.props.delivery.date].schedule.deliveryLabel
        .length > 0
    );
  }

  // Assumption: Since location index is updated when there are changes
  //              made to the schedule collection, index always < pickup schedule length
  _isPickupTimeAvailable() {
    if (
      this.state.pickupLocationIndex >= 0 &&
      this.state.pickupLocationIndex <
        this.state.open_days[this.props.delivery.date].schedule.pickupSchedule
          .length
    ) {
      return this.state.open_days[this.props.delivery.date].schedule
        .pickupSchedule[this.state.pickupLocationIndex].hours.length > 0
        ? true
        : false;
    }
    return false;
  }

  // For delivery orders
  _isTimeSelected() {
    var timeText = "Select a delivery time...";
    console.log(this.props.delivery.timeLabel);
    if (!(this.props.delivery.timeLabel == "")) {
      timeText = this.props.delivery.timeLabel;
    }
    return timeText;
  }

  _isPickupTimeSelected() {}

  _onChangeNoteToChef = note => {
    this.props.updateNoteToChef(note);
  };

  _selectPickupLocation = pickupSchedule => {
    // record index of the location in the pickupSchedule array of the store
    // reindex when the firebase updates
    this.props.selectPickupLocation(pickupSchedule).then(() => {
      this._reindexPickupLocation();
    });
  };

  // Custom instead of filter
  //  checks whether properties (placeID, name, address) actually exist
  // Assumption: kitchen is open on this date
  //             pickup location has been selected
  _reindexPickupLocation() {
    if (this.props.delivery.date in this.state.open_days) {
      let numOfLoc = this.state.open_days[this.props.delivery.date].schedule
        .pickupSchedule.length;
      for (var i = 0; i < numOfLoc; i++) {
        let placeID = this.state.open_days[this.props.delivery.date].schedule
          .pickupSchedule[i].location.placeID
          ? this.state.open_days[this.props.delivery.date].schedule
              .pickupSchedule[i].location.placeID
          : "";
        if (this.props.delivery.pickupLocation.placeID == placeID) {
          // Store the index of the location for faster lookup :)
          this.setState({
            pickupLocationIndex: i
          });
          return;
        }
      }
      this.setState({
        pickupLocationIndex: -1
      });
    }
  }

  _isOrderComplete() {
    // order date will default to today
    var validTime = false;
    var validLocation = false;
    if (this.props.delivery.isDelivery) {
      validTime = this.props.delivery.time.start != "";
      validLocation = !(
        typeof this.props.delivery.location.placeID === "undefined"
      );
    } else {
      validTime = this.props.delivery.pickupTime.start != "";
      validLocation = !(
        typeof this.props.delivery.pickupLocation.placeID === "undefined"
      );
    }
    return validTime && validLocation;
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <ClientSchedulerStrip
            selectedDate={this.props.delivery.date}
            kitchenId={this.props.navigation.state.params.merchant_uuid}
          />
          <View style={styles.touchPad}>
            <View style={{ flexDirection: "row" }}>
              <Left
                style={[
                  { flexDirection: "column" },
                  { paddingRight: 10 },
                  styles.alignmentVertical
                ]}
              >
                <Text>
                  {this._getOrderType(this.props.delivery.isDelivery)}
                </Text>
              </Left>
              <Right style={{ flexDirection: "column" }}>
                <SwitchButton
                  trueColor={this.props.orderColors.delivery}
                  falseColor={this.props.orderColors.pickup}
                  toggleOpen={this._toggleOrderType}
                  open={this.props.delivery.isDelivery}
                />
              </Right>
            </View>
          </View>

          <Text style={{ fontWeight: "bold", textAlign: "center" }}>
            {" "}
            {moment(this.props.delivery.date).format("dddd, MMMM Do")}{" "}
          </Text>
          <View style={styles.lineDividerStyle}></View>

          {this._isOpen() && (
            <View>
              <Text style={styles.headerStyle}>
                {this._getOrderType(this.props.delivery.isDelivery)}{" "}
                {this.props.delivery.isDelivery ? "Time:" : "Location:"}
              </Text>
              {this._isDeliveryAndOpen() && (
                <View>
                  {this._isDeliveryTimeAvailable() && (
                    <View>
                      <TouchableOpacity
                        onPress={() => this._toggleDeliveryTimePicker()}
                      >
                        {this.props.delivery.timeLabel == "" && (
                          <Text
                            style={[
                              styles.placeholderText,
                              styles.placeholerStyle
                            ]}
                          >
                            {"Select a delivery time...   "}
                            {!this.state.deliveryTPickerVisible && (
                              <Icon
                                size={20}
                                name="ios-arrow-dropdown-circle"
                              ></Icon>
                            )}
                            {this.state.deliveryTPickerVisible && (
                              <Icon
                                size={20}
                                name="ios-arrow-dropup-circle"
                              ></Icon>
                            )}
                          </Text>
                        )}
                        {!(this.props.delivery.timeLabel == "") && (
                          <Text
                            style={[
                              styles.selectedText,
                              styles.placeholerStyle
                            ]}
                          >
                            {this.props.delivery.timeLabel + "   "}
                            {!this.state.deliveryTPickerVisible && (
                              <Icon
                                size={20}
                                name="ios-arrow-dropdown-circle"
                              ></Icon>
                            )}
                            {this.state.deliveryTPickerVisible && (
                              <Icon
                                size={20}
                                name="ios-arrow-dropup-circle"
                              ></Icon>
                            )}
                          </Text>
                        )}
                      </TouchableOpacity>
                      {this.state.deliveryTPickerVisible && (
                        <View>
                          <Picker
                            selectedValue={
                              this.props.tempSelections.deliveryTPick
                            }
                            onValueChange={
                              (itemValue, itemIndex) =>
                                this.props.tempSelectDeliveryTime(itemValue)
                              // this.setState({deliveryTPickerVal: itemValue})
                            }
                          >
                            {this.state.open_days[
                              this.props.delivery.date
                            ].schedule.deliveryLabel.map((value, key) => (
                              <Picker.Item label={value} value={value} />
                            ))}
                          </Picker>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              marginTop: 5,
                              marginBottom: 10
                            }}
                          >
                            <Button
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "center",
                                width: "100%",
                                backgroundColor: "black",
                                borderRadius: 30,
                                padding: 5
                              }}
                              primary
                              onPress={() => {
                                this._toggleDeliveryTimePicker();
                                // If deliveryTPick is empty, grab first time in the array
                                if (
                                  this.props.tempSelections.deliveryTPick ==
                                    "" &&
                                  this.state.open_days[this.props.delivery.date]
                                    .schedule.deliveryLabel.length > 0
                                ) {
                                  this.props
                                    .tempSelectDeliveryTime(
                                      this.state.open_days[
                                        this.props.delivery.date
                                      ].schedule.deliveryLabel[0]
                                    )
                                    .then(() => {
                                      this.props.selectOrderTime(
                                        this.props.tempSelections.deliveryTPick,
                                        this.state.open_days[
                                          this.props.delivery.date
                                        ].schedule.deliverySchedule,
                                        this.state.open_days[
                                          this.props.delivery.date
                                        ].schedule.deliveryLabel,
                                        this.props.delivery.isDelivery
                                      );
                                    });
                                  console.log(
                                    this.state.open_days[
                                      this.props.delivery.date
                                    ].schedule.deliveryLabel[0]
                                  );
                                } else {
                                  this.props.selectOrderTime(
                                    this.props.tempSelections.deliveryTPick,
                                    this.state.open_days[
                                      this.props.delivery.date
                                    ].schedule.deliverySchedule,
                                    this.state.open_days[
                                      this.props.delivery.date
                                    ].schedule.deliveryLabel,
                                    this.props.delivery.isDelivery
                                  );
                                }
                              }}
                            >
                              <Text
                                style={{ textAlign: "center", color: "white" }}
                              >
                                Confirm
                              </Text>
                            </Button>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  {!this._isDeliveryTimeAvailable() && (
                    <Text
                      style={[styles.placeholderText, styles.placeholerStyle]}
                    >
                      No delivery times available...
                    </Text>
                  )}
                  <View style={styles.lineDividerStyle}></View>
                  <Text style={styles.headerStyle}>Delivery Address:</Text>
                  <TouchableOpacity
                    style={styles.placeholerStyle}
                    onPress={() =>
                      this.props.navigation.navigate("LocationPicker", {
                        userType: "customers",
                        reduxActionType: "CUSTOMER_ADD_LOCATION"
                      })
                    }
                  >
                    {!this.props.delivery.location.placeID && (
                      <Text style={styles.placeholderText}>
                        Select delivery address...
                        <Icon size={20} name="ios-search"></Icon>
                      </Text>
                    )}
                    {this.props.delivery.location.placeID && (
                      <View>
                        <View>
                          <Text>{this.props.delivery.location.name}</Text>
                        </View>
                        <View>
                          <Text style={styles.addressColor}>
                            {this.props.delivery.location.address}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
              {this._isPickupAndOpen() && (
                <View style={styles.placeholerStyle}>
                  {!this._isPickupLocationSelected() &&
                    this.state.open_days[
                      this.props.delivery.date
                    ].schedule.pickupSchedule.map((value, key) => (
                      <ListItem
                        onPress={() =>
                          this._selectPickupLocation(value.location)
                        }
                        key={key}
                      >
                        <Left style={{ flexDirection: "column" }}>
                          <View>
                            {/* TODO: handle exception where there is no locations for given open day */}
                            <Text>{value.location.name}</Text>
                          </View>
                          <View>
                            <Text style={styles.addressColor}>
                              {value.location.address}
                            </Text>
                          </View>
                        </Left>
                      </ListItem>
                    ))}
                  {this._isPickupLocationSelected() && (
                    <View>
                      <View style={{ flexDirection: "row" }}>
                        <Left style={{ flexDirection: "column", flex: 3 }}>
                          <View>
                            <Text>
                              {this.props.delivery.pickupLocation.name}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.addressColor}>
                              {this.props.delivery.pickupLocation.address}
                            </Text>
                          </View>
                        </Left>
                        <Right style={{ flexDirection: "column", flex: 1 }}>
                          <TouchableOpacity
                            style={styles.marginSearchIcon}
                            onPress={() => this.props.removePickupLocation()}
                          >
                            <Icon size={20} name="ios-close-circle"></Icon>
                          </TouchableOpacity>
                        </Right>
                      </View>

                      {/* TODO: Refactor to reduce redundant code */}
                      <View style={styles.lineDividerStyle}></View>
                      <Text style={styles.headerStyle}>Pickup Time:</Text>

                      {this._isPickupTimeAvailable() && (
                        <View>
                          <TouchableOpacity
                            onPress={() => this._togglePickupTimePicker()}
                          >
                            {this.props.delivery.pickupTimeLabel == "" && (
                              <Text
                                style={[
                                  styles.placeholderText,
                                  styles.placeholerStyle
                                ]}
                              >
                                {"Select a pickup time...   "}
                                {!this.state.pickupTPickerVisible && (
                                  <Icon
                                    size={20}
                                    name="ios-arrow-dropdown-circle"
                                  ></Icon>
                                )}
                                {this.state.pickupTPickerVisible && (
                                  <Icon
                                    size={20}
                                    name="ios-arrow-dropup-circle"
                                  ></Icon>
                                )}
                              </Text>
                            )}
                            {!(this.props.delivery.pickupTimeLabel == "") && (
                              <Text
                                style={[
                                  styles.selectedText,
                                  styles.placeholerStyle
                                ]}
                              >
                                {this.props.delivery.pickupTimeLabel + "   "}
                                {!this.state.pickupTPickerVisible && (
                                  <Icon
                                    size={20}
                                    name="ios-arrow-dropdown-circle"
                                  ></Icon>
                                )}
                                {this.state.pickupTPickerVisible && (
                                  <Icon
                                    size={20}
                                    name="ios-arrow-dropup-circle"
                                  ></Icon>
                                )}
                              </Text>
                            )}
                          </TouchableOpacity>
                          {this.state.pickupTPickerVisible && (
                            <View>
                              <Picker
                                selectedValue={
                                  this.props.tempSelections.pickupTPick
                                }
                                onValueChange={(itemValue, itemIndex) =>
                                  this.props.tempSelectPickupTime(itemValue)
                                }
                              >
                                {this.state.open_days[
                                  this.props.delivery.date
                                ].schedule.pickupSchedule[
                                  this.state.pickupLocationIndex
                                ].hoursLabel.map((value, key) => (
                                  <Picker.Item label={value} value={value} />
                                ))}
                              </Picker>
                              <View
                                style={{
                                  flex: 1,
                                  flexDirection: "row",
                                  marginTop: 5,
                                  marginBottom: 10
                                }}
                              >
                                <Button
                                  style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    width: "100%",
                                    backgroundColor: "black",
                                    borderRadius: 30,
                                    padding: 5
                                  }}
                                  primary
                                  onPress={() => {
                                    this._togglePickupTimePicker();
                                    // If deliveryTPick is empty, grab first time in the array
                                    if (
                                      this.props.tempSelections.pickupTPick ==
                                      ""
                                    ) {
                                      this.props
                                        .tempSelectPickupTime(
                                          this.state.open_days[
                                            this.props.delivery.date
                                          ].schedule.pickupSchedule[
                                            this.state.pickupLocationIndex
                                          ].hoursLabel[0]
                                        )
                                        .then(() => {
                                          this.props.selectOrderTime(
                                            this.props.tempSelections
                                              .pickupTPick,
                                            this.state.open_days[
                                              this.props.delivery.date
                                            ].schedule.pickupSchedule[
                                              this.state.pickupLocationIndex
                                            ].hours,
                                            this.state.open_days[
                                              this.props.delivery.date
                                            ].schedule.pickupSchedule[
                                              this.state.pickupLocationIndex
                                            ].hoursLabel,
                                            this.props.delivery.isDelivery
                                          );
                                        });
                                    } else {
                                      this.props.selectOrderTime(
                                        this.props.tempSelections.pickupTPick,
                                        this.state.open_days[
                                          this.props.delivery.date
                                        ].schedule.pickupSchedule[
                                          this.state.pickupLocationIndex
                                        ].hours,
                                        this.state.open_days[
                                          this.props.delivery.date
                                        ].schedule.pickupSchedule[
                                          this.state.pickupLocationIndex
                                        ].hoursLabel,
                                        this.props.delivery.isDelivery
                                      );
                                    }
                                  }}
                                >
                                  <Text
                                    style={{
                                      textAlign: "center",
                                      color: "white"
                                    }}
                                  >
                                    Confirm
                                  </Text>
                                </Button>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                      {!this._isPickupTimeAvailable() && (
                        <Text
                          style={[
                            styles.placeholderText,
                            styles.placeholerStyle
                          ]}
                        >
                          No pickup times available for this location...
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
              <View style={styles.lineDividerStyle}></View>
              <Text style={styles.headerStyle}>Notes To Chef:</Text>
              <View>
                <TextInput
                  multiline={true}
                  style={[
                    styles.textInputStyles,
                    { height: 40, borderColor: "gray", borderWidth: 0.5 }
                  ]}
                  onChangeText={text => this._onChangeNoteToChef(text)}
                  value={this.props.delivery.noteToChef}
                  placeholder={"Allergies, extra napkins, utensils, etc."}
                  placeholderTextColor={styles.placeholderText}
                />
              </View>
            </View>
          )}
          {!this._isOpen() && (
            <Text style={styles.placeholderText}>
              Kitchen is currently unavailable on this date
            </Text>
          )}
        </Content>
        {this._isOpen() && (
          <Footer>
            {this._isOrderComplete() ? (
              <DeliveryContinueButton
                orderType={
                  this.props.delivery.isDelivery ? "Delivery" : "Pickup"
                }
                navigation={this.props.navigation}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  backgroundColor: "black",
                  justifyContent: "center"
                }}
              >
                <Text style={{ color: "white" }}>
                  Please Select a{" "}
                  {this._getOrderType(this.props.delivery.isDelivery)}{" "}
                  {this.props.delivery.isDelivery ? "Time" : "Location"}
                </Text>
              </View>
            )}
          </Footer>
        )}
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    tempSelections: state.order.tempSelections,
    delivery: state.order.delivery,
    orderTypes: state.scheduler.orderTypes,
    orderColors: state.scheduler.orderColor
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addDeliveryAddress: address =>
      dispatch({
        type: "CHANGE_ADDRESS",
        payload: address
      }),
    toggleOrderType: val =>
      dispatch({
        type: "CHANGE_ORDER_TYPE",
        payload: val
      }),
    updateNoteToChef: note =>
      dispatch({
        type: "UPDATE_NOTE_TO_CHEF",
        payload: note
      }),
    selectOrderTime: (time, schedule, label, isDelivery) =>
      dispatch({
        type: "SELECT_ORDER_TIME",
        payload: {
          time: time,
          schedule: schedule,
          label: label,
          isDelivery: isDelivery
        }
      }),
    tempSelectDeliveryTime: time => {
      dispatch({
        type: "TEMP_SELECT_DELIVERY_TIME",
        payload: time
      });
      return Promise.resolve();
    },
    tempSelectPickupTime: time => {
      dispatch({
        type: "TEMP_SELECT_PICKUP_TIME",
        payload: time
      });
      return Promise.resolve();
    },
    selectPickupLocation: pickupSchedule => {
      dispatch({
        // pickup schedule includes location + times for a given day
        type: "SELECT_PICKUP_LOCATION",
        payload: pickupSchedule
      });
      return Promise.resolve();
    },
    removePickupLocation: () =>
      dispatch({
        // pickup schedule includes location + times for a given day
        type: "CUSTOMER_REMOVE_PICKUP_LOCATION"
      })
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryScreen);

//()=> this.setState({currently_selected:value.uuid})}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    flexGrow: 1
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  ContinueButton: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ffcc66",
    paddingHorizontal: 5
  },
  lineDividerStyle: {
    paddingTop: 10,

    alignSelf: "stretch",
    width: "100%",

    borderBottomColor: "gray",
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  touchPad: {
    paddingTop: 10,
    paddingBottom: 30
  },
  alignmentVertical: {
    paddingTop: 15
  },
  placeholderText: {
    color: "gray"
  },
  selectedText: {
    color: "black"
  },
  placeholerStyle: {
    marginTop: 10
  },
  headerStyle: {
    fontWeight: "bold"
  },
  addressColor: {
    color: "#686868"
  },
  textInputStyles: {
    marginTop: 10
  }
});
