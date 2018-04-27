import React from 'react';
import {StyleSheet, Text, View, Button, Image} from 'react-native';
import {StackNavigator} from 'react-navigation';

let ImagePicker = require('react-native-image-picker');

let options = {
    title: 'Choose image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

export default class Main extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    selectImage() {
        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                console.log(this.props);
                this.props.navigation.navigate('Editor', {response: response});
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>CSD Lens</Text>
                <Button title={"Choose picture"} onPress={this.selectImage.bind(this)}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadAvatar: {
        width: 200,
        height: 200,
    }
});
