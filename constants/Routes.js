let routeInfo = {
    // Merchant Routes...
    Orders: {
        labelName: 'orders',
        iconName: 'ios-cash'
    },
    Menu: {
        labelName: 'menu',
        iconName: 'md-book'
    },
    Schedule: { 
        labelName: 'schedule',
        iconName: 'md-calendar'
    },
    Images: {
        labelName: 'images',
        iconName: 'ios-images'
    },
    Settings: {
        labelName: 'settings',
        iconName: Platform.OS === "ios" ? "ios-options" : "md-options"
    },

    // Customer Routes...
    Customer_Home: {
        labelName: 'home',
        iconName: 'ios-home'
    },
    Customer_Orders: {
        labelName: 'orders',
        iconName: 'md-list-box'
    },
    Customer_Settings: {
        labelName: 'settings',
        iconName: Platform.OS === "ios" ? "ios-settings" : "md-settings"
    }
}

export default routeInfo;