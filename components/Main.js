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
            pixels: null,
            width: null,
            height: null,
        };
    }

    async getBase64FromPixels(pixels, width, height) {
        let res = "";

        await new Promise((resolve, reject) => {
            NativeModules.Bitmap.getBase64FromPixels(pixels, width, height, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        }).then(function (data) {
            console.log(data);
        });

        return res;
    }

    toColor(num) {
        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16,
            a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
        return "rgba(" + [r, g, b, a].join(",") + ")";
    }

    temp() {
        console.log(this.toColor(this.state.pixels[0]),
            this.toColor(this.state.pixels[1]),
            this.toColor(this.state.pixels[2]),
            this.toColor(this.state.pixels[3]));
        this.getBase64FromPixels(this.state.pixels, this.state.width, this.state.height);
    }

    async getPixelsArray(path) {
        let res = [];


        await new Promise((resolve, reject) => {
            NativeModules.Bitmap.getPixelRGBAofImage(path, (err, color, width, height) => {
                if (err) {
                    return reject(err);
                }
                resolve([color, width, height]);
            });
        }).then(function (data) {
            res = data;
            console.log(data[0], data[1], data[2]);
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
                   // arr = JSON.parse(res);
                    //console.log(arr);
                    this.setState({
                        pixels: res[0],
                        width: res[1],
                        height: res[2]
                    });
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
                <Button title={"Get Base64"} onPress={this.temp.bind(this)}/>
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
