import React from "react";
import {
  AsyncStorage,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
} from "react-native";
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
  Text,
  Icon,
} from "native-base";
import firebase from "react-native-firebase";

export default class NewLoginScreen extends React.Component {
  static navigationOptions = {
    title: "Hestia",
    headerStyle: { backgroundColor: "#fff" },
  };

  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password: null,
      errorMessage: "",
      loadingLogin: false,
    };
    this.merchant_ref = firebase.firestore().collection("merchants");
    this.customer_ref = firebase.firestore().collection("customers");
  }

  _determineLogin = async () => {
    var user = firebase.auth().currentUser;
    var uuid = user.uid;
    const customerUserRef = this.customer_ref.doc(uuid);
    const merchantUserRef = this.merchant_ref.doc(uuid);
    customerUserRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        this.props.navigation.navigate("Customer");
      }
    });

    merchantUserRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        this.props.navigation.navigate("Kitchen");
      }
    });
  };

  _handleLogin = async () => {
    const { email, password } = this.state;

    this.setState({
      loadingLogin: true,
    });
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this._determineLogin())
      .catch((error) =>
        this.setState({ loadingLogin: false, errorMessage: error.message })
      );
  };

  _handleCreate = () => {
    this.props.navigation.navigate("CreateAccountScreen");
  };

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          {/* <KeyboardAvoidingView behavior="padding">				 */}
          <Form>
            <Item floatingLabel>
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => this.setState({ email: text })}
              />
            </Item>
            <Item floatingLabel last>
              <Label>Password</Label>
              <Input
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) => this.setState({ password: text })}
              />
            </Item>
          </Form>

          {/* <TouchableOpacity style={styles.buttonContainer}
										onPress={() => this._handleLogin('david', 'password')}>
									<Text style={styles.buttonText}>LOGIN</Text>
						</TouchableOpacity>  */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
            }}
          >
            <Text>{this.state.errorMessage}</Text>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
            }}
          >
            <Button
              style={styles.loginButton}
              primary
              onPress={() => this._handleLogin()}
            >
              <Text style={{ textAlign: "center", color: "white" }}>
                {" "}
                LOGIN{" "}
              </Text>
            </Button>

            <Icon
              style={{
                color: "white",
                width: 30,
                height: 30,
                marginTop: 6,
                position: "absolute",
                right: 5,
              }}
              name="md-play"
              type="Ionicons"
              onPress={() => this._handleLogin()}
            />
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingTop: 10,
              justifyContent: "center",
            }}
          >
            {this.state.loadingLogin && <ActivityIndicator size="large" />}
          </View>
          <View style={{ flex: 1, flexDirection: "row", marginTop: 20 }}>
            <Button
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
              }}
              transparent
              onPress={() => this._handleCreate()}
            >
              <Text style={{ color: "black" }}>CREATE ACCOUNT</Text>
            </Button>
          </View>
          {/* </KeyboardAvoidingView> */}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#F9FAFB",
  },
  buttonContainer: {
    backgroundColor: "#2980b6",
    paddingVertical: 15,
    justifyContent: "center",
  },
  loginButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    borderRadius: 50,
    backgroundColor: "black",
  },
});
