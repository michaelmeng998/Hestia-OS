import React from "react";
import { KeyboardAvoidingView, View, Text, StyleSheet } from "react-native";
import LoginForm from "../components/LoginForm";

export default class Login extends React.Component {
  render() {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View style={styles.container}>
          <View style={styles.loginContainer}></View>

          <View style={styles.formContainer}>
            <LoginForm />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  loginContainer: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center"
  }
});
