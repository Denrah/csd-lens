import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid} from 'react-native';
import {StackNavigator} from 'react-navigation';

let ImagePicker = require('react-native-image-picker');

let options = {
    title: 'Choose image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse" />;

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingBar: null
        };
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
				this.setState({
					loadingBar: loadingBar
				});
                this.props.navigation.navigate('Editor', {response: response});
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Button title={"Choose picture"} onPress={this.selectImage.bind(this)}/>
                {this.state.loadingBar}
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
