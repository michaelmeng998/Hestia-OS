import React from "react";
import {
  View,
  Text,
  AsyncStorage,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { withNavigation } from "react-navigation";

class LoginForm extends React.Component {
  _handleLogin = async (email, password) => {
    console.log(this.passwordInput.focus());
    console.log(email + " " + password);
    await AsyncStorage.setItem("userToken", "email");
    this.props.navigation.navigate("Main");
  };

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          onSubmitEditing={() => this.passwordInput.focus()}
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          placeholder="Email or Mobile Num"
          placeholderTextColor="rgba(150,150,150,0.7)"
        />

        <TextInput
          style={styles.input}
          returnKeyType="go"
          ref={input => (this.passwordInput = input)}
          placeholder="Password"
          placeholderTextColor="rgba(150,150,150,0.7)"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => this._handleLogin("david", "password")}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default withNavigation(LoginForm);

// define your styles
const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  input: {
    height: 40,
    backgroundColor: "rgba(150,150,150,0.2)",
    marginBottom: 10,
    padding: 10,
    color: "#fff"
  },
  buttonContainer: {
    backgroundColor: "#2980b6",
    paddingVertical: 15
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700"
  }
});
