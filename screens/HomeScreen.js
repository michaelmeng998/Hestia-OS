import React, { useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import localization from "../constants/Localization";
import { Container, Content, List, Text } from "native-base";
import FastImage from "react-native-fast-image";
import firebase from "react-native-firebase";
import { connect } from 'react-redux';

const defaultImage =
  "https://firebasestorage.googleapis.com/v0/b/hestia-2de8a.appspot.com/o/placeholderImage.jpg?alt=media&token=8bbf8317-b152-48b3-bda9-6dfbdc6e3803";

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      merchants: [],
      numColumns: 3,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.setState({});
    }
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;

    //when the component is first rendered on the screen
    this.merchants = firebase.firestore().collection("merchants");
    this.unsubscribe_merchants = this.merchants.onSnapshot(
      this._onCollectionUpdateMerchants
    );

    // set language once on initial login
    this.customer_loc_doc = firebase.firestore().collection('customers')
    .doc(this.customer_id).collection('settings').doc('localization');

    this.customer_loc_doc.get().then(function(doc) {
        if (doc.exists) {
            let lang = doc.data().language;
            localization.setLanguage(lang);
            // update store 
            this.props.changeLanguage(lang);

            // console.log("Document data:", doc.data());
        } else {
            // doc.data() will be undefined in this case
            // console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting localization document:", error);
    });
  }

  

  componentWillUnmount() {
    this.unsubscribe_merchants();
  }

  _signOutAsync = async () => {
    try {
      await firebase.auth().signOut();
      this.props.navigation.navigate("Auth");
    } catch (e) {
      console.log(e);
    }
  };

  _onCollectionUpdateMerchants = (querySnapshot) => {
    let merchants = [];
    let displayHeight = null;
    const numColumns = this.state.numColumns;
    querySnapshot.forEach((doc) => {
      //For each merchant in the query, add to component state
      let {
        name,
        uuid,
        displayPictures,
        deliveryFee,
        minOrderValue,
      } = doc.data();
      if (displayPictures) {
        //Adding blanks to maintain display format, otherwise image will spillover if there is empty space in Flatlist
        if (displayPictures.length >= 3) {
          const numberofDisplayFullRows = Math.floor(
            displayPictures.length / numColumns
          );
          let numberOfDisplayElementsLastRow =
            displayPictures.length - numberofDisplayFullRows * numColumns;
          while (
            numberOfDisplayElementsLastRow !== numColumns &&
            numberOfDisplayElementsLastRow !== 0
          ) {
            displayPictures.push({
              empty: true,
            });
            numberOfDisplayElementsLastRow = numberOfDisplayElementsLastRow + 1;
          }
        }
        //Changing picture display size based on array size
        if (displayPictures.length >= 1 && displayPictures.length < 3) {
          displayHeight = 150;
        }
        if (displayPictures.length >= 3) {
          displayHeight = 100;
        }
      } else {
        //Setting default image if vendor did not select any to showcase
        displayPictures = [{ imgUrl: defaultImage }];
        displayHeight = 150;
      }
      if (
        minOrderValue == null ||
        minOrderValue == "" ||
        minOrderValue == undefined
      ) {
        minOrderValue = 0;
      }
      if (
        deliveryFee == null ||
        deliveryFee == "" ||
        deliveryFee == undefined
      ) {
        deliveryFee = 0;
      }

      merchants.push({
        name: name,
        uuid: uuid,
        deliveryFee: deliveryFee,
        minOrderValue: minOrderValue,
        displayPictures: displayPictures,
        displayHeight: displayHeight,
      });
      this.setState({
        merchants: merchants,
      });
    });
  };

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <Text style={styles.mainTitle}>{localization.dian}</Text>
          <View>
            {this.state.merchants.map((value) => (
              <View
                style={{
                  paddingBottom: 10,
                  borderTopColor: "black",
                  borderTopWidth: 1,
                }}
                key={value.uuid}
              >
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("Kitchen", {
                      name: value.name,
                      uuid: value.uuid,
                    })
                  }
                >
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{ color: "black", fontSize: 20, marginBottom: 5 }}
                    >
                      {value.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginRight: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Text style={styles.infoFlair}>
                        {localization.minOrder}
                        {": $"}
                        {parseFloat(value.minOrderValue).toFixed(2)}
                      </Text>
                      <Text style={styles.infoFlair}>
                        {localization.delivery}
                        {": $"}
                        {parseFloat(value.deliveryFee).toFixed(2)}
                      </Text>
                    </View>
                    <FlatList
                      //MUST INCLUDE extraData={this.state} or else component will not update its render!
                      extraData={this.state}
                      numColumns={this.state.numColumns}
                      data={value.displayPictures}
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
                            <FastImage
                              style={{
                                width: null,
                                height: value.displayHeight,
                              }}
                              source={{
                                uri: item.imgUrl,
                                priority: FastImage.priority.normal,
                              }}
                              resizeMode={FastImage.resizeMode.cover}
                            />
                          </View>
                        );
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={{ marginBottom: 20, paddingBottom: 20 }} />
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

export default connect(mapStateToProps, null)(HomeScreen);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 50,
  },
  mainTitle: {
    paddingBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30,
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
  itemInvisible: { flex: 1, margin: 1, backgroundColor: "transparent" },
});
