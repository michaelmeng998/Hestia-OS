import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
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
import FastImage from "react-native-fast-image";
import Icon from "react-native-vector-icons/Ionicons";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import CartBar from "../components/CartBar";
import ClientSchedulerStrip from "../components/ClientSchedulerStrip";
import SchedulePicker from "../components/CustSchedulePicker";
import localization from "../constants/Localization";
import moment from "moment";
import colors from "../constants/Colors";

class KitchenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("name", "Default Name"),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      foodItems: [],
      drinkItems: [],
      currentOrder: [],
      inventory: {},
      schedulePicker: false,
      backgroundColor: "#fff",
    };

    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;

    this.kitchenName = this.props.navigation.state.params.name;
    this.kitchenId = this.props.navigation.state.params.uuid;

    this.unsubscribe_food_items = null;
    this.unsubscribe_drink_items = null;
    this.unsubscribe_inventory = null;

    this.today = moment().format("YYYY-MM-DD");
  }

  componentDidMount() {
    this.food_items = firebase
      .firestore()
      .collection("merchants")
      .doc(this.kitchenId)
      .collection("food_items");
    this.drink_items = firebase
      .firestore()
      .collection("merchants")
      .doc(this.kitchenId)
      .collection("drink_items");
    this.inventory = firebase
      .firestore()
      .collection("merchants")
      .doc(this.kitchenId)
      .collection("inventory")
      .where(firebase.firestore.FieldPath.documentId(), ">=", this.today);

    this.unsubscribe_food_items = this.food_items.onSnapshot(
      this._onCollectionUpdateFoodItems
    );
    this.unsubscribe_drink_items = this.drink_items.onSnapshot(
      this._onCollectionUpdateDrinkItems
    );
    this.unsubscribe_inventory = this.inventory.onSnapshot(
      this._onCollectionUpdateInventory
    );
  }

  componentWillUnmount() {
    this.unsubscribe_food_items();
    this.unsubscribe_drink_items();
    this.unsubscribe_inventory();

    this.props.eraseCart();
  }

  _onCollectionUpdateFoodItems = (querySnapshot) => {
    var foodItems = [];
    querySnapshot.forEach((doc) => {
      let {
        imgUrl,
        recipe,
        active,
        name,
        price,
        customizationOn,
        customizations,
        quantity,
      } = doc.data();
      const uuid = doc.id;
      if (imgUrl == null || imgUrl == "") {
        imgUrl =
          "https://firebasestorage.googleapis.com/v0/b/hestia-2de8a.appspot.com/o/placeholderImage.jpg?alt=media&token=8bbf8317-b152-48b3-bda9-6dfbdc6e3803";
      }
      if (active) {
        const itemID = firebase
          .firestore()
          .collection("merchants")
          .doc(this.kitchenId)
          .collection("food_items")
          .doc(uuid);
        foodItems.push({
          imgUrl: imgUrl,
          recipe: recipe,
          itemID: itemID,
          uuid: uuid,
          active: active,
          name: name,
          price: price,
          customizationOn: customizationOn,
          customizations: customizations,
          quantity: quantity,
        });
      }
    });

    this.setState({
      foodItems: foodItems,
    });
  };

  _onCollectionUpdateDrinkItems = (querySnapshot) => {
    const drinkItems = [];
    querySnapshot.forEach((doc) => {
      let {
        imgUrl,
        recipe,
        active,
        name,
        price,
        customizationOn,
        customizations,
        quantity,
      } = doc.data();
      if (imgUrl == null || imgUrl == "") {
        imgUrl =
          "https://firebasestorage.googleapis.com/v0/b/hestia-2de8a.appspot.com/o/placeholderImage.jpg?alt=media&token=8bbf8317-b152-48b3-bda9-6dfbdc6e3803";
      }
      const uuid = doc.id;
      if (active) {
        const itemID = firebase
          .firestore()
          .collection("merchants")
          .doc(this.kitchenId)
          .collection("drink_items")
          .doc(uuid);
        drinkItems.push({
          imgUrl: imgUrl,
          recipe: recipe,
          itemID: itemID,
          uuid: uuid,
          active: active,
          name: name,
          price: price,
          customizationOn: customizationOn,
          customizations: customizations,
          quantity: quantity,
        });
      }
    });
    this.setState({
      drinkItems: drinkItems,
    });
  };

  _onCollectionUpdateInventory = (querySnapshot) => {
    const inventory = {};
    querySnapshot.forEach((doc) => {
      inventory[doc.id] = doc.data();
    });

    this.setState({
      inventory: inventory,
    });

    // Add inventory to the store
    this.props.updateInventory(inventory);
  };

  _removeItemsFromFoodCart = (value) => {
    arraySize = this.state.foodItems.length;
    for (i = 0; i < arraySize; i++) {
      if (value.uuid === this.state.foodItems[i].uuid) {
        if (this.state.foodItems[i].quantity > 0) {
          // this.state.foodItems[i].quantity -= 1;
          this.props.removeItemFromCart(value);
          // this.setState(this.state);
        }
        return;
      }
    }
  };

  _addItemsToFoodCart = (value, itemInv) => {
    // Find index of non-customized food item in store arr, check inventory
    let existing_item_index = this.props.items.findIndex(
      (item) => value.uuid === item.uuid
    );
    let itemCartQuantity =
      existing_item_index !== -1
        ? this.props.items[existing_item_index].quantity
        : 0;
    if (itemCartQuantity < itemInv) {
      this.props.addItemToCart(value);
    }
    // this.setState(this.state);
    return;
  };

  _removeItemsFromDrinkCart = (value) => {
    arraySize = this.state.drinkItems.length;
    for (i = 0; i < arraySize; i++) {
      if (value.uuid === this.state.drinkItems[i].uuid) {
        if (this.state.drinkItems[i].quantity > 0) {
          // this.state.drinkItems[i].quantity -= 1;
          this.props.removeItemFromCart(value);
          // this.setState(this.state);
        }
        return;
      }
    }
  };

  _addItemsToDrinkCart = (value, itemInv) => {
    // Find index of non-customized food item in store arr, check inventory
    let existing_item_index = this.props.items.findIndex(
      (item) => value.uuid === item.uuid
    );
    let itemCartQuantity =
      existing_item_index !== -1
        ? this.props.items[existing_item_index].quantity
        : 0;
    if (itemCartQuantity < itemInv) {
      this.props.addItemToCart(value);
    }
    // this.setState(this.state);
    return;
  };

  _toggleSchedulePicker = () => {
    this.setState({
      schedulePicker: !this.state.schedulePicker,
    });
  };

  // Only callled for items with no customization
  _getIQOrdered = (itemID) => {
    let i = this.props.items.findIndex((item) => item.uuid === itemID);
    return i == -1 ? 0 : this.props.items[i].quantity;
  };

  _getItem = (value, key, addItemsToCart, removeItemsFromCart) => {
    var activeOrders = this.state.inventory.hasOwnProperty(this.props.date);
    var showInventory = false;

    var itemOrdersPlaced = 0;
    if (activeOrders) {
      // Need to account for items with customizationOn
      if (value.customizationOn) {
        for (var uuid in this.state.inventory[this.props.date]) {
          if (uuid.includes(value.uuid)) {
            itemOrdersPlaced += this.state.inventory[this.props.date][uuid];
          }
        }
      } else {
        itemOrdersPlaced = this.state.inventory[this.props.date].hasOwnProperty(
          value.uuid
        )
          ? this.state.inventory[this.props.date][value.uuid]
          : 0;
      }
    }
    var itemInv = Math.max(0, value.quantity - itemOrdersPlaced);
    if (itemInv <= this.props.invThreshold) {
      showInventory = true;
    }

    // console.log("@@@@@ ITEM THRESHOLD");
    // console.log(this.props.date);
    // console.log(value.name);
    // console.log(value.uuid);
    // console.log(value.quantity);
    // console.log(itemOrdersPlaced);
    // console.log(this.state.inventory);
    // console.log(showInventory);
    // console.log(itemInv);

    var soldOutStyle = { opacity: 0.1 };
    var listItemStyles = [];
    var alertColor = { color: "red" };
    var alertText = "";

    listItemStyles.push(styles.listItem);

    if (itemInv == 0) {
      // Need to disable onPress and lower opacity of the items elements
      listItemStyles.push(soldOutStyle);
      alertText = localization.soldOut;
      alertColor.color = "black";
    } else if (showInventory) {
      // Show low inventory alert
      alertText = this.props.settings.language == this.props.settings.chineseAbbr ?
      `${localization.almostSoldOut} ${itemInv}${localization.orderSoon}` :
      `${itemInv} ${localization.almostSoldOut}`;
    } else {
      // Display normal item row
    }

    return (
      <ListItem style={listItemStyles} key={key}>
        <FastImage
          style={styles.previewImage}
          source={{
            uri: value.imgUrl,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View
          style={{
            flex: 2,
            flexDirection: "column",
            alignContent: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <View style={{ flexDirection: "row", paddingLeft: 10 }}>
            <Text style={styles.itemName}>{value.name}</Text>
          </View>
          <View style={{ flexDirection: "row", paddingLeft: 10 }}>
            <Text style={styles.itemPrice}>
              {"\u0024"}
              {value.price.toFixed(2)}
            </Text>
            <View style={styles.itemSelection}>
              {value.customizationOn ? (
                <TouchableOpacity
                  style={styles.customizeButton}
                  onPress={() => {
                    if (itemInv != 0) {
                      this.props.navigation.navigate("CustomizeOrder", {
                        itemInfo: value,
                        editOrder: false,

                        alertColor: alertColor,
                      });
                    }
                  }}
                >
                  <Text style={styles.customizeText}>{localization.customize}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      if (itemInv != 0) {
                        removeItemsFromCart(value);
                      }
                    }}
                  >
                    <Icon size={25} name="ios-remove-circle-outline" />
                  </TouchableOpacity>
                  <Text style={{ paddingHorizontal: 8 }}>
                    {this._getIQOrdered(value.uuid)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (itemInv != 0) {
                        addItemsToCart(value, itemInv);
                      }
                    }}
                  >
                    <Icon size={25} name="ios-add-circle-outline" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {showInventory && (
            <View style={{ flexDirection: "row", paddingLeft: 10 }}>
              <Text style={alertColor}>{alertText}</Text>
            </View>
          )}
        </View>
      </ListItem>
    );
  };

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <View style={styles.secBox}>
            <ClientSchedulerStrip
              ref={(ref) => (this.calendar = ref)}
              kitchenId={this.props.navigation.state.params.uuid}
            />
          </View>

          <View style={styles.secBox}>
            {this.state.schedulePicker && (
              <View>
                <View style={styles.scheduleToggle}>
                  <Text style={styles.header}>{localization.schedule}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      this._toggleSchedulePicker();
                    }}
                  >
                    <Icon size={30} name="ios-arrow-dropup-circle" />
                  </TouchableOpacity>
                </View>
                <View style={styles.schedulePicker}>
                  <SchedulePicker
                    kitchenId={this.kitchenId}
                    navigation={this.props.navigation}
                  />
                </View>
              </View>
            )}
            {!this.state.schedulePicker && (
              <View style={styles.scheduleToggle}>
                <Text style={styles.header}>{localization.schedule}...</Text>
                <TouchableOpacity
                  onPress={() => {
                    this._toggleSchedulePicker();
                  }}
                >
                  <Icon size={30} name="ios-arrow-dropdown-circle" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.secBox}>
            <Text style={styles.header}>{localization.food}</Text>
            <List style={styles.secColor}>
              {this.state.foodItems.map((value, key) =>
                this._getItem(
                  value,
                  key,
                  this._addItemsToFoodCart,
                  this._removeItemsFromFoodCart
                )
              )}
            </List>
          </View>

          <View style={styles.secBox}>
            <Text style={styles.header}>{localization.drinks}</Text>
            <List>
              {this.state.drinkItems.map((value, key) =>
                this._getItem(
                  value,
                  key,
                  this._addItemsToDrinkCart,
                  this._removeItemsFromDrinkCart
                )
              )}
            </List>
          </View>
        </Content>
        <Footer>
          <FooterTab>
            <CartBar
              navigation={this.props.navigation}
              foodItems={this.state.foodItems}
              drinkItems={this.state.drinkItems}
            />
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    invThreshold: state.order.showInventoryCutoff,
    items: state.order.items,
    date: state.order.delivery.date,
    settings: state.settings
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addItemToCart: (product) =>
      dispatch({
        type: "ADD_TO_CART",
        payload: product,
      }),
    removeItemFromCart: (product) =>
      dispatch({
        type: "REMOVE_FROM_CART",
        payload: product,
      }),
    eraseCart: () =>
      dispatch({
        type: "ERASE_CART",
      }),
    updateInventory: (inventory) =>
      dispatch({
        type: "UPDATE_INVENTORY",
        payload: inventory,
      }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KitchenScreen);

const styles = StyleSheet.create({
  contentContainer: {
    // paddingHorizontal: 10,
    flexGrow: 1,
    backgroundColor: colors.bgColor,
  },
  mainTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30,
  },
  itemName: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    fontWeight: "bold",
  },
  customizeText: { color: "white", fontSize: 12 },
  header: { fontSize: 20, fontWeight: "bold" },
  itemPrice: { flex: 1 },
  itemSelection: { flex: 1, alignItems: "flex-end" },
  subTitle: {
    paddingTop: 25,
    fontWeight: "bold",
  },

  secBox: {
    paddingTop: 10,
    paddingLeft: 5,
    marginBottom: 15,
    backgroundColor: colors.secColor,
  },
  secColor: {
    backgroundColor: colors.secColor,
  },
  menuItem: {
    paddingTop: 5,
  },
  schedulePicker: {
    flex: 1,
    margin: 15,
    backgroundColor: colors.secColor,
    borderRadius: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quantityContainer: {
    flexDirection: "row",
  },
  customizeButton: {
    padding: 2,
    paddingHorizontal: 4,
    backgroundColor: "black",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scheduleToggle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 15,
  },
  footerTab: {
    flexDirection: "row",
    flexGrow: 1,
  },
  previewImage: {
    flex: 1,
    width: 100,
    height: 100,
    marginLeft: -10,
    borderRadius: 5,
  },
});
