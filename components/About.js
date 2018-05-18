import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid, TextInput, ToastAndroid, Dimensions} from 'react-native';
import {StackNavigator} from 'react-navigation';


export default class About extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'About',
            headerStyle: {
                backgroundColor: '#000',
                height: 50,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'normal',
            }
        }
    };

    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={styles.container}>
                <Image source={require("../assets/ui/authors.png")} style={{marginTop: 30, marginBottom: 10, width: Dimensions.get('window').width, height: Dimensions.get('window').width*0.7}} resizeMode={"contain"}/>
				<Text style={{fontSize: 25, fontWeight: "bold", color: "#00CF68", lineHeight: 60}}>AUTHORS</Text>
				<Text style={{fontSize: 20, color: "#FFF"}}>IGOR ROMIN</Text>
				<Text style={{fontSize: 20, color: "#FFF"}}>DENIS SHARAPOV</Text>
				<Text style={{fontSize: 15, fontWeight: "bold", color: "#00CF68", lineHeight: 60}}>Software Engineering at TSU &#169; 2018</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D1D1D',
        alignItems: 'center',
    }
});
