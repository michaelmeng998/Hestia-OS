import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
import firebase from "react-native-firebase";
import localization from "../constants/Localization";
import Icon from "react-native-vector-icons/Ionicons";
import colors from "../constants/Colors";

import { connect } from "react-redux";

class LocalizationScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.selectLanguage
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);

    this.englishAbbr = "en";
    this.chineseAbbr = "zh";
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.customer_id = user.uid;
    this.customer_loc_doc = firebase
      .firestore()
      .collection("customers")
      .doc(this.customer_id)
      .collection("settings")
      .doc("localization");
  }

  _selectLanguage = (language) => {
    localization.setLanguage(language);
    this.props.navigation.setParams({ title: localization.selectLanguage });

    this.customer_loc_doc
      .set({
        language: language,
      })
      .then(function() {
        console.log("Succesfully set language to: " + language);
      })
      .catch(function(error) {
        console.error("Error updating language to: " + language);
      });

    this.props.changeLanguage(language);
    this.setState({});
  };

  _confirmSelectLanguage(language) {
    if (localization.getLanguage() != language) {
      let alertTitle = localization.confirm + " " + localization.selectLanguage;
      Alert.alert(
        alertTitle,
        "",
        [
          {
            text: localization.cancel,
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: localization.ok,
            onPress: () => this._selectLanguage(language),
          },
        ],
        { cancelable: false }
      );
    }
  }

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <List style={styles.locList}>
            <ListItem
              style={[styles.flexRow]}
              onPress={() => this._confirmSelectLanguage(this.englishAbbr)}
            >
              <Text>{localization.english}</Text>
              {localization.getLanguage() == this.englishAbbr && (
                <Icon size={25} name="ios-checkmark-circle" />
              )}
            </ListItem>
            <ListItem
              style={[styles.flexRow]}
              onPress={() => this._confirmSelectLanguage(this.chineseAbbr)}
            >
              <Text>{localization.chinese}</Text>
              {localization.getLanguage() == this.chineseAbbr && (
                <Icon size={25} name="ios-checkmark-circle" />
              )}
            </ListItem>
          </List>
        </Content>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeLanguage: (lang) =>
      dispatch({
        type: "CHANGE_LANGUAGE",
        payload: lang,
      }),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(LocalizationScreen);

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: colors.bgColor,
  },
  locList: {
    backgroundColor: colors.secColor,
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
