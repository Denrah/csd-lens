import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {StackNavigator} from "react-navigation";
import Main from './components/Main';
import Editor from './components/Editor';


class App extends React.Component {

    render() {
        return (
            <Main/>
        );
    }
}

export default StackNavigator(
    {
        Main: {
            screen: App,
            navigationOptions: ({navigation}) => ({

            }),
        },
        Editor: {
            screen: Editor,
        }
    },
    {
        initialRouteName: 'Main',
    }
);
