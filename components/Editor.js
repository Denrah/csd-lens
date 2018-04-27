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

let response;

export default class Editor extends React.Component {

	static navigationOptions = {
		title: 'Edit image',
	};

    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
            pixels: null,
            width: null,
            height: null,
        };
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
                imageSource:  { uri: 'data:image/jpeg;base64,' + res }
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
                imageSource:  { uri: 'data:image/jpeg;base64,' + res }
            });
        });
    }



    componentDidMount() {
        const {params} = this.props.navigation.state;
        response = params.response;

        this.setState({
            imageSource: { uri: response.uri },
        });
        imageUtils.getPixelsArray(response.path).then(res => {
            this.setState({
                pixels: res[0],
                width: res[1],
                height: res[2]
            });
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <Image source={this.state.imageSource} style={styles.uploadAvatar} />
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
