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

	RGBToInt(colors){
		var bin = (colors[3] * 255) << 24 | colors[0] << 16 | colors[1] << 8 | colors[2];
		bin = (function(h){
			return new Array(33-h.length).join("0")+h
		})(bin.toString(2));
		return parseInt( bin.split('').reverse().join(''), 2 );
	}
	
    toColor(num) {
        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16,
            a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
        return "rgba(" + [r, g, b, a].join(",") + ")";
    }
	
	toColorArr(num) {
        num >>>= 0;
        var b = num & 0xFF,
            g = (num & 0xFF00) >>> 8,
            r = (num & 0xFF0000) >>> 16,
            a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
        return [r, g, b, a];
    }
	
	normalaize_colors(colors) {
		for(var i = 0; i < 4; i++) {
			if (colors[i] > 255)
				colors[i] = 255;
			colors[i] = parseInt(colors[i]);
		}
		return colors;
	}

    temp() {
        console.log(this.toColor(this.state.pixels[0]),
            this.toColor(this.state.pixels[1]),
            this.toColor(this.state.pixels[2]),
            this.toColor(this.state.pixels[3]));
        this.getBase64FromPixels(this.state.pixels, this.state.width, this.state.height);
    }
	
	sepia() {
		for(var i = 0; i < this.state.width*this.state.height; i++) {
			colors = this.toColorArr(this.state.pixels[i]);
			var new_colors = [];
			new_colors[0] = (colors[0] * 0.393) + (colors[1] * 0.769) + (colors[2] * 0.189);
			new_colors[1] = (colors[0] * 0.349) + (colors[1] * 0.686) + (colors[2] * 0.168);
			new_colors[2] = (colors[0] * 0.272) + (colors[1] * 0.534) + (colors[2] * 0.131);
			new_colors[3] = colors[3];
			
			new_colors = this.normalaize_colors(new_colors);
            this.state.pixels[i] = this.RGBToInt(new_colors);
		}
		console.log(this.state.pixels);
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
