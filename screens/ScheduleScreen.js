  
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';

import { Container, Button, Content, Text, List, ListItem, Accordion, Left, Right } from 'native-base';
import DateTimePicker from '@react-native-community/datetimepicker';

import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import _ from 'lodash';
import firebase from 'react-native-firebase'
import { connect } from 'react-redux';

import SwitchButton from '../components/SwitchButton'
import moment from 'moment';
import localization from '../constants/Localization';
import colors from '../constants/Colors';

class ScheduleScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        // Reference: https://github.com/react-navigation/react-navigation/issues/2379
        title: typeof(navigation.state.params) ==='undefined' 
        || typeof(navigation.state.params.title) === 'undefined' 
        ? localization.schedule : navigation.state.params.title,
    });

    constructor(props) {
        super(props);
        this.today = new Date();
        this.tomorrow = new Date();
        this.tomorrow = (this.tomorrow.setDate(this.tomorrow.getDate() + 1))
        this.state = {
            open_days: {},
            changed: false
        }

        this.today = moment().format('YYYY-MM-DD');

        this.pickup = localization.pickup;
        this.delivery = localization.delivery;
        this.active = localization.open;
        this.closed = localization.closed;

        this.deliveryDot = {key:this.delivery, color: this.props.scheduler.orderColor.delivery };
        this.pickupDot = {key: this.pickup, color: this.props.scheduler.orderColor.pickup };
        this.openDot = {key: this.active, color: 'green'};
        this. closedDot = {key: this.closed, color: 'red'};

        this.unsubscribe_schedule = null;

        this.props.navigation.setParams({ title: localization.schedule });
    }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        this.merchant_id = user.uid;
        this.merchant_schedule = firebase.firestore().collection('merchants').doc(this.merchant_id).collection('schedule');
        this.unsubscribe_schedule = this.merchant_schedule.onSnapshot(this._onCollectionUpdateSchedule);
    }

    componentDidUpdate(prevProps) {
        if (this.props.settings.language != prevProps.settings.language) {
          this.props.navigation.setParams({ title: localization.schedule });
        }
    }

    componentWillUnmount() {
        this.unsubscribe_schedule();
    }

    _onCollectionUpdateSchedule = (querySnapshot) => {
        var open_days = {};

        // schedule: [ { location:{ placeID, name, address }, hours: [] } ]
        // TODO: option to disable/update locations/hours too, not just the entire day
        querySnapshot.forEach((doc) => {
            var date = doc.id
            var openDay = doc.data()
            open_days[date] = { selected: false, marked: openDay.open, schedule: openDay.schedule, }

            // only add custom style to days that are >= today
            if (date >= this.today) {
                open_days[date].dots = this._getCustomStyle(open_days[date].marked, open_days[date].schedule);
            }
        });

        this.setState({
            changed: false
        })

        this.setState((prevState) => {
            return {...prevState, open_days};
        })
    }

    // style based off of 
   _getCustomStyle = (isOpen, schedule) => {
        let dots = [];
        let deliveryCount = 0;
        let pickupCount = 0;

        if (!isOpen) {
            dots.push(this.closedDot);
        } else {
            dots.push(this.openDot);
        }
        
        if (schedule != null) {
            if (schedule.deliverySchedule != null) {
                deliveryCount = schedule.deliverySchedule.length;
            }
            if (schedule.pickupSchedule != null) {
                pickupCount = schedule.pickupSchedule.length;
            }
        }

        if (deliveryCount && pickupCount) {
            dots.push(this.deliveryDot);
            dots.push(this.pickupDot);
        } else if (deliveryCount) {
            dots.push(this.deliveryDot);
        } else if (pickupCount) {
            dots.push(this.pickupDot);
        }
        return dots;
    }

    _selectDate = (day) => {
        // let open_days = JSON.parse(JSON.stringify(this.state.open_days));
        let open_days = _.cloneDeep(this.state.open_days);

        Object.entries(open_days).forEach(x => x[1].selected = false);
        
        if (day in open_days) {
            open_days[day] = { 
                selected: !open_days[day].selected, 
                marked: open_days[day].marked, 
                schedule: open_days[day].schedule ? open_days[day].schedule : [],
                dots: open_days[day].dots, }
        } else {
            open_days[day] = { selected: true, marked: false, schedule: [] }
        }

        // update global schedule var
        this.props.changeSelection({
            date: day,
            marked: open_days[day].marked,
            schedule: open_days[day].schedule,
        })
        
        this.setState({
            changed: true
        })

        this.setState((prevState) => {
            return {...prevState, open_days};
        })

    }

    // use global store scheduler state to update firebase
    _updateShopSchedule = () => {
        var date = this.props.scheduler.selectedDate;
        this.merchant_schedule.doc(date).set({
            open: this.props.scheduler.marked,
            schedule: this.props.scheduler.schedule,
        }).then(function() {
            console.log("Schedule successfully updated for date: " + date);
        })
        .catch(function(error) {
            console.error("Error updating " + date + " schedule: ", error);
        });
    }

    toggleOpenDay = (open) => {
        this.props.toggleAvailable(open)
    }

    // TODO: cannot remove a location until resolving associated pending orders 
    _removeLocation = (place) => {
        this.props.removeDeliveryLocation({placeID: place.placeID});
    }

    _getOrderTypeStyle(orderType) {
        let bColor;
        switch(orderType) {
            case this.props.scheduler.orderTypes.delivery:
                bColor = this.props.scheduler.orderColor.delivery;
                break;
            case this.props.scheduler.orderTypes.pickup:
                bColor = this.props.scheduler.orderColor.pickup;
                break;
            default:
                bColor = "gray"; // should never happen
                break;
        }
        return {
            ...styles.timeIButton,
            backgroundColor: bColor,

            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            
            elevation: 5,
        }
    }

    _confirmRemovePickupLocation(place) {
        Alert.alert(
            localization.removeLocation,
            place.name,
            [
              {
                text: localization.cancel,
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: localization.ok, onPress: () => this._removeLocation(place)},
            ],
            {cancelable: false},
        );
    }

    _confirmUpdate() {
        Alert.alert(
            localization.confirmUpdate,
            '',
            [
              {
                text: localization.cancel,
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: localization.ok, onPress: () => this._updateShopSchedule()},
            ],
            {cancelable: false},
        );
    }

    render() {
        console.log(this.props.scheduler);
        return (
            <Container>
                <Content style={styles.contentContainer}>
                    <Calendar
                        style={styles.calendarCushion}
                        minDate={this.today}
                        onDayPress={(day) => this._selectDate(day.dateString)}
                        markingType={'multi-dot'}
                        markedDates={this.state.open_days}
                    />
                    {/* Scheduling color coded legend */}
                    <View style={[styles.flexRow, styles.legend]}>
                        <View style={[{flexDirection: 'column'}, styles.padRow, styles.marginRow]}>
                            <View style={[styles.circleShape, {backgroundColor: this.props.scheduler.orderColor.delivery}]} />
                            <Text>{localization.delivery}</Text>
                        </View>
                        <View style={[{flexDirection: 'column'}, styles.padRow, styles.marginRow]}>
                            <View style={[styles.circleShape, {backgroundColor: this.props.scheduler.orderColor.pickup}]} />
                            <Text>{localization.pickup}</Text>
                        </View>
                        <View style={[{flexDirection: 'column'}, styles.padRow, styles.marginRow]}>
                            <View style={[styles.circleShape, {backgroundColor: "green"}]} />
                            <Text>{localization.open}</Text>
                        </View>
                        <View style={[{flexDirection: 'column'}, styles.padRow, styles.marginRow]}>
                            <View style={[styles.circleShape, {backgroundColor: "red" }]} />
                            <Text>{localization.closed}</Text>
                        </View>
                    </View>

                    { this.state.changed &&  
                    <View style={{paddingTop: 10}}>
                        {/* AVAILABILITY STATUS */}
                        <View style={[styles.flexRow, styles.sectionBorder]}>
                            <Left style={{flexDirection:"row"}}>
                                <Text style={{ fontWeight: 'bold' }}>{ this.props.scheduler.marked ? localization.open : localization.closed }</Text>
                            </Left>
                            <Right style={{flexDirection:"column"}}>
                                <SwitchButton
                                trueColor = {'green'}
                                falseColor = {'red'}
                                toggleOpen = {this.toggleOpenDay}
                                open = {this.props.scheduler.marked} />
                            </Right>
                        </View>


                        {/* DELIVERY */}
                        <View style={styles.sectionBorder}>
                            <View style={styles.flexRow}>
                                {/* { color: this.props.scheduler.orderColor.delivery } */}
                                <Text style={[styles.padRow, styles.sectionTitleStyle, { fontWeight: 'bold' }]}>{localization.deliverySchedule}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('TimePicker', { isDelivery: true })}>
                                    <Icon size={25} name="ios-time">
                                        <Icon size={25} name="ios-add"></Icon>
                                    </Icon>
                                </TouchableOpacity>
                            </View>

                            { !(this.props.scheduler.schedule.deliverySchedule == null) && 
                            <View style={styles.timeIntervalList}>
                                {
                                    this.props.scheduler.schedule.deliverySchedule.map((timeInterval, key) => 
                                        <TouchableOpacity key={key} onPress={() => console.log("time pressed")}>
                                            <View style={this._getOrderTypeStyle(this.props.scheduler.orderTypes.delivery)}>
                                                <Text style={[{textAlign: 'center', color: 'white'}, styles.timeIntervalList]}>{moment(timeInterval.startTime).format("h:mm A")}</Text>
                                                <Text style={[{textAlign: 'center', color: 'white'}, styles.timeIntervalList]}>{moment(timeInterval.endTime).format("h:mm A")}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                            }
                        </View>

                        {/* { color: this.props.scheduler.orderColor.pickup } */}
                        {/* PICKUP */}
                        <View style={styles.sectionBorder}>
                            <View style={[styles.flexRow, { paddingBottom: 20,}]}>
                            <Text style={[styles.padRow, styles.sectionTitleStyle, { fontWeight: 'bold' }]}>{localization.pickupSchedule}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('LocationPicker', { userType: 'merchants', reduxActionType: 'MERCHANT_ADD_LOCATION' })}>
                                <Icon size={25} name="ios-pin">
                                    <Icon size={25} name="ios-add"></Icon>
                                </Icon>
                                </TouchableOpacity>
                            </View>
                            {   !(this.props.scheduler.schedule.pickupSchedule == null) && 
                                this.props.scheduler.schedule.pickupSchedule.map((value, key) => 
                                    <View key={key} style={styles.customListItem}>
                                        {/* <ListItem onPress={()=> console.log("address to select: " + value.location.address)}> */}
                                        <View style={{flexDirection:"row"}}>
                                            <Left>
                                                <View>
                                                    <Text>{value.location.name}</Text>
                                                </View>
                                                <View>
                                                    <Text style={styles.addressColor}>{value.location.address}</Text>
                                                </View>
                                            </Left>
                                            {/* <Right> */}
                                            <TouchableOpacity onPress={() => this._confirmRemovePickupLocation(value.location)}>
                                                <Icon size={25} name="ios-trash"></Icon>
                                            </TouchableOpacity>
                                            {/* </Right> */}
                                        </View>
                                        <View style={[styles.lineDividerStyle, { marginBottom: 10,}]}></View>
                                        {/* </ListItem> */}

                                        {/* List available delivery time intervals */}
                                        <View style={{flexDirection:"row-reverse"}}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('TimePicker', { isDelivery: this.isDelivery, value })}>
                                                <Icon size={25} name="ios-time">
                                                    <Icon size={25} name="ios-add"></Icon>
                                                </Icon>
                                            </TouchableOpacity>
                                        </View>                                    
                                        
                                        <View style={styles.timeIntervalList}>
                                            {
                                                value.hours.map((timeInterval, key) => 
                                                    <TouchableOpacity key={key} onPress={() => console.log("")}>
                                                        <View style={this._getOrderTypeStyle(this.props.scheduler.orderTypes.pickup)}>
                                                            <Text style={[{textAlign: 'center', color: 'white'}, styles.timeIntervalList]}>{moment(timeInterval.startTime).format("h:mm A")}</Text>
                                                            <Text style={[{textAlign: 'center', color: 'white'}, styles.timeIntervalList]}>{moment(timeInterval.endTime).format("h:mm A")}</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            }
                                        </View>
                                    </View>
                                )
                            }
                        </View>

                        <View style={styles.updateButton}>
                            <Button style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: '100%'}} primary onPress={() => this._confirmUpdate()}>
                                <Text style={{textAlign: 'center'}}>{localization.updateShopSchedule}</Text>
                            </Button>
                        </View>
                    </View>
                    }
                </Content>
            </Container>
        );
    }
}; 

const mapStateToProps = (state) => {
    return {
        scheduler: state.scheduler,
        settings: state.settings
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        changeSelection:(day) => dispatch({
            type: 'SELECT_SCHEDULE_DAY',
            payload: day
        }),
        toggleAvailable:(open) => dispatch({
            type: 'TOGGLE_OPEN_DAY',
            payload: open
        }),
        removeDeliveryLocation:(place) => dispatch({
            type: 'MERCHANT_REMOVE_PICKUP_LOCATION',
            payload: place
        }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);

const styles = StyleSheet.create({
    contentContainer: {
        paddingTop: 10,
        backgroundColor: colors.bgColor
    },
    flexCol: {
        flexDirection: 'column',
    },
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    legend: {
        padding: 10,
        backgroundColor: colors.secColor
        // borderWidth: 1,
        // borderColor: 'black',
        // borderRadius: 10
    },
    sectionBorder: {
        padding: 15,
        marginBottom: 10,
        backgroundColor: colors.secColor
    },
    timeIButton: {
        flexDirection: 'column',
        marginRight: 5,
        marginBottom: 5,
        padding: 8,
        borderRadius: 10,
    },
    timeIntervalList: {
        fontSize: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    padRow: {
        paddingRight: 10,
    },
    sectionTitleStyle: {
        paddingBottom: 20,
    },
    calendarCushion: {
        marginBottom: 10,
    },
    customListItem: {
        // borderColor: 'black',
        borderRadius: 7,
        // borderWidth:1,
        backgroundColor: colors.secColor,

        // IOS box shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        // Android box shadow        
        elevation: 10,

        padding: 25,
        marginBottom: 20,
    },
    lineDividerStyle: {
        paddingTop: 10,

        alignSelf:'stretch',
        width: "100%",

        borderBottomColor: "gray", 
        borderBottomWidth: StyleSheet.hairlineWidth, 
    },
    marginRow: {
        marginRight: 15,
    },
    circleShape: {
        width: 25,
        height: 25,
        borderRadius: 25/2,
    },
    updateButton: {
        flex: 1, 
        flexDirection: "row", 

        paddingLeft: 20,
        paddingRight: 20,
        
        marginTop: 20, 
        marginBottom: 50
    }
})