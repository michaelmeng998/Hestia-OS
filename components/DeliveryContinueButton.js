import React from "react";
import {
  Alert,
  AsyncStorage,
  View,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import firebase from "react-native-firebase";

class DeliveryContinueButton extends React.Component {
  constructor(props) {
    super(props);
  }

  _handleContinue() {
    this.props.navigation.navigate("OrderConfirmation", {
      merchant_uuid: this.props.navigation.state.params.merchant_uuid,
      orderType: this.props.orderType
    });
  }

  render() {
    return (
      <View style={styles.ConfirmBar}>
        <TouchableOpacity
          onPress={() => this._handleContinue()}
          style={{
            borderColor: "white",
            borderWidth: 1,
            backgroundColor: "black",
            borderRadius: 30,
            padding: 10
          }}
        >
          <Text style={{ color: "white" }}>
            {"Continue with " + this.props.orderType}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    order: state.order
  };
};

export default connect(mapStateToProps, null)(DeliveryContinueButton);

const styles = StyleSheet.create({
  ConfirmBar: {
    flexGrow: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "black",
    paddingHorizontal: 5
  }
});
