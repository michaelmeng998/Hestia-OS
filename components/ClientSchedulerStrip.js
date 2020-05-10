import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';

import firebase from 'react-native-firebase';
import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';

import { connect } from 'react-redux';

class ClientSchedulerStrip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openDays: {},
            // put here states since this will change depending on which days kitchen is open
            customDatesStyles: [],
            markedDatesList: [],
            datesBlacklist: [], 
        }
        this.today = moment();
        this.lookAhead = 30; // days allowed to look ahead
        this.maxDate = this.today.clone();
        this.maxDate.add(this.lookAhead, 'days');

        this.kitchenId = this.props.kitchenId;

        this.unsubscribe_merchant_schedule = null;

    }

    componentDidMount() {
        this.merchant_schedule = firebase.firestore().collection('merchants').doc(this.kitchenId).collection('schedule');

        this.unsubscribe_merchant_schedule = this.merchant_schedule.onSnapshot(this._onCollectionUpdateSchedule);
    }

    componentWillUnmount() {
        this.unsubscribe_merchant_schedule();
    }

    _onCollectionUpdateSchedule = (querySnapshot) => {
        var openDays = {};
        let markedDatesList = [];
        let datesBlacklist = []; // clear whenever snapshot updates
        querySnapshot.forEach((doc) => {
            var date = doc.id
            var openDay = doc.data()
            openDays[date] = { selected: false, marked: openDay.open, schedule: openDay.schedule }
        });

        for (var iDay = moment(this.today); iDay.diff(this.maxDate, 'days') <= 0; iDay.add(1, 'days')) {
            // check if day is available for delivery
            let iDayStr = iDay.format('YYYY-MM-DD'); // ISO format
            // check if in open_days && status is open
            if ((iDayStr in openDays) && openDays[iDayStr].marked) {
                // Alternative using dots to indicate availability
                // Need to store as Date objects
                markedDatesList.push({
                    date: iDay.toDate(),
                    dots: [
                        {
                            color: 'green'
                        }
                    ],
                });
            } else {
                datesBlacklist.push({
                    start: iDay.toDate(),
                    end: iDay.toDate(),
                });
            }
        }

        // need to disable 6 day cushion before and after range due to weekly strip view
        var minLowerBounds = moment(this.today).add(-6, 'days'); 
        var minUpperBounds = moment(this.today).add(-1, 'days');
        var maxLowerBounds = moment(this.maxDate).add(1, 'days');
        var maxUpperBounds = moment(this.maxDate).add(6, 'days');

        datesBlacklist.push(
            {
            start: minLowerBounds.toDate(),
            end: minUpperBounds.toDate(),
            },
            {
            start: maxLowerBounds.toDate(),
            end: maxUpperBounds.toDate(),
            }
        );

        this.setState({
            openDays: openDays,
            markedDatesList: markedDatesList,
            datesBlacklist: datesBlacklist,
        })
    }

    // TODO: look into orders from different timezones?
    _selectedDate = (date) => {
        if (date.format('YYYY-MM-DD') != this.props.date) {
            // Erase cart - account for orders that are no longer available
            this.props.eraseCart();
            this.props.selectScheduleDate(date.format('YYYY-MM-DD'));
        }
    }

    render() {
        return (
            // TODO: Implement calendar transition
            // calendarAnimation={{type: 'sequence', duration: 50}} -> a bit janky
            <View>
                { this.props.date && 
                <CalendarStrip
                    minDate={this.today}
                    maxDate={this.maxDate}
                    markedDates={this.state.markedDatesList}

                    onWeekChanged={(date) => {
                        console.log("on week changed date : " + date.format('YYYY-MM-DD'));
                    }}
                    
                    selectedDate={this.props.date}

                    onDateSelected={(date) => {
                        this._selectedDate(date);
                    }}
                    daySelectionAnimation={{type: 'border', duration: 50, borderWidth: 1, borderHighlightColor: "green"}}
                    style={{height: 100, paddingTop: 20, paddingBottom: 10}}
                    calendarHeaderStyle={styles.defaultColor}
                    dateNumberStyle={styles.defaultColor}
                    dateNameStyle={styles.defaultColor}
                    highlightDateNumberStyle={styles.defaultColor}
                    highlightDateNameStyle={styles.defaultColor}
                    datesBlacklist={this.state.datesBlacklist}
                    disabledDateNameStyle={styles.disabledColor}
                    disabledDateNumberStyle={styles.disabledColor}
                    iconContainer={{flex: 0.1}} />  
                }
            </View>
        );
    }
}

const mapStateToProps= (state) => {
    console.log("props selected date: " + state.order.delivery.date);
    return {
        date: state.order.delivery.date
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectScheduleDate:(date) => dispatch({
            type: 'CLIENT_SELECT_DATE',
            payload: date
        }),
        eraseCart: () =>
        dispatch({
          type: "ERASE_CART"
        })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClientSchedulerStrip);

const styles = StyleSheet.create({
    disabledColor: {
        color: '#BEBEBE',
    },
    defaultColor: {
        color: 'black',
    },
})