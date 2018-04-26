import React from 'react';
import {StyleSheet, Text, View, Button, Image} from 'react-native';
import { NativeModules } from 'react-native';
let ImagePicker = require('react-native-image-picker');
let filters = require('../libs/filters.js');
let imageUtils = require('../libs/imageUtils.js');

let options = {
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




    temp() {
        imageUtils.getBase64FromPixels(this.state.pixels, this.state.width, this.state.height);
    }
	
	sepia() {
        let new_pixels = [];
		for(let i = 0; i < this.state.width*this.state.height; i++) {
			colors = imageUtils.toColorArr(this.state.pixels[i]);
			let new_colors = [];
			new_colors[0] = (colors[0] * 0.393) + (colors[1] * 0.769) + (colors[2] * 0.189);
			new_colors[1] = (colors[0] * 0.349) + (colors[1] * 0.686) + (colors[2] * 0.168);
			new_colors[2] = (colors[0] * 0.272) + (colors[1] * 0.534) + (colors[2] * 0.131);
			new_colors[3] = colors[3];
			
			new_colors = imageUtils.normalaizeColors(new_colors);
            new_pixels[i] = imageUtils.RGBToInt(new_colors);
		}
        this.setState({
            pixels: new_pixels
        });
        imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
            this.setState({
                avatarSource:  { uri: 'data:image/jpeg;base64,' + res }
            });
        });
	}

	grayscale() {
        let new_pixels = [];
        for(let i = 0; i < this.state.width*this.state.height; i++) {
            colors = imageUtils.toColorArr(this.state.pixels[i]);
            let new_colors = [];
            new_colors[0] = (colors[0] + colors[1] + colors[2]) / 3;
            new_colors[1] = (colors[0] + colors[1] + colors[2]) / 3;
            new_colors[2] = (colors[0] + colors[1] + colors[2]) / 3;
            new_colors[3] = colors[3];

            new_colors = imageUtils.normalaizeColors(new_colors);
            new_pixels[i] = imageUtils.RGBToInt(new_colors);
        }
        this.setState({
            pixels: new_pixels
        });
        imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
            this.setState({
                avatarSource:  { uri: 'data:image/jpeg;base64,' + res }
            });
        });
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
                let source = { uri: response.uri };


                imageUtils.getPixelsArray(response.path).then(res => {
                    this.setState({
                        pixels: res[0],
                        width: res[1],
                        height: res[2]
                    });
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
				<Button title={"Set Sepia"} onPress={this.sepia.bind(this)}/>
                <Button title={"Set Grayscale"} onPress={this.grayscale.bind(this)}/>
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
