import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
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
  Text
} from "native-base";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";
import colors from "../constants/Colors";

import { connect } from 'react-redux';

class SettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: `${localization.settings}`,
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.settings
        : navigation.state.params.title,
  });

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.settings });
    }
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;

    this.customer_language = firebase
      .firestore()
      .collection("customers")
      .doc(this.customer_id);

    this.unsubscribe_customer_language = this.customer_language.onSnapshot(
      this._onCustomerUpdateLanguage
    );
  }

  _onCustomerUpdateLanguage = querySnapshot => {
    this.props.navigation.setParams({ title: localization.settings });
    this.setState({});
  };

  _signOutAsync = async () => {
    try {
      await firebase.auth().signOut();
      this.props.navigation.navigate("Auth");
    } catch (e) {
      console.log(e);
    }
  };

  _confirmSignOut() {
    let alertTitle = localization.confirm + " " + localization.signOut;
    Alert.alert(
      alertTitle,
      "",
      [
        {
          text: localization.cancel,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: localization.ok, onPress: () => this._signOutAsync() }
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <Container>
        <Content>
          <List>
            <ListItem
              onPress={() =>
                this.props.navigation.navigate("ChangeCredentials")
              }
            >
              <Text>{localization.changeCredentials}</Text>
            </ListItem>
            <ListItem
              onPress={() => this.props.navigation.navigate("SelectLanguage")}
            >
              <Text>{localization.selectLanguage}</Text>
            </ListItem>
            <ListItem onPress={() => this._confirmSignOut()}>
              <Text>{localization.signOut}</Text>
            </ListItem>
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

export default connect(mapStateToProps, null)(SettingsScreen);

const styles = StyleSheet.create({});