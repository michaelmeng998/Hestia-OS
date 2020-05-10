import React from "react";
import { 
    View, 
    StyleSheet, 
    TouchableOpacity, 
    LayoutAnimation,
    Platform,
    UIManager,
    TouchableHighlight,
    Animated,
    Alert } from "react-native";

import {
  Text,
} from "native-base";

import moment from "moment";
import firebase from "react-native-firebase";
import localization from "../constants/Localization";

import Icon from 'react-native-vector-icons/Ionicons';

export default class CollapsibleCard extends React.Component {
    CustomLayoutAnimation = {
        duration: 200,
        create: {
            property: LayoutAnimation.Properties.scaleXY,
            type: LayoutAnimation.Types.easeInEaseOut
        },
        update: {
            property: LayoutAnimation.Properties.scaleXY,
            type: LayoutAnimation.Types.easeInEaseOut
        },
        delete: {
            duration: 100,
            property: LayoutAnimation.Properties.scaleXY,
            type: LayoutAnimation.Types.easeInEaseOut
        },
    }

    constructor(props) {
        super(props);
    
        this.state = { expanded: props.expanded }
    
        if (Platform.OS === 'android') {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.expanded != prevProps.expanded) {
            // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            LayoutAnimation.configureNext(this.CustomLayoutAnimation);
            this.setState({ expanded: !this.state.expanded });
        }
    }

    _toggle = () => {
        let orderId = this.props.orderId ? this.props.orderId : null;
        this.props.toggleCard(this.props.orderDate, !this.state.expanded, orderId);
    }

    // changeLayout = () => {
    //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    //     this.setState({ expanded: !this.state.expanded });
    // }

    collapsibleIcon = () => {
        let direction = this.state.expanded ? "up" : "down";
        return (
            <Icon style={{color: 'white', flex: 1}} size={25} name={`ios-arrow-drop${direction}`}></Icon> 
        );
    }
    
    render() {
    return (
        <View style={[this.props.cardStyles.container, styles.container]}>
            <View style={styles.btnTextContainer}>
                <TouchableOpacity activeOpacity={0.8} 
                onPress={() => this._toggle()} 
                style={styles.Btn}>
                    <View style={{flex: 14}}>
                        <Text style={styles.btnText}>{this.props.cardTitle}</Text>
                        { this.props.cardSubtitleTotal &&
                            <View>
                                <Text style={styles.btnText}>{this.props.cardSubtitlePhone}</Text>   
                                <Text style={styles.btnText}>{this.props.cardSubtitleTotal}</Text>
                                <View style={{height: 2, backgroundColor: this.props.orderColor}}></View>
                            </View>
                        }
                    </View>
                    { this.collapsibleIcon() }
                </TouchableOpacity>
                <View style={{ height: this.state.expanded ? null : 1, overflow: 'hidden' }}>
                    { this.props.children }
                </View>
            </View>
        </View>
    );
    }
}

const styles = StyleSheet.create({
    container: {
    //   paddingTop: (Platform.OS === 'ios') ? 20 : 0
    },
  
    text: {
      fontSize: 17,
      color: 'black',
      padding: 10
    },
  
    btnText: {
    //   textAlign: 'center',
      color: 'white',
    //   fontSize: 10
    },
  
    btnTextContainer: {
    },
  
    Btn: {
      flexDirection: 'row',
      justifyContent: 'space-between',

      padding: 10,
      backgroundColor: 'black',

      borderRadius: 5,
    },
  });