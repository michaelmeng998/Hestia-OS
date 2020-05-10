// Only need to track of the currently selected date and 
//  its delivery locations/hours
import moment from 'moment';
import _ from 'lodash';

function compareHrs(tA, tB) {
    let timeA = moment(tA.startTime);
    // let timeAEND = moment(tA.endTime);
    let timeB = moment(tB.startTime);
    // let timeBEND = moment(tB.endTime);

    let result = -1;
   
    if (timeA.isBefore(timeB)) {
        result = -1;
    } else if (timeA.isAfter(timeB)) {
        result = 1;
    }
    return result
}

// Takes an array of objects { startTime: , endTime: }
function sortHours(hours) {
    hours.sort(compareHrs);
}

// 
function replaceDate(selectedDate, pickerDate) {
    // dateRegex = /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/
    let selectDate = moment(selectedDate);

    pickerDate.date(selectDate.date());
    pickerDate.month(selectDate.month());
    pickerDate.year(selectDate.year());

    return pickerDate.toISOString();
}

// schedule: { deliverySchedule: [ { startTime:, endTime: } ], pickupSchedule: [ { location:{ placeID, name, address }, hours: [ { startTime:, endTime: } ] } ] }
const locationsReducer = (state = {selectedDate: '', marked: false, schedule: { deliverySchedule: [], pickupSchedule: [] }, orderColor: {delivery: '#d4af37', pickup: '#B773E3'}, orderTypes: {delivery: "Delivery", pickup: "Pickup"}}, action) => {
    var newPickupSchedule = [];
    var newDeliverySchedule = [];
    switch (action.type) {
        case 'SELECT_SCHEDULE_DAY':
            newPickupSchedule = _.cloneDeep(action.payload.schedule.pickupSchedule);
            newDeliverySchedule = _.cloneDeep(action.payload.schedule.deliverySchedule);
            
            // null !== undefined but null == undefined
            if (!(newPickupSchedule == null)) {
                // sort hours for each location
                for (i in newPickupSchedule) {
                    sortHours(newPickupSchedule[i].hours);
                }
            }
            if (!(newDeliverySchedule == null)) {
                // sort hours for delivery
                sortHours(newDeliverySchedule);
            }

            return {
                ...state,
                selectedDate: action.payload.date,
                marked: action.payload.marked,
                schedule: {
                    deliverySchedule: newDeliverySchedule == null ? [] : newDeliverySchedule,
                    pickupSchedule: newPickupSchedule == null ? [] : newPickupSchedule,
                },
            }
        case 'MERCHANT_ADD_LOCATION':
            console.log("pickup schedule length: " + state.schedule.pickupSchedule.length);

            for (var i=0; i<state.schedule.pickupSchedule.length; i++) {
                // Assumption: location object is defined
                if (action.payload.placeID === state.schedule.pickupSchedule[i].location.placeID) {
                    return {
                        ...state
                    }
                }
            }

            cloneDeliverySchedule = _.cloneDeep(state.schedule.deliverySchedule);
            newPickupSchedule = [...state.schedule.pickupSchedule, { location: action.payload, hours: [] }];
            // https://stackoverflow.com/questions/44245888/what-does-return-state-in-this-reducer-exactly-mean?rq=1
            // 
            return {
                ...state, 
                schedule: {
                    deliverySchedule: cloneDeliverySchedule,
                    pickupSchedule: newPickupSchedule,
                }
            };
        case 'TOGGLE_OPEN_DAY':
            console.log("marked value is: " + action.payload);
            return {
                ...state,
                marked: action.payload, 
            }
        case 'MERCHANT_REMOVE_PICKUP_LOCATION':
            cloneDeliverySchedule = _.cloneDeep(state.schedule.deliverySchedule);
            newPickupSchedule = state.schedule.pickupSchedule.filter(place => place.location.placeID !== action.payload.placeID);
            return {
                ...state,
                schedule: {
                    deliverySchedule: cloneDeliverySchedule,
                    pickupSchedule: newPickupSchedule,
                },
            }
        case 'ADD_PIKCUP_TIME_INTERVAL':
            newPickupSchedule = [...state.schedule.pickupSchedule];
            cloneDeliverySchedule = _.cloneDeep(state.schedule.deliverySchedule);

            for (var i=0; i<newPickupSchedule.length; i++) {
                // console.log("add time interval");
                // console.log(action.payload.placeID);
                if (action.payload.placeID === newPickupSchedule[i].location.placeID) {
                    // console.log("reducer start time: " + action.payload.startTime.toISOString());
                    newPickupSchedule[i].hours.push({ 
                        startTime: replaceDate(state.selectedDate, action.payload.startTime), 
                        endTime: replaceDate(state.selectedDate, action.payload.endTime), 
                    });
                    // resort hours for each location, is there a more efficient way?
                    sortHours(newPickupSchedule[i].hours);

                    return {
                        ...state,
                        schedule: {
                            deliverySchedule: cloneDeliverySchedule,
                            pickupSchedule: newPickupSchedule,
                        },
                    }
                }
            }
            return {...state} // shouldn't reach here

        case 'ADD_DELIVERY_TIME_INTERVAL':
            clonePickupSchedule = _.cloneDeep(state.schedule.pickupSchedule);
            newDeliverySchedule = [...state.schedule.deliverySchedule];

            newDeliverySchedule.push({ 
                startTime: replaceDate(state.selectedDate, action.payload.startTime), 
                endTime: replaceDate(state.selectedDate, action.payload.endTime),  
            });
            
            sortHours(newDeliverySchedule);

            return {
                ...state,
                schedule: {
                    deliverySchedule: newDeliverySchedule,
                    pickupSchedule: clonePickupSchedule,
                },
            }
        }
    return {...state}
}

// return state.filter(cartItem => cartItem.id !== action.payload.id)

export default locationsReducer