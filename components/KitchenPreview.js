import React from 'react';
import { View, StyleSheet, Button, Image } from 'react-native';

export default class KitchenPreview extends React.Component {

    render() {
        return (
            <View style={styles.photosContainer}>
                <View style={styles.photosRow}>
                    <Image style={{height:100, width:100}} source={require('../assets/images/hotsoursoup.jpg')}/>
                    <Image style={{height:100, width:100}} source={require('../assets/images/friedrice.jpg')}/>
                    <Image style={{height:100, width:100}} source={require('../assets/images/hotsoursoup.jpg')}/>
                </View>
                <View style={styles.photosRow}>
                    <Image style={{height:100, width:100}} source={require('../assets/images/friedrice.jpg')}/>
                    <Image style={{height:100, width:100}} source={require('../assets/images/hotsoursoup.jpg')}/>
                    <Image style={{height:100, width:100}} source={require('../assets/images/friedrice.jpg')}/>
                </View>
            </View>

            
        );
    }
}               



const styles = StyleSheet.create({
    photosContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-evenly"
    },
    
    photosRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        
    }
})