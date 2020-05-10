const cartItemsReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      for (var i = 0; i < state.length; i++) {
        if (action.payload.uuid === state[i].uuid) {
          state[i].quantity += 1;
          var oldState = JSON.stringify(state);
          var newState = JSON.parse(oldState);
          return newState;
        }
      }

      const newItemInCart = {
        uuid: action.payload.uuid,
        active: action.payload.active,
        name: action.payload.name,
        price: action.payload.price,
        quantity: 1
      };
      return [...state, newItemInCart];

    case "ADD_CUSTOM_ITEM_TO_CART":
      for (var i = 0; i < state.length; i++) {
        if (action.payload.uuid === state[i].uuid) {
          state[i].quantity += 1;
          var oldState = JSON.stringify(state);
          var newState = JSON.parse(oldState);
          return newState;
        }
      }

      const newItemInCart = {
        uuid: action.payload.uuid,
        active: action.payload.active,
        name: action.payload.name,
        price: action.payload.price,
        itemPrice: action.payload.itemPrice,
        customization: action.payload.customization,
        quantity: action.payload.quantity
      };
      return [...state, newItemInCart];

    case "REMOVE_FROM_CART":
      for (var i = 0; i < state.length; i++) {
        if (action.payload.uuid == state[i].uuid) {
          if (state[i].quantity > 1) {
            state[i].quantity -= 1;
            var oldState = JSON.stringify(state);
            var newState = JSON.parse(oldState);
            return newState;
          } else {
            return state.filter(
              cartItem => cartItem.uuid !== action.payload.uuid
            );
          }
        }
      }

    case "ERASE_CART":
      state = [];
      return state;
  }
  return state;
};

export default cartItemsReducer;
