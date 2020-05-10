import React from "react";
import {
  StyleSheet,
  View
} from "react-native";
import {
  Text,
  Icon, 
} from "native-base";
import localization from "../constants/Localization";
import routeInfo from "../constants/Routes";

export default class CustomTabBarItem extends React.Component {

  render() {
    const focusColor = this.props.focused ? 'black' : 'lightgray';

    return (
        <View style={styles.tabBarItem}>
            <Icon style={{color: focusColor, fontSize: 25}} name={routeInfo[this.props.routeName].iconName} />
            <Text style={{color: focusColor, fontSize: 12}}>
                {localization[routeInfo[this.props.routeName].labelName]}
            </Text>
        </View>
    );
  }
}
const styles = StyleSheet.create({
  tabBarItem: {
    display: 'flex',
    alignItems: 'center',
  }
});
