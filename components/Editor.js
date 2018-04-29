import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Button,
    ImageBackground,
    ProgressBarAndroid,
    Image,
    TouchableOpacity,
    ScrollView,
	Slider
} from 'react-native';
import Canvas, {Image as CanvasImage, Path2D} from 'react-native-canvas';
import FiltersBar from "./FiltersBar";
import SizeAndRot from "./SizeAndRot";


let filters = require('../libs/filters.js');
let imageUtils = require('../libs/imageUtils.js');

let response;
let loadingBar = <ProgressBarAndroid styleAttr="Inverse"/>;

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
            loadingBar: null,
			rotationValue: null,
			currentPanel: null,
        };
		this.choosePanel = this.choosePanel.bind(this);
    }

    sepia() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = [];
            for (let i = 0; i < this.state.width * this.state.height; i++) {
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
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
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
            for (let i = 0; i < this.state.width * this.state.height; i++) {
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
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
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
            for (let i = 0; i < this.state.width * this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);
                let new_colors = [];
                let v = (0.2126 * colors[0] + 0.7152 * colors[1] + 0.0722 * colors[2] >= threshold) ? 255 : 0;
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
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
    }

    invert() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = [];
            for (let i = 0; i < this.state.width * this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);
                let new_colors = [];
                new_colors[0] = 255 - colors[0];
                new_colors[1] = 255 - colors[1];
                new_colors[2] = 255 - colors[2];
                new_colors[3] = colors[3];

                new_colors = imageUtils.normalaizeColors(new_colors);
                new_pixels[i] = imageUtils.RGBToInt(new_colors);
            }
            this.setState({
                pixels: new_pixels
            });
            imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
    }

    norm() {
        this.setState({
            loadingBar: loadingBar
        }, () => {

            this.setState({
                pixels: this.state.basePixels
            });
            imageUtils.getBase64FromPixels(this.state.basePixels, this.state.width, this.state.height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
    }

    sharp() {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = [];
            for (let i = 0; i < this.state.width * this.state.height; i++) {
                colors = imageUtils.toColorArr(this.state.basePixels[i]);

                new_red = colors[0] * 5;
                new_green = colors[1] * 5;
                new_blue = colors[2] * 5;

                if (i % (this.state.width + 1) > 0) {
                    new_red -= imageUtils.toColorArr(this.state.basePixels[i - 1])[0];
                    new_green -= imageUtils.toColorArr(this.state.basePixels[i - 1])[1];
                    new_blue -= imageUtils.toColorArr(this.state.basePixels[i - 1])[2];
                }
                if (i % (this.state.width + 1) < this.state.width) {
                    new_red -= imageUtils.toColorArr(this.state.basePixels[i + 1])[0];
                    new_green -= imageUtils.toColorArr(this.state.basePixels[i + 1])[1];
                    new_blue -= imageUtils.toColorArr(this.state.basePixels[i + 1])[2];
                }
                if (i >= this.state.width) {
                    new_red -= imageUtils.toColorArr(this.state.basePixels[i - this.state.width])[0];
                    new_green -= imageUtils.toColorArr(this.state.basePixels[i - this.state.width])[1];
                    new_blue -= imageUtils.toColorArr(this.state.basePixels[i - this.state.width])[2];
                }
                if (i <= this.state.width * this.state.height - this.state.width) {
                    new_red -= imageUtils.toColorArr(this.state.basePixels[i + this.state.width])[0];
                    new_green -= imageUtils.toColorArr(this.state.basePixels[i + this.state.width])[1];
                    new_blue -= imageUtils.toColorArr(this.state.basePixels[i + this.state.width])[2];
                }


                let new_colors = [];
                new_colors[0] = new_red;
                new_colors[1] = new_green;
                new_colors[2] = new_blue;
                new_colors[3] = colors[3];

                new_colors = imageUtils.normalaizeColors(new_colors);
                new_pixels[i] = imageUtils.RGBToInt(new_colors);
            }

            this.setState({
                pixels: new_pixels
            });
            imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
    }
	
	rotate() {
		let angle = -45;
		this.setState({
            loadingBar: loadingBar
        }, () => {
            let new_pixels = new Array(this.state.width * this.state.height);
			new_pixels.fill(-1);
			console.log(new_pixels);
            for (let i = 0; i < this.state.width * this.state.height; i++) {
                let pX = i % this.state.width - parseInt(this.state.width/2);
				let pY = parseInt(i / this.state.width) - parseInt(this.state.height/2);
				let npX = parseInt(Math.cos(angle)*pX - Math.sin(angle)*pY) + parseInt(this.state.width/2);
				let npY = parseInt(Math.sin(angle)*pX + Math.cos(angle)*pY) + parseInt(this.state.height/2);
				let newPix = npY * this.state.width + npX;
				if(npX >= 0 && npX < this.state.width && npY >= 0 && npY < this.state.height)
					new_pixels[i] = this.state.pixels[newPix];
				else
					new_pixels[i] = -1;
            }
            this.setState({
                pixels: new_pixels
            });
            imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
	}


    componentDidMount() {
		this.choosePanel("filter");
        const {params} = this.props.navigation.state;
        response = params.response;

        this.setState({
            loadingBar: loadingBar
        });
		console.log(123);
        imageUtils.getPixelsArray(response.path).then(res => {
			console.log(res);
            this.setState({
                pixels: res[0],
                basePixels: res[0],
                width: res[1],
                height: res[2]
            });
            this.setState({
                imageSource: {uri: response.uri},
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

	filterCallback(val) {
		switch(val) {
			case "gray":
				this.grayscale();
				break;
			case "sepia":
				this.sepia();
				break;
			case "noir":
				this.threshold();
				break;
			case "sharp":
				this.sharp();
				break;
			case "back":
				this.invert();
				break;
			case "norm":
				this.norm();
				break;
			
			
		}
	}

	choosePanel(panel) {
		switch(panel) {
			case "filter":
				this.setState({
					currentPanel: <FiltersBar callbackFunction={this.filterCallback.bind(this)}/>
				});
				break;
			case "size":
				this.setState({
					currentPanel: <SizeAndRot/>
				});
				break;
				
		}
	}
	
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.imageDesk}>
                    <ImageBackground source={this.state.imageSource} style={styles.uploadImage}>
                        {this.state.loadingBar}
                    </ImageBackground>
                </View>
                <View style={styles.editPanel}>
                    {this.state.currentPanel}
                </View>
                <View style={styles.bottomBar}>
					<TouchableOpacity onPress={() => this.choosePanel("filter")}>
						<Text style={{color: "#00CF68", fontSize: 16}}>FILTER</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.choosePanel("size")}>
						<Text style={{color: "white", fontSize: 16}}>SIZE&ROT</Text>
					</TouchableOpacity>
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
        justifyContent: 'center',
        flexGrow: 1,
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
        paddingRight: 30,
        borderTopColor: '#00CF68',
        borderTopWidth: 1,
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
    },
    imageDesk: {
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        top: 0,
    }
});
