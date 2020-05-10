import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Container, Content, Text, Input, Item, Label } from "native-base";
import firebase, { Firebase } from "react-native-firebase";
import Icon from "react-native-vector-icons/Ionicons";
import localization from "../constants/Localization";
import FastImage from "react-native-fast-image";
import { connect } from "react-redux";

import { NavigationEvents } from "react-navigation";

class ManageKitchenImagesScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.imageGallery
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.state = {
      minOrderValue: 0,
      errorMinOrderValue: null,
      hasErrorMinOrderValue: true,
      errorDeliveryFee: null,
      hasErrorDeliveryFee: true,
      deliveryFee: 0,
      profile: [],
      items: [],
      limitReached: false,
      numColumns: 3,
      displayHeight: 150,
    };

    this.unsubscribe_images = null;

    this.props.navigation.setParams({ title: localization.imageGallery });
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;
    this.merchant_doc = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id);
    this.food_items = this.merchant_doc.collection("food_items");
    this.drink_items = this.merchant_doc.collection("drink_items");
    this.unsubscribe_food_items = this.food_items.onSnapshot(
      this._onCollectionUpdateFoodItems
    );
    this.unsubscribe_drink_items = this.drink_items.onSnapshot(
      this._onCollectionUpdateDrinkItems
    );
    this.unsubscribe_profile = this.merchant_doc.onSnapshot(
      this._onCollectionUpdateProfile
    );
  }

  componentWillUnmount() {
    this.unsubscribe_food_items();
    this.unsubscribe_drink_items();
    this.unsubscribe_profile();
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.manageImages });
    }
    if (
      this.state.hasErrorDeliveryFee === false &&
      this.state.hasErrorMinOrderValue === false
    ) {
      const items = this.state.items;
      const displayPictures = [];
      for (i = 0; i < items.length; i++) {
        if (items[i].itemID) {
          //Updating item status to ensure pictures already showcased does not display in the pool in next render
          items[i].itemID.update({ homeDisplay: items[i].homeDisplay });
          if (items[i].homeDisplay) {
            //Only adding images to DB to reduce DB writes
            displayPictures.push({ imgUrl: items[i].imgUrl });
          }
        }
      }
      //Write directly to merchant profile doc for easier client side read
      this.merchant_doc.update({
        displayPictures: displayPictures.reverse(),
        minOrderValue: this.state.minOrderValue,
        deliveryFee: this.state.deliveryFee,
      });
      Alert.alert("Changes Applied!");
      this.setState({
        errorMinOrderValue: null,
        hasErrorMinOrderValue: true,
        errorDeliveryFee: null,
        hasErrorDeliveryFee: true,
      });
    }
  }

  //Function to push from firebase
  _onCollectionUpdateImages(dbRef) {
    const image_items = [];
    dbPromise = dbRef.get();

    dbPromise.then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        image_items.push({
          uuid: doc.id,
          active: doc.data().active,
          imageUrl: doc.data().name,
        });
        this.setState({ images: image_items, galleryLoaded: true });
      });
    });
  }

  _onCollectionUpdateProfile = (DocumentSnapshot) => {
    var profile = DocumentSnapshot.data();
    let items = "";
    const foodItems = this.state.foodItems;
    const drinkItems = this.state.drinkItems;
    //Creating aggregated pool of pictures for easier rendering and handling
    if (foodItems || drinkItems) {
      items = foodItems.concat(drinkItems);
    }
    for (i = 0; i < items.length; i++) {
      if (!items[i]) {
        items.splice(i, 1);
      }
    }
    const displayPictures = [];
    for (i = 0; i < items.length; i++) {
      if (items[i].homeDisplay) {
        //Only adding images to DB to reduce DB writes
        displayPictures.push({ imgUrl: items[i].imgUrl });
      }
    }
    profile.displayPictures = displayPictures;
    if (
      profile.minOrderValue == null ||
      profile.minOrderValue == "" ||
      profile.minOrderValue == undefined
    ) {
      this.setState({ minOrderValue: 0 });
    } else {
      this.setState({ minOrderValue: profile.minOrderValue });
    }
    if (
      profile.deliveryFee == null ||
      profile.deliveryFee == "" ||
      profile.deliveryFee == undefined
    ) {
      this.setState({ deliveryFee: 0 });
    } else {
      this.setState({ deliveryFee: profile.deliveryFee });
    }

    this.setState({ profile: profile, items: items });
    this._displayFormat();
  };

  _onCollectionUpdateFoodItems = (querySnapshot) => {
    const foodItems = [];
    querySnapshot.forEach((doc) => {
      let { imgUrl, active, name, price, homeDisplay } = doc.data();
      const uuid = doc.id;
      const itemID = firebase
        .firestore()
        .collection("merchants")
        .doc(this.merchant_id)
        .collection("food_items")
        .doc(uuid);
      if (active && imgUrl != "" && imgUrl != null) {
        foodItems.push({
          itemID: itemID,
          imgUrl: imgUrl,
          uuid: uuid,
          name: name,
          price: price,
          homeDisplay: homeDisplay,
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
      let { imgUrl, active, name, price, homeDisplay } = doc.data();
      const uuid = doc.id;
      const itemID = firebase
        .firestore()
        .collection("merchants")
        .doc(this.merchant_id)
        .collection("drink_items")
        .doc(uuid);
      if (active && imgUrl != "" && imgUrl != null) {
        drinkItems.push({
          itemID: itemID,
          imgUrl: imgUrl,
          uuid: uuid,
          name: name,
          price: price,
          homeDisplay: homeDisplay,
        });
      }
    });
    this.setState({ drinkItems: drinkItems });
  };

  _displayFormat() {
    let displayHeight = this.state.displayHeight;
    const profile = this.state.profile;
    const displayPictures = [];
    //Adjusting picture display format based on number of pictures
    //Need to check if displayPictures is undefined otherwise app will crash
    if (profile.displayPictures) {
      const arrayLength = profile.displayPictures.length;
      // Recreating a displayPictures to change display format based on image count
      for (i = 0; i < arrayLength; i++) {
        if (profile.displayPictures[i].imgUrl) {
          displayPictures.push({ imgUrl: profile.displayPictures[i].imgUrl });
        }
      }
      if (displayPictures.length > 1 && displayPictures.length < 3) {
        displayHeight = 150;
      }
      if (displayPictures.length >= 3) {
        displayHeight = 100;
      }
    } else {
      console.log(false);
    }
    // Restrict showcase images to 6
    if (displayPictures.length >= 6) {
      this.setState({ limitReached: true });
    } else {
      this.setState({ limitReached: false });
    }
    this.setState({
      displayHeight: displayHeight,
      profile: profile,
    });
    this._formatData();
  }

  _handlePicturePoolToggle(uuid) {
    if (this.state.limitReached === false) {
      //Adding pictures to client side home screen
      const items = this.state.items;
      const profile = this.state.profile;
      const displayPictures = [];
      for (i = 0; i < items.length; i++) {
        if (uuid === items[i].uuid) {
          // Removing selected picture from pool
          items[i].homeDisplay = true;
        }
        if (items[i].homeDisplay === true) {
          // Adding selected picture to displayPicture pool
          displayPictures.push({ imgUrl: items[i].imgUrl });
        }
      }
      profile.displayPictures = displayPictures.reverse();
      this.setState({ items: items, profile: profile });
      this._displayFormat();
    }
  }
  _handleHomePictureToggle(imgUrl) {
    //Deleting pictures from client side home screen
    const profile = this.state.profile;
    const items = this.state.items;
    for (i = 0; i < profile.displayPictures.length; i++) {
      if (imgUrl === profile.displayPictures[i].imgUrl) {
        //Removing selected picture from display pictures
        profile.displayPictures.splice(i, 1);
      }
    }
    for (i = 0; i < items.length; i++) {
      if (imgUrl === items[i].imgUrl) {
        //Adding back selected picture back to pool
        items[i].homeDisplay = false;
      }
    }
    this.setState({ items: items, profile: profile });
    this._displayFormat();
  }
  _formatData() {
    const items = this.state.items;
    const profile = this.state.profile;
    const numColumns = this.state.numColumns;
    for (i = 0; i < items.length; i++) {
      if (!items[i].homeDisplay && !items[i].empty) {
        items[i].homeDisplay = false;
      }
    }
    // Creating empty space to sort Flatlist
    const numberofFullRows = Math.floor(items.length / numColumns);
    let numberOfElementsLastRow = items.length - numberofFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      items.push({ empty: true });
      numberOfElementsLastRow = numberOfElementsLastRow + 1;
    }
    // Sort pool to maintain images are always ahead and blanks are pushed to the end
    items.sort((a, b) => a.homeDisplay - b.homeDisplay);
    // Creating empty space to sort Flatlist
    if (profile.displayPictures) {
      if (profile.displayPictures.length >= 3) {
        const numberofDisplayFullRows = Math.floor(
          profile.displayPictures.length / numColumns
        );
        let numberOfDisplayElementsLastRow =
          profile.displayPictures.length - numberofDisplayFullRows * numColumns;
        while (
          numberOfDisplayElementsLastRow !== numColumns &&
          numberOfDisplayElementsLastRow !== 0
        ) {
          profile.displayPictures.push({
            empty: true,
          });
          numberOfDisplayElementsLastRow = numberOfDisplayElementsLastRow + 1;
        }
      }
    }
    this.setState({ profile: profile, items: items });
  }

  _handleSubmit() {
    //error handling for form fields
    var regexp = /^\d+(\.\d{1,2})?$/;
    if (!regexp.test(this.state.minOrderValue)) {
      this.setState({
        hasErrorMinOrderValue: true,
        errorMinOrderValue: localization.itemPriceError,
      });
    } else {
      this.setState({
        hasErrorMinOrderValue: false,
        errorMinOrderValue: "",
      });
    }
    if (!regexp.test(this.state.deliveryFee)) {
      this.setState({
        hasErrorDeliveryFee: true,
        errorDeliveryFee: localization.itemPriceError,
      });
    } else {
      this.setState({
        hasErrorDeliveryFee: false,
        errorDeliveryFee: "",
      });
    }
  }

  render() {
    return (
      <Container>
        <NavigationEvents onDidFocus={() => this.componentDidMount()} />
        <Content style={styles.contentContainer}>
          <View style={{ marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>{localization.storeFront}</Text>
              <TouchableOpacity
                onPress={() => this._handleSubmit()}
                style={{
                  marginHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  backgroundColor: "black",
                }}
              >
                <Text style={{ color: "white" }}>{localization.apply}</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Item style={{ marginVertica: -15 }}>
                <Label style={{ fontSize: 16, color: "black" }}>
                  {localization.minOrder}
                  {": $"}
                </Label>
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    this.setState({ minOrderValue: text })
                  }
                  value={this.state.minOrderValue.toString()}
                />
              </Item>
              {this.state.hasErrorMinOrderValue ? (
                <Text style={styles.errorMessage}>
                  {this.state.errorMinOrderValue}
                </Text>
              ) : null}
              <Item style={{ marginVertical: -15 }}>
                <Label style={{ fontSize: 16, color: "black" }}>
                  {localization.delivery}
                  {": $"}
                </Label>
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(text) => this.setState({ deliveryFee: text })}
                  value={this.state.deliveryFee.toString()}
                />
              </Item>
              {this.state.hasErrorDeliveryFee ? (
                <Text style={styles.errorMessage}>
                  {this.state.errorDeliveryFee}
                </Text>
              ) : null}
            </View>
          </View>
          <View
            style={{
              borderTopColor: "black",
              borderTopWidth: 1,
              borderBottomColor: "black",
              borderBottomWidth: 1,
              height: 275,
            }}
          >
            <View style={{ marginVertical: 10 }}>
              <Text style={{ color: "black", fontSize: 20, marginBottom: 5 }}>
                {this.state.profile.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  marginRight: 5,
                }}
              >
                <Text style={styles.infoFlair}>
                  {localization.minOrder}
                  {": $"}
                  {parseFloat(this.state.minOrderValue).toFixed(2)}
                </Text>
                <Text style={styles.infoFlair}>
                  {localization.delivery}
                  {": $"}
                  {parseFloat(this.state.deliveryFee).toFixed(2)}
                </Text>
              </View>
            </View>

            <FlatList
              //MUST INCLUDE extraData={this.state} or else component will not update its render!
              extraData={this.state}
              numColumns={this.state.numColumns}
              data={this.state.profile.displayPictures}
              keyExtractor={(item) => item.imgUrl}
              renderItem={({ item }) => {
                if (item.empty) {
                  return <View style={styles.itemInvisible} />;
                }
                return (
                  <View
                    style={{
                      flex: 1,
                      margin: 1,
                      borderWidth: 0.5,
                      borderColor: "black",
                      backgroundColor: "transparent",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        this._handleHomePictureToggle(item.imgUrl);
                      }}
                    >
                      <FastImage
                        style={{
                          flex: 1,
                          width: null,
                          height: this.state.displayHeight,
                        }}
                        source={{
                          uri: item.imgUrl,
                          priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
          <View style={{ paddingBottom: 30 }}>
            <Text style={{ fontSize: 20, marginVertical: 10 }}>
              {localization.uploadedPictures}
            </Text>
            <FlatList
              //MUST INCLUDE extraData={this.state} or else component will not update its render!
              extraData={this.state}
              numColumns={this.state.numColumns}
              data={this.state.items}
              keyExtractor={(item) => item.uuid}
              renderItem={({ item }) => {
                if (item.homeDisplay || item.empty) {
                  return <View style={styles.itemInvisible} />;
                }
                return (
                  <View style={styles.item}>
                    <TouchableOpacity
                      onPress={() => {
                        this._handlePicturePoolToggle(item.uuid);
                      }}
                    >
                      <FastImage
                        style={styles.previewImage}
                        source={{
                          uri: item.imgUrl,
                          priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    settings: state.settings,
  };
};

export default connect(
  mapStateToProps,
  null
)(ManageKitchenImagesScreen);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 50,
  },
  previewImage: { width: null, height: 100 },
  item: {
    flex: 1,
    margin: 1,
    borderWidth: 0.5,
    borderColor: "black",
  },
  infoFlair: {
    color: "#006400",
    marginRight: 5,
    fontSize: 12,
    borderWidth: 0.5,
    borderRadius: 20,
    padding: 5,
    backgroundColor: "#98FB98",
    borderColor: "#006400",
  },
  errorMessage: {
    flex: 1,
    flexDirection: "column",
    color: "red",
  },

  itemInvisible: { flex: 1, margin: 1, backgroundColor: "transparent" },
});
