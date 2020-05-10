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
  Text,
  Icon, 
  Left, 
  Right
} from "native-base";
import firebase from "react-native-firebase";
import moment from 'moment';
import localization from "../constants/Localization";
import colors from "../constants/Colors";

import { connect } from 'react-redux';

class KitchenSettingsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: `${localization.settings}`,
    // Reference: https://github.com/react-navigation/react-navigation/issues/2379
    title:
      typeof navigation.state.params === "undefined" ||
      typeof navigation.state.params.title === "undefined"
        ? localization.settings
        : navigation.state.params.title,
  });

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };

    this.today = moment().format('YYYY-MM-DD');
  }

  componentDidUpdate(prevProps) {
    if (this.props.settings.language != prevProps.settings.language) {
      this.props.navigation.setParams({ title: localization.settings });
    }
  }

  componentDidMount() {
    var user = firebase.auth().currentUser;
    this.merchant_id = user.uid;

    this.merchant_language = firebase
      .firestore()
      .collection("merchants")
      .doc(this.merchant_id)
      .collection('settings')
      .doc('localization');

    this.unsubscribe_merchant_language = this.merchant_language.onSnapshot(
      this._onMerchantUpdateLanguage
    );

    this.merchant_schedule = firebase.firestore().collection('merchants').doc(this.merchant_id).collection('schedule').doc(this.today);
    this.unsubscribe_today_schedule = this.merchant_schedule.onSnapshot(this._onUpdateSchedule);
  }

  componentWillUnmount() {
    // stop listening to changes to data
    this.unsubscribe_merchant_language();
    this.unsubscribe_today_schedule();
  }

  _onMerchantUpdateLanguage = querySnapshot => {
    this.props.navigation.setParams({ title: localization.settings });
    this.setState({});
  };

  _onUpdateSchedule = (querySnapshot) => {
    var doc = querySnapshot;
    if (doc.exists) {
      this.setState({
        open: doc.data().open
      })
    } else {
      this.setState({
        open: false
      })
    }
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

  // Assume that schedule exists for the given date
  _toggleShop = () => {
    // Check edge case: Refresh current date
    // Edge case: User stays on current screen (no refresh) as the date changes

    var refreshDate = moment().format('YYYY-MM-DD');
    if (refreshDate == this.today) {
      var isOpen = !this.state.open;
      this.props.toggleAvailable(isOpen);
      this.merchant_schedule.set({
        open: isOpen
      });
    } else {
      this.today = refreshDate;
      // need to unsubsribe to doc with previous day schedule
      this.unsubscribe_today_schedule();
      // subscribe to current date
      this.merchant_schedule = firebase.firestore().collection('merchants').doc(this.merchant_id).collection('schedule').doc(this.today);
      this.unsubscribe_today_schedule = this.merchant_schedule.onSnapshot(this._onCollectionUpdateSchedule);
    }
  }

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          <List style={styles.settingList}>
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
            <ListItem>
              {/* AVAILABILITY STATUS */}
              <View style={[styles.flexRow]}>
                  <Left style={{flexDirection:"row"}}>
                    <Text style={{ fontWeight: 'bold' }}>{ this.state.open ? localization.shopOpen : localization.shopClosed }</Text>
                  </Left>
                  <Right style={{flexDirection:"column"}}>
                      <SwitchButton
                      trueColor = {'green'}
                      falseColor = {'red'}
                      toggleOpen = {() => this._toggleShop()}
                      open = {this.state.open} />
                  </Right>
              </View>
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

const mapDispatchToProps = (dispatch) => {
  return {
      toggleAvailable:(open) => dispatch({
          type: 'TOGGLE_OPEN_DAY',
          payload: open
      }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KitchenSettingsScreen);

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: colors.bgColor
  },
  settingList: {
    backgroundColor: colors.secColor
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});