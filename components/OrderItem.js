import React from 'react';
import { Alert, View, StyleSheet, TouchableHighlight, Text, Button, Image, Animated } from 'react-native';

import OrderMenuItem from '../components/OrderMenuItem'

export default class OrderItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            expanded: false,
            animaton: new Animated.Value()
        }
    }

    _setMaxHeight(event){
        this.setState({
            maxHeight   : event.nativeEvent.layout.height
        });
    }

    _setMinHeight(event){
        this.setState({
            minHeight   : event.nativeEvent.layout.height
        });
    }

    toggle(){
        let initialValue    = this.state.expanded? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
            finalValue      = this.state.expanded? this.state.minHeight : this.state.maxHeight + this.state.minHeight;
    
        this.setState({
            expanded : !this.state.expanded 
        });
    
        this.state.animation.setValue(initialValue);
        Animated.spring(    
            this.state.animation,
            {
                toValue: finalValue
            }
        ).start();  //Step 5
    }

    render() {
        return (
            <Animated.View styles={[styles.animtedContainer, {height: this.state.animation}]}>
                <TouchableHighlight onPress={() => this.toggle.bind(this)} underlayColor="white">
                    <View style={styles.orderHeader} onLayout={this._setMinHeight.bind(this)}>
        
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text>{this.props.customer.name}</Text>
                            <Text>{this.props.customer.address}</Text>
                            <Text>{this.props.distance}km</Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                            <Text>{this.props.orderTime} mins</Text>
                            <Text>{this.props.customer.number}</Text>
                            <Text></Text>
                        </View>

                    </View>
                </TouchableHighlight>

                <View style={styles.orderDetailsContainer} onLayout={this._setMaxHeight.bind(this)}>
                    <View style={styles.orderDetails}>
                        <OrderMenuItem item={{name: "Manchurian Soup", quantity: 2}}/>
                        <OrderMenuItem item={{name: "House Fried Rice", quantity: 1}}/>
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    animatedContainer: {
        overflow: "hidden"
    },
    orderHeader: {
        marginTop: 10,
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#ffcc66"
    },
    orderDetailsContainer: {
        backgroundColor: "#efefef",
        paddingBottom: 5
    },
    orderDetails: {
        paddingLeft: 5,
        paddingRight: 5,
    }
})
