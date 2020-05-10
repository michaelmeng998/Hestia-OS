import React from "react";
import { AsyncStorage, View, StyleSheet } from "react-native";

import {
  Container,
  Content,
  Button,
  Text,
  Icon,
  Footer,
  FooterTab
} from "native-base";

import firebase from "react-native-firebase";
import localization from '../constants/Localization';
import { createBottomTabNavigator } from "react-navigation";

export default class KitchenHomeScreen extends React.Component {
  componentDidMount() {
    const { navigation } = this.props;
    navigation.setParams({
      referencedSignOut: this._signOutAsync
    });
  }

  _signOutAsync = async () => {
    try {
      await firebase.auth().signOut();
      this.props.navigation.navigate("Auth");
    } catch (e) {
      console.log(e);
    }
  };

  componentDidMount() {
    var user = firebase.auth().currentUser;
    const db = firebase.firestore();

    db.collection("merchants")
      .where("uuid", "==", user.uid)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.setState({
            merchantName: doc.data().name,
            paramsLoading: false
          });
          console.log("shop name is: " + doc.data().name);
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    var user = firebase.auth().currentUser;
    return {
      title: "Dian",
      headerTitleStyle: {
        textAlign: "center",
        flex: 1
      },
      headerStyle: { backgroundColor: "#fff" }
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    this.unsubscribe_schedule = null;
    this.unsubscribe_merchant_language = null;
  }

  componentWillMount() {
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;
    this.merchant_schedule = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection("schedule");
    
    this.merchant_language = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id);

    this.unsubscribe_schedule = this.merchant_schedule.onSnapshot(
      this._onCollectionUpdateSchedule
    );
    this.unsubscribe_merchant_language = this.merchant_language.onSnapshot(
      this._onMerchantUpdateLanguage
    );
  }

  componentWillUnmount() {
    this.unsubscribe_schedule();
    this.unsubscribe_merchant_language();
  }

  _onCollectionUpdateSchedule = querySnapshot => {
    var open_days = {};
    var currentDate = new Date();
    var dateString = currentDate.toISOString().slice(0, 10);
    querySnapshot.forEach(doc => {
      var date = doc.id;
      var open = doc.data().open;
      if (date === dateString) {
        this.setState({
          open: open
        });
      }
    });
  };

  _onMerchantUpdateLanguage = querySnapshot => {
    let language = querySnapshot.data().language;
    // https://stackoverflow.com/questions/3390396/how-to-check-for-undefined-in-javascript
    if (typeof language === "undefined") {
      language = "en";
    }
    localization.setLanguage(language);
    this.setState({});
  }

  toggleShop() {
    var setBool = !this.state.open;
    this.setState({
      open: setBool
    });
    var currentDate = new Date();
    var dateString = currentDate.toISOString().slice(0, 10);
    this.merchant_schedule.doc(dateString).set({
      open: setBool
    });
  }

  render() {
    return (
      <Container>
        <Content
          style={styles.contentContainer}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Text style={styles.mainTitle}>{this.state.merchantName}</Text>

          <Text style={styles.statusTitle}>
            {this.state.open ? localization.shopOpen : localization.shopClosed}
          </Text>

          <View style={{ height: "50%", paddingBottom: 20 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                height: "100%",
                justifyContent: "space-between",
                marginTop: 20
              }}
            >
              <Button
                // rounded
                style={styles.homeItem}
                onPress={() => this.props.navigation.navigate("Orders")}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10
                  }}
                >
                  <View>
                    <Icon
                      name="md-cash"
                      type="Ionicons"
                      color="#fff"
                      style={{ fontSize: 100 }}
                    />
                  </View>
                  <Text
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20
                    }}
                  >
                    {localization.orders}
                  </Text>
                </View>
              </Button>

              <Button
                // rounded
                style={styles.homeItem}
                onPress={() => this.props.navigation.navigate("Menu")}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10
                  }}
                >
                  <View>
                    <Icon
                      name="md-book"
                      type="Ionicons"
                      color="#fff"
                      style={{ fontSize: 100 }}
                    />
                  </View>
                  <Text
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20
                    }}
                  >
                    {localization.manageMenu}
                  </Text>
                </View>
              </Button>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                height: "100%",
                justifyContent: "space-between",
                marginTop: 20
              }}
            >
              <Button
                // rounded
                style={styles.homeItem}
                onPress={() => this.props.navigation.navigate("Schedule")}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10
                  }}
                >
                  <View>
                    <Icon
                      name="md-calendar"
                      type="Ionicons"
                      color="#fff"
                      style={{ fontSize: 100 }}
                    />
                  </View>
                  <Text
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20
                    }}
                  >
                    {localization.scheduling}
                  </Text>
                </View>
              </Button>

              <Button
                // rounded
                style={styles.homeItem}
                onPress={() => this.props.navigation.navigate("KitchenSettings")}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10
                  }}
                >
                  <View>
                    <Icon
                      name="md-settings"
                      type="Ionicons"
                      color="#fff"
                      style={{ fontSize: 100 }}
                    />
                  </View>
                  <Text
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 20
                    }}
                  >
                    {localization.settings}
                  </Text>
                </View>
              </Button>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              paddingBottom: 10
            }}
          >
            <Button
              // rounded
              style={this.state.open ? styles.openButton : styles.closeButton}
              onPress={() => this.toggleShop()}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 10
                }}
              >
                <View>
                  <Icon
                    name="md-play"
                    type="Ionicons"
                    color="#fff"
                    style={{ fontSize: 25 }}
                  />
                </View>
                <Text>{this.state.open ? localization.closeShop : localization.openShop}</Text>
              </View>
            </Button>
          </View>
        </Content>
        {/* <Footer>
          <FooterTab>
            <Button>
              <Icon name="md-home" size={30} color="#900" />
              <Text>Profile</Text>
            </Button>
          </FooterTab>
        </Footer> */}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  Footer: {
    backgroundColor: "#ffcc66"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 0,
    backgroundColor: "#fff"
  },
  mainTitle: {
    textAlign: "center",
    fontWeight: "bold",
    borderWidth: 2,
    borderColor: "grey",
    fontSize: 25,
    justifyContent: "center",
    marginTop: 0
  },
  statusTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
    paddingTop: 10,
    paddingBottom: 10
  },
  homeItem: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "#000"
  },
  signOutButton: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f00"
  },
  openButton: {
    justifyContent: "center",
    backgroundColor: "#f00",
    marginTop: 100,
    width: 150
  },
  closeButton: {
    justifyContent: "center",
    backgroundColor: "#0f0",
    marginTop: 100,
    width: 150
  },
  homeButton: {
    justifyContent: "center",
    backgroundColor: "#f00",
    bottom: 0,
    width: 75,
    height: 75,
    borderRadius: 50
  }

  // subTitle: {
  //     paddingTop: 25,
  //     fontWeight: "bold",
  // },
  // optionsContainer: {
  //     paddingTop: 10,
  //     flex: 1,
  //     flexDirection: "column",
  //     justifyContent: "space-evenly",
  // }
});
