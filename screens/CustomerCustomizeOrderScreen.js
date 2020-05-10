import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity
} from "react-native";

import {
  Button,
  Container,
  CheckBox,
  Content,
  Footer,
  FooterTab,
  List,
  ListItem,
  Text,
  Input
} from "native-base";
import FastImage from "react-native-fast-image";
import Icon from "react-native-vector-icons/Ionicons";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import localization from '../constants/Localization';
import _ from 'lodash';

// Make a copy of cutoffInfo before passing it in
const shouldShowOrderCutoff = (cutoffInfo, date, inventory, itemEdit, invThreshold, isChinese) => {   
  var activeOrders = inventory.hasOwnProperty(date); 
  if (activeOrders) {
    // Need to account for items with customizationOn
    // this.state.itemEdit.customizationOn
    if (itemEdit.customizationOn) {
      for (var uuid in inventory[date]) {
        if (uuid.includes(itemEdit.uuid)) {
          cutoffInfo.itemInv += inventory[date][uuid];
        }
      }
    } else {

      cutoffInfo.itemInv = inventory[date].hasOwnProperty(itemEdit.uuid) ? 
      inventory[date][itemEdit.uuid] : 0;
    }
  }
  cutoffInfo.itemInv = Math.max(0, itemEdit.quantity - cutoffInfo.itemInv);
  if (cutoffInfo.itemInv <= invThreshold) {
    cutoffInfo.showInventory = true;
  }

  if (cutoffInfo.itemInv == 0) {
    // Need to disable onPress and lower opacity of the items elements
    cutoffInfo.alertText = localization.soldOut;
  } else if (cutoffInfo.showInventory) {
    // Show low inventory alert
    cutoffInfo.alertText = isChinese ? `${localization.almostSoldOut} ${cutoffInfo.itemInv}${localization.orderSoon}` : `${cutoffInfo.itemInv} ${localization.almostSoldOut}`;
  } else {
    // Display normal item row
  }
  return cutoffInfo.showInventory;
}

// export default
class CustomizeOrderScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: `${localization.settings}`,
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.customize
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);

    // Criteria/Info to prepopulate customize screen
    this.editOrder = this.props.navigation.state.params.editOrder ? true : false;
    this.order = _.cloneDeep(this.props.navigation.state.params.order);
    this.prevUuid = this.editOrder ? this.order.uuid : null;
    this.itemsIndex = this.props.navigation.state.params.itemsIndex;

    this.cutoffInfo = {
      "showInventory": false,
      "itemInv": 0,
      "alertText": ""
    }
    this.itemEditClone = _.cloneDeep(props.navigation.state.params.itemInfo);
    let isChinese = this.props.settings.language == this.props.settings.chineseAbbr;
    shouldShowOrderCutoff(this.cutoffInfo, this.props.date, this.props.inventory, this.itemEditClone, this.props.invThreshold, isChinese);

    // Calc current cart quantity for item
    this.currItemCartQ = 0;
    this.props.items.forEach(item => {
      if (item.uuid.includes(this.itemEditClone.uuid)) {
        this.currItemCartQ += item.quantity;
      }
    });
    this.currItemCartQHeader = this.currItemCartQ;
    // To accout for edit of a current order
    if (this.editOrder) {
      this.currItemCartQ -= this.order.quantity;
    }

    this.state = {
      itemEdit: this.itemEditClone,
      itemImage: null,
      itemRecipe: null,
      itemName: null,
      itemPrice: null,
      totalPrice: this.editOrder ? (this.order.price * this.order.quantity) : null,
      optionPrice: null,
      customizations: [],
      order: this.editOrder ? this.order : {},
      customizationPickerVisible: false,
      quantity: this.editOrder ? this.order.quantity : 1,
      orderRequirementMet: this.editOrder ? true : false,

      cutoffInfo: this.cutoffInfo,
      date: this.props.date,
      inventory: this.props.inventory
    };

    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;

    // For realtime updates, use store to calc available inventory once again for the item
    this.alertColor = { color: "red" };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cutoffInfo.showInventory !== this.state.cutoffInfo.showInventory ||
        prevState.cutoffInfo.itemInv !== this.state.cutoffInfo.itemInv) {
          // re-render component
          this.setState({});
    }
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.settings });
    }
  }

  // componentDidMount() {
  // } 
  static getDerivedStateFromProps(nextProps, prevState){
    var newCuttOffInfo = {
      "showInventory": false,
      "itemInv": 0,
      "alertText": ""
    };
    shouldShowOrderCutoff(newCuttOffInfo, nextProps.date, nextProps.inventory, nextProps.navigation.state.params.itemInfo, nextProps.invThreshold);
    // check for cutOffInfo diff and update state
    if(newCuttOffInfo.showInventory !== prevState.cutoffInfo.showInventory || 
      newCuttOffInfo.itemInv !== prevState.cutoffInfo.itemInv){
      return {cutoffInfo: newCuttOffInfo};
    }
    else return null;
  } 

  _removeItem = value => {
    if (value > 1) {
      let order = this.state.order;
      const quantity = value - 1;
      const totalPrice = quantity * order.price;

      order.quantity = quantity;

      this.setState({
        quantity: quantity,
        totalPrice: totalPrice,
        order: order
      });
    }
    return;
  };

  _addItem = value => {
    if (this.state.cutoffInfo.showInventory && (value + this.currItemCartQ) >= this.state.cutoffInfo.itemInv) {
      return;
    }
    let order = this.state.order;
    const quantity = value + 1;
    const totalPrice = quantity * order.price;
    order.quantity = quantity;
    this.setState({
      quantity: quantity,
      totalPrice: totalPrice,
      order: order
    });
  };

  _handleToggle(value) {
    //Activate checkbox
    const optionArray = [...this.state.customizations];
    const optionArrayHolder =
      optionArray[headerIndex].headerOptions[optionIndex];
    optionArrayHolder.active = !optionArrayHolder.active;

    //Unchecking boxes
    let optionArraySize = optionArray[headerIndex].headerOptions.length;
    for (i = 0; i < optionArraySize; i++) {
      if (value.id !== optionArray[headerIndex].headerOptions[i].id) {
        let otherOptions = optionArray[headerIndex].headerOptions[i];
        otherOptions.active = false;        
      }
    }
    this.setState({ customizations: optionArray });

    //Building customization chart for the order
    const customization = [];
    let optionPrice = 0;
    let itemPrice = parseFloat(this.state.itemPrice);
    let totalPrice = 0;
    let quantity = this.state.quantity;
    let optionName = "";
    const customizationSize = optionArray.length;
    let counter = 0;
    let checker = null;
    for (i = 0; i < customizationSize; i++) {
      optionArray[i].headerOptions.forEach(function(v) {
        v.active === true
          ? (counter++,
            customization.push({
              headerName: optionArray[i].headerName,
              optionName: v.optionName,
              optionPrice: parseFloat(v.optionPrice).toFixed(2)
            }),
            (optionPrice = optionPrice + parseFloat(v.optionPrice)).toFixed(2),
            (totalPrice = quantity * (itemPrice + optionPrice)),
            (optionName = optionName + v.optionName)) //creating unique uuid
          : v;
      });
      //Checking all selections has been made
      if (counter == customizationSize) {
        checker = true;
      } else {
        checker = false;
      }
    }

    order = {
      uuid: this.state.itemEdit.uuid + optionName,
      active: this.state.itemEdit.active,
      name: this.state.itemName,
      price: itemPrice + optionPrice,
      itemPrice: this.state.itemPrice,
      customizationOn: this.state.itemEdit.customizationOn,
      customization: customization,
      quantity: this.state.quantity
    };

    this.setState({
      order: order,
      optionPrice: optionPrice,
      customizations: optionArray,
      totalPrice: totalPrice,
      orderRequirementMet: checker
    });
  }

  _handleSubmit() {
    if (this.editOrder) {
      let newOrder = _.cloneDeep(this.state.order);
      newOrder.prevUuid = this.prevUuid;
      this.props.updateCustomItemToCart(newOrder); 
      this.props.navigation.navigate("Cart");
    } else {
     this.props.addCustomItemToCart(this.state.order); 
     this.props.navigation.navigate("Kitchen");
    }
  }

  _removeItemFromCart = () => {
    this.props.removeCustomItemFromCart(this.state.order);
    this.props.navigation.navigate("Cart");
  }

  _toggleCustomizationPicker(value) {
    const customizations = [...this.state.customizations];
    for (i = 0; i < customizations.length; i++) {
      if (value.id == customizations[i].id) {
        customizations[i].picker = !customizations[i].picker;
      }
      this.setState({ customizations: customizations });
    }
  }

  componentDidMount() {
    
    const customizations = _.cloneDeep(this.state.itemEdit.customizations);
 
    customizations.map(header => {
      header.picker = true; //setup dropdown UI for option headers
    });

    // If transition from cart, check appropriate customizations
    if (this.editOrder) {
      this.state.order.customization.forEach(custom => {
        
        let i = customizations.findIndex(header =>
          custom.headerName === header.headerName
        );
        if (i != -1) {
          let j = customizations[i].headerOptions.findIndex(option =>
            custom.optionName === option.optionName
          );
          if (j != -1) {
            customizations[i].headerOptions[j].active = true;
          }
        }
      });
    } else {
      customizations.map(header => {
        header.picker = true; //setup dropdown UI for option headers
        header.headerOptions.map(options => {
          options.active = false; //temporary solution to remove all previously checked checkboxes, need to find out why checkbox toggle writes into itemEdit state
        });
      });
    }

    this.customer_orders = firebase
      .firestore()
      .collection("customers")
      .doc(this.customer_id)
      .collection("orders");

    this.setState({
      itemImage: this.state.itemEdit.imgUrl,
      itemRecipe: this.state.itemEdit.recipe,
      itemName: this.state.itemEdit.name,
      itemPrice: parseFloat(this.state.itemEdit.price).toFixed(2),
      totalPrice: this.editOrder ? this.state.totalPrice : parseFloat(this.state.itemEdit.price).toFixed(2),
      customizations: customizations
    });
  }

  render() {
    
    return (
      <Container>
        <FastImage
          style={styles.previewImage}
          source={{
            uri: this.state.itemImage,
            priority: FastImage.priority.normal
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Content contentContainerStyle={styles.contentContainer}>
          <View style={styles.headingBar}>
            <Text style={{ fontSize: 25 }}>{this.state.itemName}</Text>
            { this.state.cutoffInfo.showInventory &&
              <Text style={[{ fontSize: 15 }, this.alertColor]}>{this.state.cutoffInfo.alertText}</Text>
            }
            <Text>{`${localization.qInCart} ${this.currItemCartQHeader}`}</Text>
            <Text style={{ fontSize: 25 }}>{localization.recipeHeader}</Text>
            <Text style={{ fontSize: 15, marginHorizontal: 5, color: "gray" }}>
              {this.state.itemRecipe}
            </Text>
            <Text style={{ fontSize: 20 }}>
              {"\u0024"}
              {this.state.itemPrice}
            </Text>
            <List style={{ marginTop: 10 }}>
              {/* <Text style={{ fontSize: 15 }}>Customizations</Text> */}
              <View flexDirection="row" style={{ marginTop: 10 }} />
              {this.state.customizations.map((header, headerKey) => {
                return (
                  <View key={header.id}>
                    <TouchableOpacity
                      onPress={() => {
                        this._toggleCustomizationPicker(header);
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 10,
                          marginBottom: 10,
                          marginRight: 10,
                          marginLeft: 2
                        }}
                      >
                        <Text>{header.headerName}</Text>
                        {!header.picker && (
                          <Icon size={20} name="ios-arrow-dropdown-circle" />
                        )}
                        {header.picker && (
                          <Icon size={20} name="ios-arrow-dropup-circle" />
                        )}
                      </View>
                    </TouchableOpacity>
                    {header.picker && (
                      <View>
                        {header.headerOptions.map((option, optionKey) => {
                          return (
                            <View key={option.id}>
                              <Button
                                style={styles.customizationView}
                                onPress={() => {
                                  headerIndex = headerKey;
                                  optionIndex = optionKey;
                                  this._handleToggle(option);
                                }}
                              >
                                <CheckBox
                                  color="black"
                                  checked={option.active}
                                  onPress={() => {
                                    headerIndex = headerKey;
                                    optionIndex = optionKey;
                                    this._handleToggle(option);
                                  }}
                                />
                                <Text style={styles.customizationItems}>
                                  {option.optionName}
                                </Text>

                                <Text style={{ flex: 1, color: "black" }}>
                                  {"\u0024"}
                                  {parseFloat(option.optionPrice).toFixed(2)}
                                </Text>
                              </Button>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </List>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => {
                  this._removeItem(this.state.quantity);
                }}
              >
                <Icon size={30} name="ios-remove-circle-outline" />
              </TouchableOpacity>
              <Text style={{ paddingHorizontal: 20 }}>
                {this.state.quantity}
              </Text>
              <TouchableOpacity
                onPress={() => this._addItem(this.state.quantity)}
              >
                <Icon size={30} name="ios-add-circle-outline" />
              </TouchableOpacity>
            </View>
            {this.state.orderRequirementMet && (this.state.cutoffInfo.itemInv > 0) && (this.currItemCartQ + this.state.quantity <= this.state.cutoffInfo.itemInv || !this.state.cutoffInfo.showInventory) ? (
              <Button
                justifyContent="center"
                backgroundColor="black"
                onPress={() => this._handleSubmit()}
              >
                <Text>
                  {`${localization.add} `}
                  {this.state.quantity} 
                  { this.props.settings.language == this.props.settings.englishAbbr && 
                  " to Cart"
                  }
                  {": "}
                  {"\u0024"}
                  {this.state.totalPrice}
                </Text>
              </Button>
            ) : (
              <Button justifyContent="center" disabled>
                <Text>
                  {`${localization.add} `}
                  {this.state.quantity} 
                  { this.props.settings.language == this.props.settings.englishAbbr && 
                  " to Cart"
                  }
                  {": "}
                  {"\u0024"}
                  {parseFloat(this.state.totalPrice).toFixed(2)}
                </Text>
              </Button>
            )}
            { this.editOrder &&
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 20
                }}
              >
                <Text style={styles.boldRed}>{localization.removeFromCart}</Text>
                <TouchableOpacity onPress={() => this._removeItemFromCart()}>
                  <Icon 
                    style={styles.boldRed} 
                    size={35} 
                    name="ios-trash">  
                  </Icon>
                </TouchableOpacity>
              </View>
            }
          </View>
        </Content>
        {/* <Footer>
          <FooterTab>
            <CartBar navigation={this.props.navigation} />
          </FooterTab>
        </Footer> */}
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    items: state.order.items,
    inventory: state.order.inventory,
    date: state.order.delivery.date,
    invThreshold: state.order.showInventoryCutoff,
    settings: state.settings
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addCustomItemToCart: product =>
      dispatch({
        type: "ADD_CUSTOM_ITEM_TO_CART",
        payload: product
      }),
    updateCustomItemToCart: product =>
      dispatch({
        type: "UPDATE_CUSTOM_ITEM_TO_CART",
        payload: product
      }),
    removeCustomItemFromCart: product =>
      dispatch({
        type: "REMOVE_CUSTOM_ITEM_FROM_CART",
        payload: product
      }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomizeOrderScreen);

const styles = StyleSheet.create({
  contentContainer: {
    // paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    flexGrow: 1
  },
  mainTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30
  },
  subTitle: {
    paddingTop: 25,
    fontWeight: "bold"
  },

  headingBar: {
    paddingTop: 10,
    flexDirection: "column"
  },
  menuItem: {
    paddingTop: 5
  },

  quantityContainer: {
    padding: 5,
    margin: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },

  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  customizationItems: { flex: 3, color: "black" },
  footerTab: {
    flexDirection: "row",
    flexGrow: 1
  },
  customizationView: {
    flex: 1,
    flexDirection: "row",
    alignContent: "space-between",
    backgroundColor: "white",
    marginLeft: "5%",
    overflow: "scroll"
  },
  previewImage: { width: null, height: 200 },
  boldRed: {
    color: 'red', 
    fontWeight: "bold"
  }
});
