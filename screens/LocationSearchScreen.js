import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { Container, Content, Button, Text, List, ListItem, Accordion} from 'native-base';
import RNGooglePlaces from 'react-native-google-places';

export default class LocationSearchScreen extends React.Component {
    static navigationOptions = {
        title: "Add Location"
    };

    constructor(props) {
        super(props);
    }

    openSearchModal() {
        RNGooglePlaces.openAutocompleteModal()
        .then((place) => {
            console.log(place);
            // place represents user's selection from the
            // suggestions and it is a simplified Google Place object.
        })
        .catch(error => console.log(error.message));  // error is a Javascript Error object
    }

    render() {
        return(
            <Container>
                <View style={{flex: 1}}>
                    <Text>
                        locations to add...
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.openSearchModal()}
                    >
                        <Text>Pick a Place</Text>
                    </TouchableOpacity>
                </View>
            </Container>
          );
    }

};

const styles = StyleSheet.create({
    queryView: {
        // height: 1
    },
    flexCol: {
        // flexDirection: 'column',
        // justifyContent: 'space-between',
    }
})