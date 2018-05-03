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
import UnsharpMask from "./UnsharpMask";


let filters = require('../libs/filters.js');
let imageUtils = require('../libs/imageUtils.js');

let response;
let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse"/>;

export default class Editor extends React.Component {

    static navigationOptions = {
        title: 'Edit image',
        headerStyle: {
            backgroundColor: '#000',
            height: 40,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'normal',
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
            navigationColors: {
                filters: "#00CF68",
                sizeAndRot: "white",
                unsharpMask: "white"
            }
        };
        this.choosePanel = this.choosePanel.bind(this);
    }

    sepia() {
        this.setState({
            loadingBar: loadingBar
        });
        setTimeout(() => {
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
        }, 10);
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

    resize(size) {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let size = 50;
            let w_result = parseInt(this.state.width / 100 * size);
            let h_result = parseInt(this.state.height / 100 * size);

            let new_pixels = new Array(w_result * h_result);

            let e1, e2, e3, e4, x, y, index;
            let x_ratio = parseFloat(this.state.width - 1 / w_result);
            let y_ratio = parseFloat(this.state.height - 1 / h_result);
            let x_diff, y_diff;
            let offset = 0;
            for (let i = 0; i < h_result; i++) {
                for (let j = 0; j < w_result; j++) {

                    x = parseInt(x_ratio * j);
                    y = parseInt(y_ratio * i);
                    x_diff = parseFloat((x_ratio * j) - x);
                    y_diff = parseFloat((y_ratio * i) - y);
                    index = y * this.state.width + x;

                    e1 = index;
                    e2 = index + 1;
                    e3 = index + this.state.width;
                    e4 = index + this.state.width + 1;

                    let rgba = new Array(4);

                    for (let ri = 0; ri < 2; ri++) {
                        rgba[ri] = imageUtils.toColorArr(this.state.basePixels[e1])[ri] * (1 - x_diff) * (1 - y_diff) + imageUtils.toColorArr(this.state.basePixels[e2])[ri] * (x_diff) * (1 - y_diff) + imageUtils.toColorArr(this.state.basePixels[e3])[ri] * (y_diff) * (1 - x_diff) + imageUtils.toColorArr(this.state.basePixels[e4])[ri] * (x_diff * y_diff);
                    }


                    rgba[3] = imageUtils.toColorArr(this.state.basePixels[e1])[3];


                    new_pixels[offset++] = imageUtils.RGBToInt(imageUtils.normalaizeColors(rgba));
                }
            }

            this.setState({
                pixels: new_pixels
            });

            imageUtils.getBase64FromPixels(new_pixels, w_result, h_result).then(res => {
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

    convolution(weights) {
        let new_pixels = [];
        this.setState({
            loadingBar: loadingBar
        }, () => {

        });
        if (weights.length == 1) {
            return this.state.basePixels;
        }
        let side = Math.round(Math.sqrt(weights.length));
        let halfSide = Math.floor(side / 2);
        for (let y = 0; y < this.state.height; y++) {
            for (let x = 0; x < this.state.width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        let scy = y + cy - halfSide;
                        let scx = x + cx - halfSide;
                        if (scy >= 0 && scy < this.state.height && scx >= 0 && scx < this.state.width) {
                            let srcOff = (scy * this.state.width + scx);
                            let wt = weights[cy * side + cx];
                            r += imageUtils.toColorArr(this.state.basePixels[srcOff])[0] * wt;
                            g += imageUtils.toColorArr(this.state.basePixels[srcOff])[1] * wt;
                            b += imageUtils.toColorArr(this.state.basePixels[srcOff])[2] * wt;
                            a += imageUtils.toColorArr(this.state.basePixels[srcOff])[3] * wt;
                        }
                    }
                }
                let new_colors = [r, g, b, 1];
                new_colors = imageUtils.normalaizeColors(new_colors);
                new_pixels[y * this.state.width + x] = imageUtils.RGBToInt(new_colors);
            }
        }
        return new_pixels;
    }

    rotate(angle) {
        let b_angle = (angle % 90) * (Math.PI / 180);
        angle = -angle * (Math.PI / 180);
        this.setState({
            loadingBar: loadingBar
        }, () => {
            let tw = Math.max(this.state.width, this.state.height);
            let th = Math.min(this.state.width, this.state.height);
            let k = 1 / ((tw / th) * Math.sin(b_angle) + Math.cos(b_angle));
            let n_width = Math.floor(this.state.width * k);
            let n_height = Math.floor(this.state.height * k);
            let dx = Math.ceil((this.state.width - n_width) / 2);
            let dy = Math.ceil((this.state.height - n_height) / 2);

            let new_pixels = new Array(this.state.width * this.state.height);
            new_pixels.fill(-1);
            for (let i = 0; i < this.state.width * this.state.height; i++) {
                let pX = i % this.state.width - parseInt(this.state.width / 2);
                let pY = parseInt(i / this.state.width) - parseInt(this.state.height / 2);
                let npX = parseInt(Math.cos(angle) * pX - Math.sin(angle) * pY) + parseInt(this.state.width / 2);
                let npY = parseInt(Math.sin(angle) * pX + Math.cos(angle) * pY) + parseInt(this.state.height / 2);
                let newPix = npY * this.state.width + npX;

                if (npX >= 0 && npX < this.state.width && npY >= 0 && npY < this.state.height)
                    new_pixels[i] = this.state.basePixels[newPix];
                else
                    new_pixels[i] = -1;
            }

            let weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
            let new_pixels_filter = [];
            let side = Math.round(Math.sqrt(weights.length));
            let halfSide = Math.floor(side / 2);
            for (let y = 0; y < this.state.height; y++) {
                for (let x = 0; x < this.state.width; x++) {
                    let r = 0, g = 0, b = 0, a = 0;
                    for (let cy = 0; cy < side; cy++) {
                        for (let cx = 0; cx < side; cx++) {
                            let scy = y + cy - halfSide;
                            let scx = x + cx - halfSide;
                            if (scy >= 0 && scy < this.state.height && scx >= 0 && scx < this.state.width) {
                                let srcOff = (scy * this.state.width + scx);
                                let wt = weights[cy * side + cx];
                                r += imageUtils.toColorArr(new_pixels[srcOff])[0] * wt;
                                g += imageUtils.toColorArr(new_pixels[srcOff])[1] * wt;
                                b += imageUtils.toColorArr(new_pixels[srcOff])[2] * wt;
                                a += imageUtils.toColorArr(new_pixels[srcOff])[3];
                            }
                        }
                    }
                    let new_colors = [r, g, b, a];
                    new_colors = imageUtils.normalaizeColors(new_colors);
                    new_pixels_filter[y * this.state.width + x] = imageUtils.RGBToInt(new_colors);
                }
            }

            let crop_pixels = new Array(n_width * n_height);
            for (let i = 0; i < n_width * n_height; i++) {
                let pX = i % n_width;
                let pY = parseInt(i / n_width);
                pX += dx;
                pY += dy;
                let newPix = pY * this.state.width + pX;
                crop_pixels[i] = new_pixels_filter[newPix];
            }


            this.setState({
                pixels: new_pixels_filter
            });
            imageUtils.getBase64FromPixels(crop_pixels, n_width, n_height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });
        });
    }

    unsharpMask(radius, amount, threshold) {
        radius = radius * 2 + 1;
        let weights = new Array(radius * radius);
        let halfSide = Math.floor(radius / 2);
        let sigma = halfSide;
        let sum = 0;
        for (let y = 0; y < radius; y++) {
            for (let x = 0; x < radius; x++) {
                let nx = x - halfSide;
                let ny = y - halfSide;
                let w = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(nx * nx + ny * ny) / (2 * sigma * sigma));
                let offset = y * radius + x;
                weights[offset] = w;
                sum += w;
            }
        }
        for (let i = 0; i < weights.length; i++) {
            weights[i] /= sum;
        }


        let blured_pixels = this.convolution(weights);

        let new_pixels = [];

        for (let i = 0; i < this.state.width * this.state.height; i++) {
            let orig_luminosity = (imageUtils.toColorArr(this.state.basePixels[i])[0] + imageUtils.toColorArr(this.state.basePixels[i])[1] + imageUtils.toColorArr(this.state.basePixels[i])[2]) / 3;
            let blured_luminosity = (imageUtils.toColorArr(blured_pixels[i])[0] + imageUtils.toColorArr(blured_pixels[i])[1] + imageUtils.toColorArr(blured_pixels[i])[2]) / 3;
            let diff = orig_luminosity - blured_luminosity;

            if (Math.abs(2 * diff) > threshold) {
                let colors = imageUtils.toColorArr(this.state.basePixels[i]);
                colors[0] += amount * diff;
                colors[1] += amount * diff;
                colors[2] += amount * diff;
                colors = imageUtils.normalaizeColors(colors);
                new_pixels[i] = imageUtils.RGBToInt(colors);
            }
            else {
                new_pixels[i] = this.state.basePixels[i];
            }
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
    }

    sharp() {
        let new_pixels = this.convolution([-1, -1, -1,
            -1, 9, -1,
            -1, -1, -1]);


        this.setState({
            pixels: new_pixels
        });
        imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
            this.setState({
                imageSource: {uri: 'data:image/jpeg;base64,' + res},
                loadingBar: null
            });
        });
    }

    edgeDetection() {
        let new_pixels = this.convolution([0, 1, 0,
            1, -4, 1,
            0, 1, 0]);


        this.setState({
            pixels: new_pixels
        });
        imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
            this.setState({
                imageSource: {uri: 'data:image/jpeg;base64,' + res},
                loadingBar: null
            });
        });
    }

    emboss(){
        let new_pixels = this.convolution([0, 1, 0,
            1, 0, -1,
            0, -1, 0]);

        for (let i = 0; i < this.state.width * this.state.height; i++) {

            let colors = imageUtils.toColorArr(new_pixels[i]);
            colors[0] += 128;
            colors[1] += 128;
            colors[2] += 128;
            colors = imageUtils.normalaizeColors(colors);
            new_pixels[i] = imageUtils.RGBToInt(colors);

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
    }

    async sobel(){
        let new_pixels = this.convolution([ -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1 ]);
        await this.setState({
            pixels: new_pixels
        }, () => {
            setTimeout(() => {
                new_pixels = this.convolution([ -1, 0, 1,
                    -2, 0, 2,
                    -1, 0, 1 ]);

                this.setState({
                    pixels: new_pixels
                });
                imageUtils.getBase64FromPixels(new_pixels, this.state.width, this.state.height).then(res => {
                    this.setState({
                        imageSource: {uri: 'data:image/jpeg;base64,' + res},
                        loadingBar: null
                    });
                });
            }, 10);
        });
    }

    componentDidMount() {
        this.choosePanel("filter");
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

    filterCallback(val) {
        switch (val) {
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
            case "edge":
                this.edgeDetection();
                break;
            case "emboss":
                this.emboss();
                break;
            case "sobel":
                this.sobel();
                break;

        }
    }

    sizeAndRotCallback(size, rot) {
        this.setState({
            loadingBar: loadingBar
        }, () => {
            this.rotate(rot);
            //this.resize(size);
        });
    }

    choosePanel(panel) {
        switch (panel) {
            case "filter":
                this.setState({
                    currentPanel: <FiltersBar callbackFunction={this.filterCallback.bind(this)}/>,
                    navigationColors: {
                        filters: "#00CF68",
                        sizeAndRot: "white",
                        unsharpMask: "white"
                    }
                });
                break;
            case "size":
                this.setState({
                    currentPanel: <SizeAndRot callbackFunction={this.sizeAndRotCallback.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "#00CF68",
                        unsharpMask: "white"
                    }
                });
                break;
            case "usm":
                this.setState({
                    currentPanel: <UnsharpMask callbackFunction={this.unsharpMask.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "white",
                        unsharpMask: "#00CF68"
                    }
                });
                break;

        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.imageDesk}>
                    <ImageBackground resizeMode={"contain"} source={this.state.imageSource} style={styles.uploadImage}>
                        {this.state.loadingBar}
                    </ImageBackground>
                </View>
                <View style={styles.editPanel}>
                    {this.state.currentPanel}
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={() => this.choosePanel("filter")}>
                        <Text style={{color: this.state.navigationColors.filters, fontSize: 16}}>FILTER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("size")}>
                        <Text style={{color: this.state.navigationColors.sizeAndRot, fontSize: 16}}>SIZE&ROT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("usm")}>
                        <Text style={{color: this.state.navigationColors.unsharpMask, fontSize: 16}}>USM</Text>
                    </TouchableOpacity>
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
        paddingLeft: 15,
        paddingRight: 15,
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
