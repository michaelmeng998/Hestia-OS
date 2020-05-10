import moment from "moment";
import _ from 'lodash';

// A bit semntically incorrect rn since the location obj in the delivery obj
//  is used for delivery orders and the one in the tempSelections is used for
//  pickup orders
const orderReducer = (
  state = {
    
    // Hard code inventory threshold to show low inventory alert
    // TODO: Add this as a config option in menu item screen?
    showInventoryCutoff: 5,

    vendor: { name: "", uuid: null },
    items: [],
    delivery: {
      date: moment().format("YYYY-MM-DD"),
      time: { start: "", end: "" },
      timeLabel: "",
      pickupTime: { start: "", end: "" },
      pickupTimeLabel: "",
      location: {},
      pickupLocation: {},
      noteToChef: "",
      isDelivery: true
    },
    tempSelections: { deliveryTPick: "", pickupTPick: "" },
    inventory: {}
  },
  action
) => {
  var newItems = [];
  var newDelivery = {};
  var newTempSelections = {};
  var newInventory = {};

  switch (action.type) {
    case "ADD_TO_CART":
      let existing_item_index = state.items.findIndex(
        item => action.payload.uuid === item.uuid
      );

      if (existing_item_index != -1) {
        var updatedItems = _.cloneDeep(state.items);
        updatedItems[existing_item_index].quantity = updatedItems[existing_item_index].quantity < state.showInventoryCutoff ?
        updatedItems[existing_item_index].quantity + 1 : updatedItems[existing_item_index].quantity;

        return {
          ...state,
          items: updatedItems
        };
      }

      const newItemInCart = {
        uuid: action.payload.uuid,
        active: action.payload.active,
        name: action.payload.name,
        price: action.payload.price,
        quantity: 1
      };
      newItems = [...state.items, newItemInCart];
      return {
        ...state,
        items: newItems
      };
    case "ADD_CUSTOM_ITEM_TO_CART":
      let existing_custom_item_index = state.items.findIndex(
        item => action.payload.uuid === item.uuid
      );
      if (existing_custom_item_index != -1) {
        var updated_items = _.cloneDeep(state.items);
        updated_items[existing_custom_item_index].quantity += action.payload.quantity;
        return {
          ...state,
          items: updated_items
        };
      }

      const newCustomItemInCart = {
        uuid: action.payload.uuid,
        active: action.payload.active,
        name: action.payload.name,
        price: action.payload.price,
        itemPrice: action.payload.itemPrice,
        customizationOn: action.payload.customizationOn,
        customization: action.payload.customization,
        quantity: action.payload.quantity
      };
      newItems = [...state.items, newCustomItemInCart];
      return {
        ...state,
        items: newItems
      };
    
    case "UPDATE_CUSTOM_ITEM_TO_CART":
        var updated_items = _.cloneDeep(state.items);
        // check if custom item uuid changed
        let newCustomization = action.payload.prevUuid !== action.payload.uuid;
        if (newCustomization) {
          // Need to remove prevUuid item from cart
          updated_items = updated_items.filter(
            item => item.uuid != action.payload.prevUuid
          );
        }

        let new_custom_item_index = updated_items.findIndex(
          item => action.payload.uuid === item.uuid
        );
        if (new_custom_item_index != -1) {
          if (newCustomization) {
            updated_items[new_custom_item_index].quantity += action.payload.quantity;
          } else updated_items[new_custom_item_index].quantity = action.payload.quantity;
          return {
            ...state,
            items: updated_items
          };
        }
  
        const editedCustomItemInCart = {
          uuid: action.payload.uuid,
          active: action.payload.active,
          name: action.payload.name,
          price: action.payload.price,
          itemPrice: action.payload.itemPrice,
          customizationOn: action.payload.customizationOn,
          customization: action.payload.customization,
          quantity: action.payload.quantity
        };
        newItems = [...updated_items, editedCustomItemInCart];
        return {
          ...state,
          items: newItems
        };
    
    // Reducer for custom items
    case "REMOVE_CUSTOM_ITEM_FROM_CART":
      var updated_items = _.cloneDeep(state.items);
      updated_items = updated_items.filter(
        item => item.uuid != action.payload.uuid
      );
      
      return {
        ...state,
        items: updated_items
      };

    case "REMOVE_FROM_CART":
      let item_to_remove_index = state.items.findIndex(
        item => action.payload.uuid === item.uuid
      );

      if (item_to_remove_index != -1) {
        if (state.items[item_to_remove_index].quantity > 1) {
          var updatedItems = _.cloneDeep(state.items);
          updatedItems[item_to_remove_index].quantity -= 1;

          return {
            ...state,
            items: updatedItems
          };
        }
        newItems = state.items.filter(
          item => item.uuid !== action.payload.uuid
        );
        return {
          ...state,
          items: newItems
        };
      }
      return {
        ...state
      }

    case "ERASE_CART":
      newItems = [];
      newDelivery = {
        date: moment().format("YYYY-MM-DD"),
        time: { start: "", end: "" },
        timeLabel: "",
        pickupTime: { start: "", end: "" },
        pickupTimeLabel: "",
        location: {},
        pickupLocation: {},
        isDelivery: true
      };
      newTempSelections = {
        deliveryTPick: "",
        pickupTPick: ""
      };
      return {
        ...state,
        vendor: {},
        items: newItems,
        delivery: newDelivery,
        tempSelections: newTempSelections
      };

    case "CHANGE_ADDRESS":
      return {
        ...state,
        delivery_location: action.payload
      };

    case "CLIENT_SELECT_DATE":
      newDelivery = {
        ...state.delivery,
        date: action.payload,
        time: { start: "", end: "" },
        timeLabel: "",
        pickupTime: { start: "", end: "" },
        pickupTimeLabel: "",
        location: {},
        pickupLocation: {},
        isDelivery: true
      };
      newTempSelections = {
        deliveryTPick: "",
        pickupTPick: ""
      };
      return {
        ...state,
        delivery: newDelivery,
        tempSelections: newTempSelections
      };
    case "UPDATE_NOTE_TO_CHEF":
      newDelivery = {
        ...state.delivery,
        noteToChef: action.payload
      };
      return {
        ...state,
        delivery: newDelivery
      };

    case "CHANGE_ORDER_TYPE":
      newDelivery = {
        ...state.delivery,
        isDelivery: action.payload
      };
      newTempSelections = {
        deliveryTPick: "",
        pickupTPick: ""
      };
      return {
        ...state,
        delivery: newDelivery,
        tempSelections: newTempSelections
      };
    case "SELECT_ORDER_TIME":
      // grab corresponding time object
      var time = action.payload.time;
      var schedule = action.payload.schedule;
      var label = action.payload.label;
      var delivery = action.payload.isDelivery;
      var orderTime = {};
      for (var i = 0; i < label.length; i++) {
        if (time == label[i]) {
          if (i < schedule.length) {
            orderTime = schedule[i];
            break;
          }
        }
      }

      // check to make sure that start/end time valid/exist
      if (delivery) {
        newDelivery = {
          ...state.delivery,
          time: orderTime,
          timeLabel: time
        };
      } else {
        // pickup
        newDelivery = {
          ...state.delivery,
          pickupTime: orderTime,
          pickupTimeLabel: time
        };
      }

      return {
        ...state,
        delivery: newDelivery
      };

    case "TEMP_SELECT_DELIVERY_TIME":
      newTempSelections = {
        ...state.tempSelections,
        deliveryTPick: action.payload
      };
      return {
        ...state,
        tempSelections: newTempSelections
      };
    case "TEMP_SELECT_PICKUP_TIME":
      newTempSelections = {
        ...state.tempSelections,
        pickupTPick: action.payload
      };
      return {
        ...state,
        tempSelections: newTempSelections
      };
    // Customers selected address for delivery orders
    case "CUSTOMER_ADD_LOCATION":
      newDelivery = {
        ...state.delivery,
        location: action.payload
      };
      return {
        ...state,
        delivery: newDelivery
      };
    case "SELECT_PICKUP_LOCATION":
      newDelivery = {
        ...state.delivery,
        pickupLocation: action.payload
      };
      return {
        ...state,
        delivery: newDelivery
      };
    case "CUSTOMER_REMOVE_PICKUP_LOCATION":
      newDelivery = {
        ...state.delivery,
        pickupTime: { start: "", end: "" },
        pickupTimeLabel: "",
        pickupLocation: {}
      };
      return {
        ...state,
        delivery: newDelivery
      };
    case "UPDATE_INVENTORY":
      inventory = action.payload
      return {
        ...state,
        inventory: inventory
      }

  }
  return state;
};

export default orderReducer;
