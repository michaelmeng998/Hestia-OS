const ordersReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_ORDER':
            for (var i=0; i<state.length; i++) {
                if (action.payload.name === state[i].name) {
                    state[i].quantity += 1;
                    var oldState = JSON.stringify(state);
                    var newState = JSON.parse(oldState);
                    return newState;
                } 
            }
            action.payload['quantity'] = 1;
            return [...state, action.payload];
            
        case 'REMOVE_ORDER':
            for (var i=0; i<state.length; i++) {
                if (action.payload.name == state[i].name) {
                    if (state[i].quantity > 1) {
                        state[i].quantity -= 1;
                        var oldState = JSON.stringify(state);
                        var newState = JSON.parse(oldState);
                        return newState;
                    } else {
                        return state.filter(cartItem => cartItem.name !== action.payload.name);
                    }
                }
            }
            
    }
    return state
}

// return state.filter(cartItem => cartItem.id !== action.payload.id)

export default ordersReducer