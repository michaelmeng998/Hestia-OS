import React from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Image,
  Alert,
  TouchableOpacity
} from "react-native";
import {
  Button,
  CheckBox,
  Container,
  Content,
  List,
  ListItem,
  Text,
  Icon
} from "native-base";
import Divider from "react-native-divider";
import Dialog from "react-native-dialog";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";
import { connect } from 'react-redux';

class ManageMenu extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.manageMenu
        : navigation.state.params.title
  });

  constructor(props) {
    super(props);
    this.state = {
      foodItems: [],
      drinkItems: [],
      mode: null,
      modalVisible: false,
      modalDescription: "Add Item Name",
      modalStage: "stage0",
      addType: "food",
      tempInput: null,
      inputLabel: null,
      itemName: null,
      itemPrice: null,
      itemQuantity: null,
      imgUri: ""
    };
    this.unsubscribe_food_items = null;
    this.unsubscribe_drink_items = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.manageMenu });
    }
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;
    this.merchant_food_items = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection("food_items");
    this.merchant_drink_items = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection("drink_items");
    //unsubscribe functions
    this.unsubscribe_food_items = this.merchant_food_items.onSnapshot(
      this._onCollectionUpdateFood
    );
    this.unsubscribe_drink_items = this.merchant_drink_items.onSnapshot(
      this._onCollectionUpdateDrink
    );
  }

  componentWillUnmount() {
    this.unsubscribe_food_items();
    this.unsubscribe_drink_items();
  }

  //Function used for pushing items to FB databases
  _onCollectionUpdateFood = querySnapshot => {
    const food_items = [];
    querySnapshot.forEach(doc => {
      const {
        imgUrl,
        active,
        name,
        price,
        quantity,
        customizationOn,
        customizations,
        recipe
      } = doc.data();
      const uuid = doc.id;
      const switchValue = false;
      const itemID = firebase
        .firestore()
        .collection("merchants")
        .doc(this.merchant_id)
        .collection("food_items")
        .doc(uuid);
      food_items.push({
        imgUrl: imgUrl,
        itemID: itemID,
        uuid: uuid,
        switchValue: switchValue,
        active: active,
        name: name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        customizationOn: customizationOn,
        customizations: customizations,
        itemRecipe: recipe
      });

      this.setState({
        foodItems: food_items
      });
    });
  };

  _onCollectionUpdateDrink = querySnapshot => {
    const drink_items = [];
    querySnapshot.forEach(doc => {
      const {
        imgUrl,
        active,
        name,
        price,
        quantity,
        customizationOn,
        customizations,
        recipe
      } = doc.data();
      const uuid = doc.id;
      const switchValue = true;
      const itemID = firebase
        .firestore()
        .collection("merchants")
        .doc(this.merchant_id)
        .collection("drink_items")
        .doc(uuid);
      drink_items.push({
        imgUrl: imgUrl,
        itemID: itemID,
        uuid: uuid,
        switchValue: switchValue,
        active: active,
        name: name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        customizationOn: customizationOn,
        customizations: customizations,
        itemRecipe: recipe
      });

      this.setState({
        drinkItems: drink_items
      });
    });
  };

  // ======= FUNCTIONS TO HANDLE EVENTS =======

  _handleCancel() {
    this.setState({
      modalStage: "stage0",
      modalDescription: "Add Item Name",
      tempInput: null,
      itemName: null,
      itemPrice: null,
      modalVisible: false
    });
  }

  _handleSubmit() {
    if (this.state.modalStage === "stage0") {
      this.setState({
        modalDescription: "Add Item Price",
        itemName: this.state.tempInput,
        modalStage: "stage1"
      });

      this.setState({
        tempInput: null
      });
    }

    if (this.state.modalStage === "stage1") {
      if (this.state.addType === "food") {
        this.merchant_food_items.add({
          active: true,
          name: this.state.itemName.trim(),
          price: parseFloat(this.state.tempInput.trim())
        });
      } else {
        this.merchant_drink_items.add({
          active: true,
          name: this.state.itemName.trim(),
          price: parseFloat(this.state.tempInput.trim())
        });
      }

      this.setState({
        itemName: null,
        itemPrice: null,
        itemQuantity: null,
        modalDescription: "Add Item Name",
        modalVisible: false,
        modalStage: "stage0",
        tempInput: null
      });
    }
  }

  _handleToggle(value) {
    arraySize = this.state.foodItems.length;
    for (i = 0; i < arraySize; i++) {
      if (value.name === this.state.foodItems[i].name) {
        this.merchant_food_items.doc(value.uuid).update({
          active: !this.state.foodItems[i].active
        });
        return;
      }
    }

    arraySize = this.state.drinkItems.length;
    for (i = 0; i < arraySize; i++) {
      if (value.name === this.state.drinkItems[i].name) {
        this.merchant_drink_items.doc(value.uuid).update({
          active: !this.state.drinkItems[i].active
        });
        return;
      }
    }
  }

  // ====== FUNCTIONS FOR REMOVING ITEMS ======

  _removeImageFromDB(value) {
    //Return if the item has no image stored in the firebase storage DB
    if (value.imgUrl == "") {
      return;
    }
    console.log("deleted images url is: " + value.imgUrl);
    imageRef = firebase.storage().refFromURL(value.imgUrl);

    // Delete the file
    imageRef
      .delete()
      .then(function() {
        console.log("image deleted from firebase storage");
      })
      .catch(function(error) {
        console.log("Error deleting image from firebase storage: ", error);
      });
  }

  _removeItem(value) {
    if (
      this.state.foodItems.find(item => item.uuid === value.uuid) !== undefined
    ) {
      newFoodItems = this.state.foodItems.filter(
        item => item.uuid !== value.uuid
      );
      this.setState({ foodItems: newFoodItems });

      //Delete item in firestore document collection
      this.merchant_food_items.doc(value.uuid).delete();

      //Delete image in firebase storage
      this._removeImageFromDB(value);

      return;
    }

    if (
      this.state.drinkItems.find(item => item.uuid === value.uuid) !== undefined
    ) {
      newDrinkItems = this.state.drinkItems.filter(
        item => item.uuid !== value.uuid
      );
      //resetting current state of drinkItems
      this.setState({ drinkItems: newDrinkItems });

      //Delete item in firestore document collection
      this.merchant_drink_items.doc(value.uuid).delete();

      //Delete image in firebase storage
      this._removeImageFromDB(value);

      return;
    }
  }

  _confirmRemove(value) {
    Alert.alert(
      localization.remove,
      value.name,
      [
        {
          text: localization.cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: localization.ok, onPress: () => this._removeItem(value) }
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-evenly",
              paddingTop: 5
            }}
          >
            <Button
              onPress={() => this.props.navigation.navigate("AddItems")}
              style={styles.addItemButton}
            >
              <Text>{localization.addItems}</Text>
            </Button>
            {this.state.mode !== "remove" ? (
              <Button
                onPress={() => this.setState({ mode: "remove" })}
                style={styles.removeItemButton}
              >
                <Text>{localization.removeItems}</Text>
              </Button>
            ) : (
              <Button
                rounded
                onPress={() => this.setState({ mode: "normal" })}
                style={styles.removeItemButton}
              >
                <Text>{localization.finish}</Text>
              </Button>
            )}
          </View>
          <View style={{ marginTop: 20 }} />

          <Divider borderColor="#000" color="#000" orientation="center">
            Food
          </Divider>
          <List>
            {this.state.foodItems.map((value, key) => (
              <ListItem key={key}>
                {this.state.mode !== "remove" ? (
                  <CheckBox
                    checked={value.active}
                    onPress={() => this._handleToggle(value)}
                  />
                ) : (
                  <Icon
                    size={25}
                    color={"#ff0000"}
                    name="ios-close-circle"
                    onPress={() => this._confirmRemove(value)}
                  />
                )}
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("EditItems", {
                      itemInfo: value
                    })
                  }
                  style={styles.listItem}
                >
                  <Text style={styles.itemName}>{value.name}</Text>
                  <Text style={styles.itemPrice}>x {value.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {"\u0024"}
                    {value.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </ListItem>
            ))}
          </List>

          <Divider borderColor="#000" color="#000" orientation="center">
            Drinks
          </Divider>
          <List style={{ paddingBottom: 30 }}>
            {this.state.drinkItems.map((value, key) => (
              <ListItem key={key}>
                {this.state.mode !== "remove" ? (
                  <CheckBox
                    checked={value.active}
                    onPress={() => this._handleToggle(value)}
                  />
                ) : (
                  <Icon
                    name="ios-close-circle"
                    size={25}
                    color="#ff0000"
                    onPress={() => this._confirmRemove(value)}
                  />
                )}
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("EditItems", {
                      itemInfo: value
                    })
                  }
                  style={styles.listItem}
                >
                  <Text style={styles.itemName}>{value.name}</Text>
                  <Text style={styles.itemPrice}>x {value.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {"\u0024"}
                    {value.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </ListItem>
            ))}
          </List>
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

export default connect(mapStateToProps, null)(ManageMenu);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20
  },
  buttonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  manageImagesButton: {
    backgroundColor: "#000"
  },
  addItemButton: {
    justifyContent: "center",
    width: 150,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000"
  },
  removeItemButton: {
    justifyContent: "center",
    width: 150,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff0000"
  },
  foodHeader: {
    flex: 1,
    flexDirection: "row",
    marginTop: 15
  },
  listItem: {
    marginLeft: 6,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  itemName: {
    flex: 2,
    flexWrap: "wrap"
  },
  itemPrice: {
    flex: 1
  }
});
