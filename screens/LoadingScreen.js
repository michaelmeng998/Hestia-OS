import React from 'react'
import { View, Text, AsyncStorage, ActivityIndicator, StyleSheet } from 'react-native'
import firebase from 'react-native-firebase'

export default class LoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.merchant_ref = firebase.firestore().collection('merchants');
		this.customer_ref = firebase.firestore().collection('customers');
        this.unsubscribe = null;
    }

    componentDidMount() {
        this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
            if (user) {

                var uuid = user.uid;

                this.customer_ref.doc(uuid).get().then((obj) => {
                    if (obj.exists) { 
                        this.props.navigation.navigate('Customer');
                    } else {
                        this.merchant_ref.doc(uuid).get().then((obj) => {
                            if (obj.exists) {
                                this.props.navigation.navigate('Kitchen');
                            }
                            else {
                                firebase.auth().signOut();
                                this.props.navigation.navigate('Auth');
                            }
                        });
                    }
                });
            } else {
                this.props.navigation.navigate('Auth');
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }
    
      // Fetch the token from storage then navigate to our appropriate place
    // _bootstrapAsync = async () => {
    //     const userToken = await AsyncStorage.getItem('userToken');

    //     // This will switch to the App screen or Auth screen and this loading
    //     // screen will be unmounted and thrown away.
    //     this.props.navigation.navigate(userToken ? 'Main' : 'Auth');
    // };

    render() {
        return (
            <View style={styles.container}>
                <Text>Loading</Text>
                <ActivityIndicator style={{paddingTop: 15}}size='large'/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})