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
    ScrollView
} from 'react-native';
import Canvas, {Image as CanvasImage, Path2D} from 'react-native-canvas';
import FiltersBar from "./FiltersBar";


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
            loadingBar: null
        };
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



    render() {
        return (
            <View style={styles.container}>
                <View style={styles.imageDesk}>
                    <ImageBackground source={this.state.imageSource} style={styles.uploadImage}>
                        {this.state.loadingBar}
                    </ImageBackground>
                </View>
                <View style={styles.editPanel}>
                    <ScrollView horizontal={true} style={{paddingTop: 15,
                        paddingLeft: 15,
                        paddingRight: 15}}>
                        <TouchableOpacity onPress={this.grayscale.bind(this)} style={{paddingRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center',
                            }} source={require('../assets/filters/gray.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>GRAY</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.sepia.bind(this)} style={{paddingRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center',
                            }} source={require('../assets/filters/sepia.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>SEPIA</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.threshold.bind(this)} style={{paddingRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center',
                            }} source={require('../assets/filters/threshold.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>NOIR</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.sharp.bind(this)} style={{paddingRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center',
                            }} source={require('../assets/filters/sharp.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>SHARP</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.invert.bind(this)} style={{paddingRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center',
                            }} source={require('../assets/filters/invert.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>BACK</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.norm.bind(this)} style={{marginRight: 15}}>
                            <ImageBackground style={{
                                width: 70, height: 70, alignItems: 'center',
                                justifyContent: 'center', marginRight: 15,
                            }} source={require('../assets/filters/norm.png')}>
                                <Text style={{
                                    color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: -1, height: 1},
                                    textShadowRadius: 5
                                }}>NORM</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
                <View style={styles.bottomBar}>
                    <Text style={{color: "#00CF68", fontSize: 16}}>FILTER</Text>
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
