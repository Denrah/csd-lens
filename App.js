import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {StackNavigator} from "react-navigation";
import Main from './components/Main';
import Editor from './components/Editor';
import SaveImage from './components/SaveImage';
import About from './components/About';


class App extends React.Component {

	static navigationOptions = {
		title: 'CSD Lens',
        headerStyle: {
            backgroundColor: '#000',
            height: 40,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'normal',
        },
	};

    render() {
        return (
            <Main navigation={this.props.navigation} />
        );
    }
}

export default StackNavigator(
    {
        Main: {
            screen: App,
        },
		About: {
            screen: About,
        },
        Editor: {
            screen: Editor,
        },
		SaveImage: {
			screen: SaveImage,
		},
    },
    {
        initialRouteName: 'Main',
    }
);
