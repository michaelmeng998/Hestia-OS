import React from "react";
import {
  AsyncStorage,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  View
} from "react-native";
import {
  Button,
  Container,
  Content,
  Form,
  Item,
  Label,
  Left,
  Right,
  Input,
  List,
  ListItem,
  Radio,
  Text
} from "native-base";
import Divider from "react-native-divider";
import firebase from "react-native-firebase";

export default class CreateAccountScreen extends React.Component {
  static navigationOptions = {
    title: "Hestia"
  };

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      password2: "",
      itemSelected: "customer",
      customer_name: "",
      customer_phone_number: "",
      merchant_phone_number: "",
      merchant_name: "",
      input1: null,
      input2: null,
      input3: null,
      show: false,
      errorMessage: ""
    };
    this.merchant_ref = firebase.firestore().collection("merchants");
    this.customer_ref = firebase.firestore().collection("customers");
  }

  _addtoDB = (itemSelected, name) => {
    var user = firebase.auth().currentUser;
    var uuid = user.uid;
    var email = user.email;
    var merchant_name = this.state.merchant_name;
    var customer_name = this.state.customer_name;
    var customer_phone_number = this.state.customer_phone_number;
    var merchant_phone_number = this.state.merchant_phone_number;
    if (itemSelected === "merchant") {
      this.merchant_ref
        .doc(uuid)
        .set({
          uuid: uuid,
          email: email,
          name: merchant_name,
          phone_number: merchant_phone_number,
          language: "en"
        })
        .then(this.props.navigation.navigate("Kitchen"));
    } else if (itemSelected === "customer") {
      this.customer_ref
        .doc(uuid)
        .set({
          uuid: uuid,
          email: email,
          name: customer_name,
          phone_number: customer_phone_number
        })
        .then(this.props.navigation.navigate("Customer"));
    }
  };

  _handleCreate = async () => {
    const {
      email,
      password,
      password2,
      itemSelected,
      merchant_name
    } = this.state;
    if (password === password2) {
      this.setState({ show: false, errorMessage: "" });

      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => this._addtoDB(itemSelected, merchant_name))
        .catch(error =>
          this.setState({ show: true, errorMessage: error.message })
        );
    } else {
      this.setState({
        input2: null,
        input3: null,
        show: true,
        errorMessage: "Passwords Don't Match, Please Retry"
      });
    }
  };

  render() {
    return (
      <Container>
        <Content style={styles.contentContainer}>
          {/* <KeyboardAvoidingView behavior="padding">				 */}
          <Divider borderColor="#000" color="#000" orientation="center">
            User Info
          </Divider>
          <Form>
            <Item floatingLabel>
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text =>
                  this.setState({ input1: text, email: text })
                }
                value={this.state.input1}
              />
            </Item>
            <Item floatingLabel last>
              <Label>Password</Label>
              <Input
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text =>
                  this.setState({ input2: text, password: text })
                }
                value={this.state.input2}
              />
            </Item>
            <Item floatingLabel last>
              <Label>Verify Password</Label>
              <Input
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={text =>
                  this.setState({ input3: text, password2: text })
                }
                value={this.state.input3}
              />
            </Item>
          </Form>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingTop: 10,
              justifyContent: "center"
            }}
          >
            {this.state.show && (
              <Text style={{ color: "#FF5733" }}>
                {this.state.errorMessage}
              </Text>
            )}
          </View>

          <View style={{ paddingTop: 10 }}>
            <Divider borderColor="#000" color="#000" orientation="center">
              User Type
            </Divider>
            <ListItem
              onPress={() => this.setState({ itemSelected: "customer" })}
            >
              <Left>
                <Text>Customer</Text>
              </Left>
              <Right>
                <Radio selected={this.state.itemSelected === "customer"} />
              </Right>
            </ListItem>
            <ListItem
              onPress={() => this.setState({ itemSelected: "merchant" })}
            >
              <Left>
                <Text>Merchant</Text>
              </Left>
              <Right>
                <Radio selected={this.state.itemSelected === "merchant"} />
              </Right>
            </ListItem>
          </View>

          {this.state.itemSelected === "customer" && (
            <View>
              <Form>
                <Item floatingLabel>
                  <Label>Name</Label>
                  <Input
                    autoCorrect={false}
                    onChangeText={text =>
                      this.setState({ customer_name: text })
                    }
                    value={this.state.customer_name}
                  />
                </Item>
              </Form>
              <Form>
                <Item floatingLabel>
                  <Label>Phone Number</Label>
                  <Input
                    autoCorrect={false}
                    onChangeText={text =>
                      this.setState({ customer_phone_number: text })
                    }
                    value={this.state.customer_phone_number}
                  />
                </Item>
              </Form>
            </View>
          )}

          {this.state.itemSelected === "merchant" && (
            <View>
              <Form>
                <Item floatingLabel>
                  <Label>Store Name</Label>
                  <Input
                    autoCorrect={false}
                    onChangeText={text =>
                      this.setState({ merchant_name: text })
                    }
                    value={this.state.merchant_name}
                  />
                </Item>
              </Form>
              <Form>
                <Item floatingLabel>
                  <Label>Phone Number</Label>
                  <Input
                    autoCorrect={false}
                    onChangeText={text =>
                      this.setState({ merchant_phone_number: text })
                    }
                    value={this.state.merchant_phone_number}
                  />
                </Item>
              </Form>
            </View>
          )}

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginTop: 20,
              marginBottom: 50
            }}
          >
            <Button
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "black",
                borderRadius: 20,
                width: "100%"
              }}
              primary
              onPress={() => this._handleCreate()}
            >
              <Text style={{ textAlign: "center" }}> Create Account </Text>
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
    paddingRight: 20
  },
  buttonContainer: {
    backgroundColor: "#2980b6",
    paddingVertical: 15
  }
});
