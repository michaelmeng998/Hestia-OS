import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { Container, Content, Button, Text, List, ListItem, Accordion, Left, Right } from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';
import RNGooglePlaces from 'react-native-google-places';
// import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
// import _ from 'lodash';
import firebase from 'react-native-firebase'
import localization from '../constants/Localization';
import { connect } from 'react-redux';

class LocationPickerScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        // Reference: https://github.com/react-navigation/react-navigation/issues/2379
        title: typeof(navigation.state.params) ==='undefined' || typeof(navigation.state.params.title) === 'undefined' ? localization.locations : navigation.state.params.title,
    });

    constructor(props) {
        super(props);
        // Treat this.state as if it were immutable.
        this.state = {
            locations: [],
        }

        var user = firebase.auth().currentUser;
        this.user_id = user.uid;
        this.unsubscribe_bookmark_locations = null;
        this.bookmark_locations = null;

        this.placeFields = ['placeID', 'location', 'name', 'address', 'types'];

        this.userType = this.props.navigation.state.params.userType;
        this.reduxActionType = this.props.navigation.state.params.reduxActionType;
        this.bookmarkCollection = "bookmarked_locations";
        this.props.navigation.setParams({ title: localization.locations });
    }

    componentDidMount() {
        /* Structure of documents in the collection...
        doc {
            placeId: assumption that it's unique
            name:
            address:
        }
        */
       this.bookmark_locations = firebase.firestore().collection(this.userType).doc(this.user_id).collection(this.bookmarkCollection);
       this.unsubscribe_bookmark_locations = this.bookmark_locations.onSnapshot(this._onCollectionUpdateBookmarkedLocations);
    }
    componentWillUnmount() {
        this.unsubscribe_bookmark_locations();
    }
    
    _onCollectionUpdateBookmarkedLocations = (querySnapshot) => {
        const bookmarkedLocations = [];
        querySnapshot.forEach((doc) => {
            const { placeID, name, address } = doc.data()
            // use placeID in place of firebase generated id
            const uuid = doc.id; // Clarification needed, firebase id?

            bookmarkedLocations.push({
                placeID: placeID,
                name: name,
                address: address
            });
        });

        this.setState({
            locations: bookmarkedLocations
        })
    }

    // TODO: can be optimized
    _duplicateLocation(place) {
        for(value in this.state.locations) {
            if (place.placeID == this.state.locations[value].placeID) {
                return true;
            }
        }
        return false;
    }

    openSearchModal(pFields) {
        RNGooglePlaces.openAutocompleteModal({}, pFields)
        .then((place) => {
            // update firebase
            this.bookmark_locations.doc(place.placeID).set({
                placeID: place.placeID,
                name: place.name,
                address: place.address,
            }).then(function() {
                console.log("Location successfully bookmarked");
            })
            .catch(function(error) {
                console.error("Error bookmarking location: ", error);
            });

        })
        .catch(error => console.log(error.message));  // error is a Javascript Error object
    }

    _removeLocation(place) {
        this.bookmark_locations.doc(place.placeID).delete().then(function() {
            console.log("Bookmarked location successfully removed");
        }).catch(function(error) {
            console.error("Error removing bookmarked location: ", error);
        });
    }

    _addDeliveryLocationToDate = (place) => {
        // don't update firebase yet, update ScheduleScreen with added location
        // update firebase with list of locations when user clicks update button for given date
        this.props.addLocation(place, { type: this.reduxActionType });
        this.props.navigation.goBack();
        return;
    }

    render() {
        return(
            <Container>
                <Content style={styles.contentContainer}>
                    <View>
                        <View style={styles.flexRow}>
                            <Text style={{fontWeight: "bold"}}>
                                {localization.bookmarkedAddresses}
                            </Text>
                            <TouchableOpacity style={styles.marginSearchIcon} onPress={() => this.openSearchModal(this.placeFields)}>
                                <Icon size={30} name="ios-search"></Icon>
                            </TouchableOpacity>
                        </View>
                        {
                            this.state.locations.map((value, key) =>
                                <ListItem onPress={()=> this._addDeliveryLocationToDate(value)}>
                                    <Left style={{flexDirection:"column"}}>
                                        <View>
                                            <Text>{value.name}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.addressColor}>{value.address}</Text>
                                        </View>
                                    </Left>
                                    <Right>
                                        <TouchableOpacity style={styles.marginSearchIcon} onPress={() => this._removeLocation(value)}>
                                            <Icon size={30} name="ios-trash"></Icon>
                                        </TouchableOpacity>
                                    </Right>
                                </ListItem>
                            )
                        }
                    </View>
                </Content>
            </Container>
          );
    }

};

const mapDispatchToProps = (dispatch) => {
    return {
        addLocation:(place, actionType) => dispatch({
            type: actionType.type,
            payload: place
        }),
    }
}

export default connect(null, mapDispatchToProps)(LocationPickerScreen);

const styles = StyleSheet.create({
    contentContainer: {
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    addressColor: {
        color: '#686868',
    },
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    marginSearchIcon: {
        marginRight: 10,
    }
})