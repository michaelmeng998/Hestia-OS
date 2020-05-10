const settingsReducer = (
    state = {
        language: "en",
        orderColor: {delivery: '#d4af37', pickup: '#B773E3'},
        englishAbbr: "en",
        chineseAbbr: "zh"
    },
    action
) => {
    // console.log("LANGUAGE REDUCER CALLED...");
    // console.log(action.payload);
    switch (action.type) {
        case "CHANGE_LANGUAGE":
            return {
                ...state,
                language: action.payload
            }
        // TODO: Add feature to change order type color indicator
    }
    return state;
};

export default settingsReducer;