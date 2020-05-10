import React from 'react';
import {
	AsyncStorage,
	ActivityIndicator,
    StyleSheet,
	KeyboardAvoidingView,
	TouchableOpacity,
	View
} from 'react-native';
import { Button, Container, Content, Form, Item, Label, Input, List, ListItem, Text } from 'native-base';
import firebase from 'react-native-firebase'
import localization from '../constants/Localization';


export default class ChangeCredentialsScreen extends React.Component {
	static navigationOptions = {
        title: 'Hestia',
    };

	constructor(props) {
        super(props);
		this.state = {  email: null,
                        password: null,
                        password2: null,
						errorMessage: '',
						loadingLogin: false
					}
		this.customer_ref = firebase.firestore().collection('customers');
	};

	render() {
		return (
			<Container>
				<Content style={styles.contentContainer}>
                    <Form>
                        <Item floatingLabel>
                            <Label>{localization.newEmail}</Label>
                            <Input autoCapitalize="none" autoCorrect={false} onChangeText={(text) => this.setState({email: text})}/>
                        </Item>
                        <Item floatingLabel last>
                            <Label>{localization.newPassword}</Label>
                            <Input secureTextEntry autoCapitalize="none" autoCorrect={false} onChangeText={(text) => this.setState({password: text})}/>
                        </Item>
                        <Item floatingLabel last>
                            <Label>{localization.newPasswordConfirm}</Label>
                            <Input secureTextEntry autoCapitalize="none" autoCorrect={false} onChangeText={(text) => this.setState({password2: text})}/>
                        </Item>
                    </Form>	
                    <View style={{flex: 1, flexDirection: "row", marginTop: 20}}>
                        <Button style={{flex: 1, flexDirection: 'row', justifyContent: 'center', width: '100%'}} primary onPress={() => this._handleLogin()}>
                            <Text style={{textAlign: 'center'}}>{localization.changeCredentials}</Text>
                        </Button>
                    </View>
				</Content>
			</Container>
        )
	}
}

const styles = StyleSheet.create({
	contentContainer: {
        flex: 1,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
	},
	buttonContainer:{
        backgroundColor: '#2980b6',
        paddingVertical: 15
    },
});