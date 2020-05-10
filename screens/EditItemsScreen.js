import React from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Image,
  Switch,
  ScrollView,
  TextInput
} from "react-native";
import {
  Button,
  CheckBox,
  Container,
  Content,
  List,
  ListItem,
  Text,
  Left,
  Right,
  Form,
  Item,
  Label,
  Input,
  Icon
} from "native-base";
import FastImage from "react-native-fast-image";
import Divider from "react-native-divider";
import Dialog from "react-native-dialog";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";
import uuid from "uuid/v4"; // Import UUID to generate UUID
import SwitchButton from "../components/SwitchButton";
import { connect } from 'react-redux';
import ImagePicker from "react-native-image-picker";

const defaultImage =
  "https://firebasestorage.googleapis.com/v0/b/hestia-2de8a.appspot.com/o/placeholderImage.jpg?alt=media&token=8bbf8317-b152-48b3-bda9-6dfbdc6e3803";

class EditMenuScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.editItems
        : navigation.state.params.title
  });

  constructor(props) {
    super(props);
    this.state = {
      //States for add items form
      itemEdit: props.navigation.state.params.itemInfo,
      itemName: null,
      itemPrice: null,
      itemQuantity: null,
      hasErrorName: true,
      hasErrorPrice: true,
      hasErrorQuantity: true,
      hasErrorHeaderName: false,
      hasErrorOptionName: false,
      hasErrorOptionPrice: false,
      errorMessageName: "",
      errorMessagePrice: "",
      errorMessageQuantity: "",
      errorMessageHeaderName: "",
      errorMessageOptionName: "",
      errorMessageOptionPrice: "",
      customizationOn: false,
      customizations: [],
      itemRecipe: null,
      //STATE FOR IMAGES
      imageUri: "",
      imgSource: "",
      counter: 0,
      images: "",
      //STATE FOR IMAGE CHANGING
      imageChanged: false,
      imageCachedUri: "",
      //STATE FOR PICKING AN IMAGE, FOR SPINNER
      imageSpinner: false,
      //STATE FOR UPLOADING PROGRESS, ALSO TO HANDLE SPAMMING THE UPLOAD BUTTON
      uploading: false
    };

    this.props.navigation.setParams({ title: localization.editItems });
  }

  componentDidMount() {
    console.log(this.state);
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;
    this.itemID = this.state.itemEdit.itemID;
    if ((this.state.itemEdit.customizationOn = false)) {
    } else {
      this.setState({
        customizationOn: true,
        customizations: this.state.itemEdit.customizations
      });
    }
    this.setState({
      imageUri: this.state.itemEdit.imgUrl,
      itemName: this.state.itemEdit.name,
      itemPrice: this.state.itemEdit.price.toString(),
      itemQuantity: this.state.itemEdit.quantity.toString(),
      itemRecipe: this.state.itemEdit.itemRecipe
    });
  }

  //  ============================
  //   IMAGE FUNCTIONS
  //  ============================

  //NOTE: need to change so either camera works or they must select from image gallery
  pickImage = () => {
    console.log("imageCachedUri is: ", this.state.imageUri);
    this.setState({ imageSpinner: true });
    ImagePicker.showImagePicker(
      {
        title: "Select Image"
      },
      response => {
        if (response.didCancel) {
          console.log("You cancelled image picker 😟");
          this.setState({ imageSpinner: false });
        } else if (response.error) {
          console.log(response.error);
          this.setState({ imageSpinner: false });
        } else {
          //save the state of the previous image, imageCachedUri can be empty if no image to begin with
          console.log("imageCachedUri is: ", this.state.imageUri);
          this.setState({
            imageCachedUri: this.state.imageUri
          });

          //store new image in state
          const source = { uri: response.uri };
          console.log("Succesfully chosen image...");
          this.setState({
            imgSource: source,
            imageUri: response.uri,
            imageSpinner: false,
            //set state for image being changed
            imageChanged: true
          });
        }
      }
    );
  };

  uploadImage = () => {
    console.log("starting to store image...", this.state.imageUri);
    var ext = this.state.imageUri.replace(/[^a-zA-Z]/g, "").substr(-7, 5);
    const filename = `${uuid()}.${ext}`; // Generate unique name
    //store image to firebase storage
    return new Promise((resolve, reject) => {
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

            //if snapshot state succeeded, store into firestore DB
            if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
              const getURL = snapshot.downloadURL;
              console.log("inside upload image function: ", getURL);
              resolve(getURL);
            }
            state = { progress: 0 };
          },
          error => {
            unsubscribe();
            alert("Image upload to DB failed: ", error);
            reject(error);
          }
        );
    });
  };

  removeImageFromDB(imgUrl) {
    //Return if the item has no image stored in the firebase storage DB
    if (imgUrl == "") {
      return;
    }
    console.log("deleted images url is: " + imgUrl);
    imageRef = firebase.storage().refFromURL(imgUrl);

    // Delete the file
    imageRef
      .delete()
      .then(function() {
        console.log("image deleted from firebase storage");
      })
      .catch(function(error) {
        //LOG ERROR somewhere
        console.log("Error deleting image from firebase storage: ", error);
      });
  }

  //Need a function to delete the previous image stored, run in parralel with the function adding the new image into the DB.

  asyncItemSubmission = async imgChanged => {
    //handle spammed submit presses
    if (this.state.uploading == true) {
      return;
    }
    this.setState({ uploading: true });

    //set getURL to  current imageUri, if image changed will change it, otherwise just use current imageUri
    getURL = this.state.imageUri;

    //if the image has been changed, need to upload image to firebase DB, and delete old one if it existed
    if (imgChanged == true) {
      //upload the new image to firebase storage
      //if there is error, need to log
      await this.uploadImage()
        .then(res => {
          getURL = res;

          //delete old image from firebase storage if succesfully uploaded the new one
          console.log("about to delete: ", this.state.imageCachedUri);
          this.removeImageFromDB(this.state.imageCachedUri);
        })
        .catch(err => {
          //LOG ERROR somewhere
          console.log("Error with image editing: ", err);
        });
    }
    // return getURL;

    this.itemID.update({
      imgUrl: getURL,
      active: true,
      name: this.state.itemName.trim(),
      price: parseFloat(this.state.itemPrice.trim()),
      quantity: Math.round(this.state.itemQuantity),
      customizationOn: this.state.customizationOn,
      customizations: this.state.customizations,
      recipe: this.state.itemRecipe
    });

    this.setState({
      itemName: null,
      itemPrice: null,
      itemQuantity: null,
      customizationOn: false,
      customizations: [],
      itemRecipe: null,
      imageUri: "",
      imgSource: "",
      imageChanged: false
    });
    this.props.navigation.navigate("Menu");
  };

  //  ============================
  //   SUBMIT FUNCTIONS
  //  ============================

  //_handleSubmit() will just handle the state changes and change the error flags
  _handleSubmit() {
    //error handling for form fields
    if (this.state.itemName == null || this.state.itemName == "") {
      this.setState({
        hasErrorName: true,
        errorMessageName: localization.itemNameError
      });
    } else {
      this.setState({
        hasErrorName: false,
        errorMessageName: ""
      });
    }

    var regexp = /^\d+(\.\d{1,2})?$/;

    if (!regexp.test(this.state.itemPrice)) {
      this.setState({
        hasErrorPrice: true,
        errorMessagePrice: localization.itemPriceError
      });
    } else {
      this.setState({
        hasErrorPrice: false,
        errorMessagePrice: ""
      });
    }

    if (!/^\d+$/.test(this.state.itemQuantity)) {
      this.setState({
        hasErrorQuantity: true,
        errorMessageQuantity: localization.itemQuantityError
      });
    } else {
      this.setState({
        hasErrorQuantity: false,
        errorMessageQuantity: ""
      });
    }
    //Testing Customization Inputs//
    this.setState({
      hasErrorHeaderName: false,
      hasErrorOptionName: false,
      hasErrorOptionPrice: false
    });

    if (this.state.customizations.length > 0) {
      this.setState({ customizationOn: true });
    } else {
      this.setState({
        customizationOn: false
      });
    }

    const customizations = this.state.customizations;
    customizations.map((header, headerKey) => {
      header.headerOptions.map((option, optionKey) => {
        if (!regexp.test(option.optionPrice)) {
          option.errorPrice = localization.itemPriceError; //First Checking for number inputs in price
          this.setState({
            hasErrorOptionPrice: true,
            customizations: customizations
          });
        } else {
          option.errorPrice = null;
          if (option.optionName == "" && option.optionPrice == 0) {
            header.headerOptions.splice(optionKey, 1); // Item without name and price will be removed
            this.setState({ customizations: customizations });
          } else {
            if (option.optionName == "" && option.optionPrice > 0) {
              option.errorName = localization.itemNameError; // Item with price but no name will display error
              this.setState({
                hasErrorOptionName: true,
                customizations: customizations
              });
            } else {
              option.errorName = null;
              this.setState({
                customizations: customizations
              });
            }
          }
        }
      });

      if (header.headerName == "" && header.headerOptions.length > 1) {
        header.error = localization.itemNameError; //Display error if options are created but header name is empty
        this.setState({
          hasErrorHeaderName: true,
          customizations: customizations
        });
      } else {
        header.error = null;
        if (header.headerName == "" || header.headerOptions.length <= 1) {
          customizations.splice(headerKey, 1); // Remove customizations that have one or no option
          this.setState({ customizations: customizations });
        }
      }
    });
  }

  componentDidUpdate(prevProps) {
    var regexp = /^\d+(\.\d{1,2})?$/;

    // Update title if language changed
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.editItems });
    }

    if (
      this.state.hasErrorName === false &&
      this.state.hasErrorPrice === false &&
      this.state.hasErrorQuantity === false &&
      this.state.hasErrorHeaderName === false &&
      this.state.hasErrorOptionName === false &&
      this.state.hasErrorOptionPrice === false &&
      this.state.itemName != "" &&
      //   this.state.itemPrice != "" &&
      /^\d+$/.test(this.state.itemQuantity) &&
      this.state.itemQuantity != "" &&
      this.state.itemName != null &&
      regexp.test(this.state.itemPrice) &&
      //   this.state.itemPrice != null
      this.state.uploading == false //This is a hack to prevent user spamming submit button and uploading multiple times
    ) {
      //first need to check if the image changed
      if (this.state.imageChanged == true) {
        //imgChanged flag is true
        this.asyncItemSubmission(true);
      } else {
        this.asyncItemSubmission(false);
      }
    }
  }

  //*Customization Functions*//
  _addHeaderField = () => {
    this.setState({
      customizations: [
        ...this.state.customizations,
        { id: uuid(), headerName: "", headerOptions: [] }
      ]
    });
  };

  _headerHandler = (value, index) => {
    this.state.customizations[index].headerName = value;
    this.setState({ customizations: this.state.customizations });
  };
  _deleteHeaderField = index => {
    let headerArray = this.state.customizations;
    headerArray.splice(index, 1);
    this.setState({ customizations: headerArray });
  };

  _addOptionField = index => {
    let headerArray = this.state.customizations;
    headerArray[index].headerOptions = [
      ...headerArray[index].headerOptions,
      { id: uuid(), active: false, optionName: "", optionPrice: 0 }
    ];
    this.setState({ customizations: headerArray });
  };
  _optionNameHandler = (value, index, headerKey) => {
    let headerArray = this.state.customizations;
    headerArray[headerKey].headerOptions[index].optionName = value;
    this.setState({ customizations: headerArray });
  };

  _optionPriceHandler = (value, index, headerKey) => {
    let headerArray = this.state.customizations;
    headerArray[headerKey].headerOptions[index].optionPrice = value;
    this.setState({ customizations: headerArray });
  };

  _deleteOptionField = (index, headerKey) => {
    let headerArray = this.state.customizations;
    headerArray[headerKey].headerOptions.splice(index, 1);
    this.setState({ customizations: headerArray });
  };

  //*Customization Functions*//

  //CODE FOR ADDING ITEMS

  render() {
    return (
      //first need a toggle for food or drink item to be added

      <Container>
        <Content style={styles.contentContainer}>
          <View style={{ marginTop: 20 }} />

          {/* Add item Image section */}
          <Divider borderColor="#000" color="#000" orientation="center">
            {localization.uploadImage}
          </Divider>
          <View style={styles.imageContainer}>
            {this.state.imageUri == "" ? (
              <View style={styles.previewImage}>
                <View style={styles.displaySpinner}>
                  <Text>{localization.noImage}</Text>
                </View>
              </View>
            ) : (
              <FastImage
                style={styles.previewImage}
                source={{
                  uri: this.state.imageUri,
                  priority: FastImage.priority.normal
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            )}
            <View style={styles.displaySpinner}>
              <Text>
                {this.state.imageSpinner ? localization.displaySpinner : ""}
              </Text>
            </View>
          </View>
          <Button
            block
            onPress={this.pickImage}
            style={styles.uploadImageButton}
          >
            <Text>{localization.uploadImage}</Text>
          </Button>

          <Form>
            <Item floatingLabel>
              <Icon active name="md-create" />
              <Label>{localization.name}</Label>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text => this.setState({ itemName: text })}
                value={this.state.itemName}
              />
            </Item>
            {this.state.hasErrorName ? (
              <Text style={styles.errorMessage}>
                {this.state.errorMessageName}
              </Text>
            ) : null}
            <Item floatingLabel>
              <Icon active name="ios-pricetag" />
              <Label>{localization.price}</Label>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                onChangeText={text => this.setState({ itemPrice: text })}
                value={this.state.itemPrice}
              />
            </Item>
            {this.state.hasErrorPrice ? (
              <Text style={styles.errorMessage}>
                {this.state.errorMessagePrice}
              </Text>
            ) : null}

            <Item floatingLabel>
              <Icon active name="md-basket" />
              <Label>{localization.quantity}</Label>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
                onChangeText={text => this.setState({ itemQuantity: text })}
                value={this.state.itemQuantity}
              />
            </Item>
            {this.state.hasErrorQuantity ? (
              <Text style={styles.errorMessage}>
                {this.state.errorMessageQuantity}
              </Text>
            ) : null}
            {/* Customizations */}
            <Text>Customizations</Text>
            <View flexDirection="row" style={{ marginTop: 10 }} />
            {this.state.customizations.map((headerInput, headerKey) => {
              return (
                // Adding Customization Headers
                <View key={headerInput.id}>
                  <View flexDirection="row">
                    <Input
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={headerInput.headerName}
                      onChangeText={header => {
                        this._headerHandler(header, headerKey);
                      }}
                      placeholder={"Customization"}
                    />
                    <Text style={styles.errorMessage}>{headerInput.error}</Text>
                    <Icon
                      size={25}
                      color="#ff0000"
                      name="ios-close-circle"
                      onPress={() => this._deleteHeaderField(headerKey)}
                    />
                  </View>
                  <View>
                    {/*Adding Cusotmization Options */}
                    {headerInput.headerOptions.map((optionInput, key) => {
                      return (
                        <View
                          style={styles.customizationView}
                          key={optionInput.id}
                        >
                          <Input
                            style={{
                              flex: 3
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={optionInput.optionName}
                            onChangeText={name => {
                              this._optionNameHandler(name, key, headerKey);
                            }}
                            placeholder={"Option Name"}
                          />
                          <Text style={styles.errorMessage}>
                            {optionInput.errorName}
                          </Text>
                          <Input
                            style={{ flex: 1 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="numeric"
                            value={optionInput.optionPrice}
                            onChangeText={value => {
                              this._optionPriceHandler(value, key, headerKey);
                            }}
                            placeholder={"$0.00"}
                          />
                          <Text style={styles.errorMessage}>
                            {optionInput.errorPrice}
                          </Text>
                          <Icon
                            size={25}
                            color="#ff0000"
                            name="ios-close-circle"
                            onPress={() =>
                              this._deleteOptionField(key, headerKey)
                            }
                          />
                        </View>
                      );
                    })}
                    <Button
                      style={{
                        backgroundColor: "#000",
                        marginLeft: 15,
                        marginBottom: 5,
                        borderRadius: 20
                      }}
                      onPress={() => this._addOptionField(headerKey)}
                    >
                      <Text>+ Add Options</Text>
                    </Button>
                  </View>
                </View>
              );
            })}

            <Button
              style={{ backgroundColor: "#000", borderRadius: 20 }}
              onPress={() => this._addHeaderField()}
            >
              <Text>+ Add Customization</Text>
            </Button>
          </Form>
          {/* Add item form*/}

          <View style={{ flexDirection: "row", paddingTop: 10 }}>
            <Icon active name="md-book" />
            <Text style={{ paddingLeft: 2 }}>{localization.recipe}</Text>
          </View>
          <ScrollView>
            <TextInput
              // placeholder={"1) Ingredient 1,\n2) Ingredient 2"}
              style={styles.recipeBox}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={true}
              minHeight={50}
              value={this.state.itemRecipe}
              onChangeText={text => this.setState({ itemRecipe: text })}
            />
          </ScrollView>

          <View style={{ marginTop: 30 }} />

          {this.state.uploading ? (
            <Button
              style={[
                styles.submitButton,
                { alignSelf: "center", backgroundColor: "gray" }
              ]}
              disabled
            >
              <Text>{localization.uploading}</Text>
            </Button>
          ) : (
            <Button
              style={styles.submitButton}
              onPress={() => {
                this._handleSubmit();
              }}
            >
              <Text>{localization.submit}</Text>
            </Button>
          )}
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

export default connect(mapStateToProps, null)(EditMenuScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20
  },
  buttonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  editItemButton: {
    backgroundColor: "#000"
  },
  foodHeader: {
    flex: 1,
    flexDirection: "row",
    marginTop: 15
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  submitButton: {
    flex: 1,
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "center",
    marginLeft: "30%",
    marginRight: "30%",
    borderRadius: 50,
    backgroundColor: "#000"
  },
  customizationView: {
    flexDirection: "row",
    alignContent: "space-between",
    justifyContent: "flex-end",
    marginLeft: "5%",
    overflow: "scroll"
  },
  errorMessage: {
    flex: 1,
    flexDirection: "column",
    color: "red"
  },
  previewImage: { width: "100%", height: 200 },
  imageContainer: {
    marginLeft: "15%",
    marginRight: "15%",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "#eee"
  },
  uploadImageButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    textAlign: "center",
    marginLeft: "10%",
    marginRight: "10%",
    borderRadius: 50,
    backgroundColor: "#000",
    marginTop: 5
  },
  //image display spinner
  displaySpinner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  recipeBox: {
    borderColor: "black",
    borderWidth: 1,
    height: 150
  }
});
