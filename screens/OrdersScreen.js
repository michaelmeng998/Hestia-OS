import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';

import { Container, Content, Button, Text, Icon, List, ListItem, Accordion} from 'native-base';

import Divider from 'react-native-divider'
import firebase from 'react-native-firebase'
import CalendarStrip from 'react-native-calendar-strip'
import { TabView, TabBar } from 'react-native-tab-view';

import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';

import { connect } from 'react-redux';
import moment from 'moment';
import OrderDaysList from '../components/OrderDaysList';
import localization from '../constants/Localization';
import colors from "../constants/Colors";

class OrdersScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        // Reference: https://github.com/react-navigation/react-navigation/issues/2379
        title: typeof(navigation.state.params) ==='undefined' || typeof(navigation.state.params.title) === 'undefined' ? localization.orders : navigation.state.params.title,
    });

    expandedFlags = {
        'pending': {},
        'confirmed': {},
        'delivered': {},
        'rejected': {}
    }

    constructor(props) {
        super(props);
        this.state = {
            orders: {},
            orderDaysList: [],
            
            startDayOfWeek: moment().isoWeekday(1).format('YYYY-MM-DD'),
            endDayOfWeek: moment().isoWeekday(7).format('YYYY-MM-DD'),
        }

        this.today = moment();

        this.pastDotColor = "green";
        this.upcomingDotColor = "#00FF00";
        
        // bind week changed callback to component instance
        this.onWeekChanged = this.onWeekChanged.bind(this);

        this.unsubscribe_orders = null;

        // Key value pair where key is orderId and 
        //  value indicates whether dropdown is open
        this.orderDayOpenFlag = {};
        this.orderOpenFlag = {};
        this.props.navigation.setParams({ title: localization.orders });
    }

    componentDidUpdate(prevProps) {
        if (this.props.settings.language != prevProps.settings.language) {
          this.props.navigation.setParams({ title: localization.orders });
          this.setState({});
        }
      }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        this.merchant_id = user.uid;
        this.merchant_orders = firebase.firestore().collection('merchants').doc(this.merchant_id).collection('orders');
        this.unsubscribe_orders = this.merchant_orders.onSnapshot(this._onCollectionUpdateOrders);

        // set language once on initial login
        this.merchant_loc_doc = firebase.firestore().collection('merchants')
        .doc(this.merchant_id).collection('settings').doc('localization');

        this.merchant_loc_doc.get().then(function(doc) {
            if (doc.exists) {
                let lang = doc.data().language;
                localization.setLanguage(lang);
                // update store 
                this.props.changeLanguage(lang);

                // console.log("Document data:", doc.data());
            } else {
                // doc.data() will be undefined in this case
                // console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    }

    componentWillUnmount() {
        this.unsubscribe_orders();
    }

    _onCollectionUpdateOrders = (querySnapshot) => {
        
        // create a structure that holds orders filtered by week
        // orders = { weekX: { pendingOrders: { date: { order: {} } }, ... , rejectedOrders: { ... } },
        //            weekY: { ... }}
        var orders = {};

        let orderDaysList = []; // dots for CalendarStrip

        // 1. group orders into one of the 4 order statuses
        // 2. group orders by date
        // 3. group orders pickup location
        // 4. sort orders by time
        querySnapshot.forEach((doc) => {
            var data = doc.data()
            var id = doc.id;

            data['id'] = id;

            // get the monday of respective week the order is within
            var startOfWeek = moment(data.orderSchedule.date).isoWeekday(1);
            var startOfWeekDate = startOfWeek.format('YYYY-MM-DD');
            if (!(startOfWeekDate in orders)) {
                orders[startOfWeekDate] = { 
                    pendingOrders: {},
                    pendingOrdersCount: 0,

                    confirmedOrders: {},
                    confirmedOrdersCount: 0,
                    inProgressOrdersCount: 0,
                    
                    deliveredOrders: {},
                    deliveredOrdersCount: 0,
                    rejectedOrders: {},
                    rejectedOrdersCount: 0,
                 }
            }
            switch (data.orderStatus) {
                case 'P': // Pending
                  orders[startOfWeekDate].pendingOrdersCount++;
                  this._addOrderToOrderList(data, orders[startOfWeekDate].pendingOrders, orderDaysList);
                  break;
                case 'C': // Confirmed
                  orders[startOfWeekDate].confirmedOrdersCount++;
                  this._addOrderToOrderList(data, orders[startOfWeekDate].confirmedOrders, orderDaysList);
                  break;
                case 'R': // Rejected
                  orders[startOfWeekDate].rejectedOrdersCount++;
                  this._addOrderToOrderList(data, orders[startOfWeekDate].rejectedOrders, orderDaysList); 
                  break;
                case 'I': // In Progress
                  orders[startOfWeekDate].inProgressOrdersCount++;
                  this._addOrderToOrderList(data, orders[startOfWeekDate].confirmedOrders, orderDaysList);
                  break;
                case 'D': // Delivered
                  orders[startOfWeekDate].deliveredOrdersCount++;
                  this._addOrderToOrderList(data, orders[startOfWeekDate].deliveredOrders, orderDaysList);
                  break;
                default:
            }
        });

        // Sort order times for each date
        


        this.setState({
            orders, orders,
            orderDaysList: orderDaysList,
        });
    }

    _addOrderToOrderList(data, orderDays, orderDaysList) {
        if (!(data.orderSchedule.date in orderDays)) {
            // change to separate delivery and pickup
            orderDays[data.orderSchedule.date] = { orders: [] };
            let iDay = moment(data.orderSchedule.date);
            let dotColor = this.pastDotColor;
            if (iDay.isSameOrAfter(this.today.format('YYYY-MM-DD'), 'day')) {
                dotColor = this.upcomingDotColor;
            }
            orderDaysList.push({
                date: iDay.toDate(),
                dots: [
                    {
                        color: dotColor,
                    }
                ],
            });
        }
        orderDays[data.orderSchedule.date].orders.push(data)
    }

    onWeekChanged = (date) => {
        this.setState({
            startDayOfWeek: moment(date).isoWeekday(1).format('YYYY-MM-DD'),
            endDayOfWeek: moment(date).isoWeekday(7).format('YYYY-MM-DD'),
        });
    }

    _completeOrder = (value) => {
        firebase.firestore().collection('merchants').doc(this.merchant_id).collection('orders').doc(value.uuid).update({fulfilled: true});
    }
    
    render() {
        return (
            <Container>
                <Content style={styles.contentContainer}>
                    <CalendarStrip
                    markedDates={this.state.orderDaysList}
                    onWeekChanged={(date) => {
                        this.onWeekChanged(date);
                    }}
                    daySelectionAnimation={{type: 'border', duration: 50, borderWidth: 0, borderHighlightColor: "white"}}
                    style={[styles.sectionBox, {height: 100, paddingTop: 20, paddingBottom: 10}]}
                    calendarHeaderStyle={styles.defaultColor}
                    dateNumberStyle={styles.defaultColor}
                    dateNameStyle={styles.defaultColor}
                    highlightDateNumberStyle={styles.defaultColor}
                    highlightDateNameStyle={styles.defaultColor}
                    // datesBlacklist={this.state.datesBlacklist}
                    disabledDateNameStyle={styles.disabledColor}
                    disabledDateNumberStyle={styles.disabledColor}
                    iconContainer={{flex: 0.1}} />  
                    <View style={styles.sectionBox}>
                        <Divider borderColor='#000' color='#000' orientation='center'>{ this.state.startDayOfWeek } - { this.state.endDayOfWeek }</Divider>
                    </View>
                    { (this.state.startDayOfWeek in this.state.orders) &&
                        <ScrollableTabView
                            style={[styles.sectionBox]}
                            tabBarUnderlineStyle={{ backgroundColor: "black", }}
                            tabBarActiveTextColor={"black"}
                            tabBarInactiveTextColor={"#808080"} // gray
                            renderTabBar={() => <ScrollableTabBar />}>

                            <OrderDaysList 
                                merchOrderRefColl={this.merchant_orders}
                                startDayOfWeek={this.state.startDayOfWeek}
                                tabLabel={localization.pending + "(" + this.state.orders[this.state.startDayOfWeek].pendingOrdersCount + ")"}
                                orderCount={this.state.orders[this.state.startDayOfWeek].pendingOrdersCount}
                                orderDays={this.state.orders[this.state.startDayOfWeek].pendingOrders}
                                orderColor={this.props.settings.orderColor}
                                />
                            <OrderDaysList 
                                merchOrderRefColl={this.merchant_orders}
                                startDayOfWeek={this.state.startDayOfWeek}
                                tabLabel={localization.confirmed + "(" + (this.state.orders[this.state.startDayOfWeek].confirmedOrdersCount + this.state.orders[this.state.startDayOfWeek].inProgressOrdersCount) + ")"}
                                // Separate confirmed and in progress orders to trigger sort function on child component did update
                                orderCount={this.state.orders[this.state.startDayOfWeek].confirmedOrdersCount}
                                orderDays={this.state.orders[this.state.startDayOfWeek].confirmedOrders}
                                orderColor={this.props.settings.orderColor}
                                />
                            <OrderDaysList 
                                merchOrderRefColl={this.merchant_orders}
                                startDayOfWeek={this.state.startDayOfWeek}
                                tabLabel={localization.delivered + "(" + this.state.orders[this.state.startDayOfWeek].deliveredOrdersCount + ")"}
                                orderCount={this.state.orders[this.state.startDayOfWeek].deliveredOrdersCount}
                                orderDays={this.state.orders[this.state.startDayOfWeek].deliveredOrders}
                                orderColor={this.props.settings.orderColor}
                                />
                            <OrderDaysList 
                                merchOrderRefColl={this.merchant_orders}
                                startDayOfWeek={this.state.startDayOfWeek}
                                tabLabel={localization.rejected + "(" + this.state.orders[this.state.startDayOfWeek].rejectedOrdersCount + ")"}
                                orderCount={this.state.orders[this.state.startDayOfWeek].rejectedOrdersCount}
                                orderDays={this.state.orders[this.state.startDayOfWeek].rejectedOrders}
                                orderColor={this.props.settings.orderColor}
                                />
                        </ScrollableTabView>
                    }
                    { !(this.state.startDayOfWeek in this.state.orders) &&
                        <View style={[styles.sectionBox, {padding: 5}]}>
                            <Text>{localization.noOrdersFound}</Text>
                        </View>
                    }
                </Content>
            </Container>
        );
    }
};

const mapStateToProps= (state) => {
    return {
        orderColor: state.scheduler.orderColor,
        settings: state.settings
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        changeLanguage:(lang) => dispatch({
            type: 'CHANGE_LANGUAGE',
            payload: lang
        }),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrdersScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    contentContainer: {
        backgroundColor: colors.bgColor,
    },
    sectionBox: {
        backgroundColor: colors.secColor,
        marginBottom: 10,
        paddingBottom: 10,
    },
    accordionHeader: {
        flex: 1,
    },
    firstRowHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffcc66',
    },
    secondRowHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffcc66',
    },
    menuItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: '#aaa'
    },
    dateHeader: {
        paddingTop: 10, 
        paddingBottom: 10, 
        backgroundColor: '#ffcc66', 
        justifyContent: "space-between", 
    }, 
    disabledColor: {
        color: '#BEBEBE',
    },
    defaultColor: {
        color: 'black',
    },
})