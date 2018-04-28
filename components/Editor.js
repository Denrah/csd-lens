import React from 'react';
import {StyleSheet, Text, View, Button, ImageBackground, ProgressBarAndroid} from 'react-native';
import { NativeModules } from 'react-native';
import Canvas, {Image as CanvasImage, Path2D} from 'react-native-canvas';
let ImagePicker = require('react-native-image-picker');
let filters = require('../libs/filters.js');
let imageUtils = require('../libs/imageUtils.js');

let options = {
    title: 'Select image',
    customButtons: [
        {name: 'fb', title: 'Choose Photo from Facebook'},
    ],
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

let response;
let loadingBar = <ProgressBarAndroid styleAttr="Inverse" />;

export default class Editor extends React.Component {

	static navigationOptions = {
		title: 'Edit image',
        headerStyle: {
            backgroundColor: '#000',
            height: 40,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
	};

    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
            pixels: null,
            basePixels: null,
            width: null,
            height: null,
			canvas: null,
            loadingBar: null
        };
    }

    sepia() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = [];
            for(let i = 0; i < this.state.width*this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);
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
                    imageSource:  { uri: 'data:image/jpeg;base64,' + res },
                    loadingBar: null,
                });
            });
        });
    }

    grayscale() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = [];
            for(let i = 0; i < this.state.width*this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);
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
                    imageSource:  { uri: 'data:image/jpeg;base64,' + res },
                    loadingBar: null
                });
            });
        });
    }

    threshold() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let threshold = 130;
            let new_pixels = [];
            for(let i = 0; i < this.state.width*this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);
                let new_colors = [];
                let v = (0.2126*colors[0] + 0.7152*colors[1] + 0.0722*colors[2] >= threshold) ? 255 : 0;
                new_colors[0] = v;
                new_colors[1] = v;
                new_colors[2] = v;
                new_colors[3] = colors[3];

                new_colors = imageUtils.normalaizeColors(new_colors);
                new_pixels[i] = imageUtils.RGBToInt(new_colors);
            }
            this.setState({
                pixels: new_pixels
            });
            imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
                this.setState({
                    imageSource:  { uri: 'data:image/jpeg;base64,' + res },
                    loadingBar: null
                });
            });
        });
    }



    componentDidMount() {
        const {params} = this.props.navigation.state;
        response = params.response;

        this.setState({
            loadingBar: loadingBar
        });
        imageUtils.getPixelsArray(response.path).then(res => {
            this.setState({
                pixels: res[0],
                basePixels: res[0],
                width: res[1],
                height: res[2]
            });
            this.setState({
                imageSource: { uri: response.uri },
                loadingBar: null,
                //canvas: <Canvas ref={this.handleCanvas}/>
            });
        });
    }
	
	/*handleCanvas(canvas) {
		const image = new CanvasImage(canvas);
		
		canvas.width = 300;
		canvas.height = 300;
	
		const ctx = canvas.getContext('2d');
		const img = new CanvasImage(canvas);
		console.log("data:image/jpeg;base64," + response.data);
		image.src = "data:image/jpeg;base64," + response.data;
		image.addEventListener('load', () => {
			console.log('image is loaded');

			ctx.drawImage(image, 0, 0, 2, 2).then(() => {
				imageData = ctx.getImageData(0, 0, 2, 2).then(function(imageData) {
					console.log(imageData);
				});
				
			});
		});
	}*/


    render() {
        return (
            <View style={styles.container}>
				<View style={styles.imageDesk}>
                    <ImageBackground source={this.state.imageSource} style={styles.uploadImage} >
                        {this.state.loadingBar}
                    </ImageBackground>
				</View>
				<View style={styles.editPanel}>
					<Button title={"Set Sepia"} onPress={this.sepia.bind(this)}/>
					<Button title={"Set Grayscale"} onPress={this.grayscale.bind(this)}/>
                    <Button title={"Set Threshold"} onPress={this.threshold.bind(this)}/>
				</View>
				<View style={styles.bottomBar}>
					<Text style={{color: "white", fontSize: 16}}>FILTER</Text>
					<Text style={{color: "white", fontSize: 16}}>SIZE&ROT</Text>
					<Text style={{color: "white", fontSize: 16}}>FILTER</Text>
				</View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#373737',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadImage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
		top: 0,
        alignItems: 'center',
        justifyContent:'center',
        flexGrow:1,
    },
	bottomBar: {
		backgroundColor: "#000",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
		paddingTop: 8,
		paddingLeft: 30,
		paddingRight: 30
	},
	editPanel: {
		backgroundColor: "#1D1D1D",
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
		paddingTop: 8,
		paddingLeft: 30,
		paddingRight: 30
	},
	imageDesk: {
		position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
		top: 0,
	}
});
