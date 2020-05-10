import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  SectionList,
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
import { connect } from "react-redux";

import CheckoutBar from "../components/CheckoutBar";

class CartScreen extends React.Component {
  static navigationOptions = {
    title: "Cart"
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.contentContainer}>
          <View>
            <Text style={styles.subTitle}>Items</Text>
            <List>
              {this.props.order.items.map((value, key) => (
                <ListItem style={styles.listItem} key={key}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ flex: 2, fontSize: 20 }}>{value.name}</Text>
                    <Text style={{ flex: 1, fontSize: 20 }}>
                      x {value.quantity}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 20 }}>
                      {"\u0024"}
                      {(value.quantity * value.price).toFixed(2)}
                    </Text>
                  </View>
                  {value.customizationOn ? (
                    value.customization.map((customization, key) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-evenly",
                          marginTop: 5,
                          marginLeft: 10
                        }}
                      >
                        <Text style={{ flex: 1, color: "gray" }}>
                          {customization.headerName}:
                        </Text>
                        <Text style={{ flex: 2, color: "gray" }}>
                          {customization.optionName}
                        </Text>
                        <Text style={{ flex: 1, color: "gray" }}>
                          {"\u0024"}
                          {parseFloat(customization.optionPrice).toFixed(2)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View></View>
                  )}
                </ListItem>
              ))}
            </List>
          </View>
        </Content>
        <Footer>
          <FooterTab style={{ flexDirection: "column" }}>
            <CheckoutBar navigation={this.props.navigation}></CheckoutBar>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    order: state.order
  };
};

export default connect(mapStateToProps)(CartScreen);

const styles = StyleSheet.create({
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff"
  },
  subTitle: {
    paddingTop: 10,
    fontWeight: "bold"
  },
  listItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 5
    // justifyContent: "flex-start"
  },
  quantityContainer: {
    flexDirection: "row"
  }
});
