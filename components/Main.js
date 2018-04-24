import React from 'react';
import {StyleSheet, Text, View, Button, Image} from 'react-native';
import { NativeModules } from 'react-native';
var ImagePicker = require('react-native-image-picker');

var options = {
    title: 'Select Avatar',
    customButtons: [
        {name: 'fb', title: 'Choose Photo from Facebook'},
    ],
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            avatarSource: null,
        };
    }

    async getPixelsArray(path) {
        let res = [];

        await new Promise((resolve, reject) => {
            NativeModules.Bitmap.getPixelRGBAofImage(path, 0, 0, (err, color) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(color);
                console.log(color);
            });
        }).then(function (color) {
            console.log(color);
        });

        return res;
    }

    selectImage() {
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

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
                let source = { uri: response.uri };

                let arr;
                this.getPixelsArray(response.path).then(res => {
                    alert(123);
                });


                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };

                this.setState({
                    avatarSource: source
                });
            }
        });
    }

    componentDidMount() {

    }

    render() {
        return (
            <View style={styles.container}>
                <Image source={this.state.avatarSource} style={styles.uploadAvatar} />
                <Button title={"Select image"} onPress={this.selectImage.bind(this)}/>
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
