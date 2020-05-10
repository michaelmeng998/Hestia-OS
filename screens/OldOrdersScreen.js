import React from 'react';
import {
	Alert,
	Image,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	Button,
	SectionList,
	TouchableOpacity,
	View,
} from 'react-native';

import { MonoText } from '../components/StyledText';

import OrderItem from '../components/OrderItem';


export default class OrdersScreen extends React.Component {
	static navigationOptions = {
		
	};

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
			<Text style={styles.subTitle}>Ongoing Orders</Text>
			
			{/* <SectionList
				renderItem={({item, index, section}) => <Text key={index}>{item}</Text>}
				renderSectionHeader={({section: {title}}) => (
					<Text style={{fontWeight: 'bold'}}>{title}</Text>
				)}
				sections={[
					{title: 'Title1', data: ['item1', 'item2']},
					{title: 'Title2', data: ['item3', 'item4']},
					{title: 'Title3', data: ['item5', 'item6']},
				]}
				keyExtractor={(item, index) => item + index}
            /> */}
            <View style={styles.ordersList}>
                <OrderItem customer={{name: "Sam Liu", address: "330 Philip St, Waterloo ON", number: "647-XXX-XXXX"}} 
                distance={3} 
                orderTime={40}/>
                <OrderItem customer={{name: "Ryan Lin", address: "330 Philip St, Waterloo ON", number: "647-XXX-XXXX"}} 
                distance={3} 
                orderTime={36}/>
                <OrderItem customer={{name: "Jerry Jiang", address: "330 Philip St, Waterloo ON", number: "647-XXX-XXXX"}} 
                distance={3} 
                orderTime={25}/>
                <OrderItem customer={{name: "Mark He", address: "330 Philip St, Waterloo ON", number: "647-XXX-XXXX"}} 
                distance={3} 
                orderTime={14}/>
            </View>
            
            
        </ScrollView>
      </View>
    );
  }

  
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    contentContainer: {
        paddingTop: 5,
        paddingLeft: 20,
        paddingRight: 20,
    },
    mainTitle: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 30,
    },
    subTitle: {
        paddingTop: 25,
        fontWeight: "bold",
    },
    favoritesList: {
        paddingTop: 10,
	},
	
    restaurantsListItem: {
		marginTop: 6,
        backgroundColor: "#efefef"
        
        
    }

})