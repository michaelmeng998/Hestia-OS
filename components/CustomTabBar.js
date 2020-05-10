import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { connect } from 'react-redux';
import CustomTabBarItem from "./CustomTabBarItem";

class CustomTabBar extends React.Component {

    navigationHandler = (routeName) => {
        this.props.navigation.navigate(routeName);
    }

    render() {
      const {navigation} = this.props;
      // a navigator component receives a routes object, which holds all the routes of your tab bar
      const routes = navigation.state.routes;
  
      return (
        // <SafeAreaView>
          <View style={styles.container}>
            {routes.map((route, index) => {
              return (
                <View style={styles.tabBarItem} key={route.routeName}>
                    <TouchableOpacity onPress={() => this.navigationHandler(route.routeName)}>
                        <CustomTabBarItem
                        routeName={route.routeName}
                        focused={navigation.state.index === index}
                        index={index}
                        />
                    </TouchableOpacity>
                </View>
              );
            })}
          </View>
        // </SafeAreaView>
      );
    }
}
  
const mapStateToProps = (state) => {
    return {
        settings: state.settings
    };
};
  
export default connect(mapStateToProps)(CustomTabBar);

  const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignContent: 'center',
        height: 70,
        width: '100%',
        borderTopWidth: 0.5,
        borderTopColor: 'lightgray',
        paddingTop: 10,
    },
    tabBarItem: {
        flex: 1,
        alignItems: 'center'
    }
});