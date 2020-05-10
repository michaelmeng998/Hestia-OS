import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { Button, Container, Content, Form, Item, Label, Input, List, ListItem, Text } from 'native-base';
import firebase from 'react-native-firebase'
import DateTimePicker from 'react-native-modal-datetime-picker';


export default class SchedulePicker extends React.Component {
	static navigationOptions = {
        title: 'Hestia',
    };

	constructor(props) {
        super(props);
        this.state = {
            times: [],
            isDateTimePickerVisible: false
        }
    };
    
    componentWillMount() {
        var user = firebase.auth().currentUser;
        var date = this.props.navigation.state.params.date.dateString;
        this.merchant_id = user.uid;
        console.log(date);
        this.merchant_schedule = firebase.firestore().collection('merchants').doc(this.merchant_id).collection('schedule').doc(date).collection('open_times');
        this.unsubscribe_schedule = this.merchant_schedule.onSnapshot(this._onCollectionUpdateSchedule)
    }

    _onCollectionUpdateSchedule = (querySnapshot) => {
        var getTimes = []

        querySnapshot.forEach((doc) => {
            var {start, end} = doc.data();
            var interval = {start: start, end: end}
            getTimes.push(interval)
        });


        this.setState({
            times: getTimes
        })
    }

    _handleDatePicked = (id) => {

    }

    _showDatePicker = () => {
        this.setState({
            isDateTimePickerVisible: true
        })
    }
    _hideDateTimePicker = () => {
        this.setState({
            isDateTimePickerVisible: false
        })
    }

	render() {
		return (
			<Container>
				<Content style={styles.contentContainer}>

                    <View style={styles.buttonRow}>
                        <Button rounded onPress={() => this._showDatePicker()} style={styles.addTimeButton}>
                            <Text>Add Time</Text>
                        </Button>
                    </View>

                    <DateTimePicker
                        mode='time'
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={(id) => this._handleDatePicked(id)}
                        onCancel={() => this._hideDateTimePicker()}
                    />
                    <List>
                            {
                                this.state.times.map((value, key) => 
                                    <ListItem style={styles.listItem}
                                    key={key}>
                                        <Text>{value.start}</Text>
                                        <Text>{value.end}</Text>
                                    </ListItem>
                                )
                            }
                    </List>
				</Content>
			</Container>
        )
	}
}

const styles = StyleSheet.create({
	contentContainer: {
        flex: 1,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    addTimeButton: {
        backgroundColor: '#ffcc66',
    },
	buttonContainer:{
        backgroundColor: '#2980b6',
        paddingVertical: 15
    },
});
    