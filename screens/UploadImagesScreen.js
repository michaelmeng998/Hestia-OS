import React, { useState, useEffect } from "react";
import { StyleSheet, Image, View } from "react-native";
import {
  Button,
  Container,
  Content,
  Form,
  Item,
  Label,
  Input,
  List,
  ListItem,
  Text
} from "native-base";
import Divider from "react-native-divider";

import firebase from "react-native-firebase";
import ImagePicker from "react-native-image-picker";
import uuid from "uuid/v4"; // Import UUID to generate UUID
import { Colors } from "react-native/Libraries/NewAppScreen";

import FastImage from "react-native-fast-image";
import localization from "../constants/Localization";
import { connect } from 'react-redux';

class UploadImagesScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.uploadImage
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.state = {
      imageUri: "",
      imgSource: "",
      counter: 0,
      images: "",
      uploading: false,
      imageChosen: false,
      errorSubmit: false,
      errorMessage: ""
    };
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;
    this.path = this.merchant_id + "/images/";
    this.options = {
      title: "Select Image"
    };
    //mounting componenets for merchant images
    this.merchant_images = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection("images");
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.uploadImage });
    }
  }

  //NOTE: need to change so either camera works or they must select from image gallery
  pickImage = () => {
    ImagePicker.showImagePicker(this.options, response => {
      if (response.didCancel) {
        console.log("You cancelled image picker 😟");
      } else if (response.error) {
        console.log(response.error);
      } else {
        const source = { uri: response.uri };
        console.log("Succesfully chosen image...");
        console.log(source);
        this.setState({
          imgSource: source,
          imageUri: response.uri,
          imageChosen: true
        });
        console.log(this.state);
      }
    });
  };
  //TODO: solve occasional "Possible Unhandled Promise", may be caused by big blobl of imageUri
  uploadImage = () => {
    if (this.state.imageChosen == false) {
      console.log("no image chosen...");
      this.setState({
        errorSubmit: true,
        errorMessage: "Must pick an image first"
      });
    } else {
      console.log("starting to store image...");
      let counter = this.state.counter;
      var ext = this.state.imageUri.replace(/[^a-zA-Z]/g, "").substr(-7, 5);
      const filename = `${uuid()}.${ext}`; // Generate unique name
      this.setState({ uploading: true });
      console.log("firebase pre upload");
      console.log(this.state);
      firebase
        .storage()
        .ref(`${filename}`)
        .putFile(this.state.imageUri)
        .on(
          firebase.storage.TaskEvent.STATE_CHANGED,
          snapshot => {
            let state = {};
            state = {
              ...state,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            // Calculate progress percentage

            console.log("writing state var");
            console.log(state);

            if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
              const getURL = snapshot.downloadURL;
              if (counter === 0) {
                this.merchant_images.add({
                  active: true,
                  name: getURL
                });
                counter = counter + 1;
              }
              //need to store download URL in realtime database, write function
            }

            this.setState({
              imageUri: "",
              imgSource: "",
              images: "",
              uploading: false,
              imageChosen: false,
              errorSubmit: false,
              errorMessage: ""
            });
            state = { progress: 0 };
          },
          error => {
            unsubscribe();
            alert("Sorry, Try again.");
          }
        );
      //now need to navigate back to image gallery ...
      this.props.navigation.navigate("ManageKitchenImages");
    }
  };

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <Divider borderColor="#000" color="#000" orientation="center">
            {localization.uploadImage}
          </Divider>
          <View style={styles.imageContainer}>
            <Image source={this.state.imgSource} style={styles.previewImage} />
          </View>

          {this.state.errorSubmit ? (
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
          ) : null}

          <Button block onPress={this.pickImage} style={styles.buttonstyle}>
            <Text>{localization.uploadImage}</Text>
          </Button>
          <Button block onPress={this.uploadImage} style={styles.buttonstyle}>
            <Text>{localization.storeImage}</Text>
          </Button>
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

export default connect(mapStateToProps, null)(UploadImagesScreen);

const styles = StyleSheet.create({
  buttonstyle: {
    backgroundColor: "#000",
    marginTop: 5
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 50
  },
  imageContainer: {
    marginLeft: "15%",
    marginRight: "15%",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#eee"
  },

  previewImage: { width: "100%", height: 200 },

  errorMessage: {
    color: "red",
    textAlign: "center"
  }
});
