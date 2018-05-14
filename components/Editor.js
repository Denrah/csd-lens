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
    Slider,
    TouchableWithoutFeedback,
    ToastAndroid,
	NativeModules,
} from 'react-native';
import Canvas, {Image as CanvasImage, Path2D} from 'react-native-canvas';
import {WebGLView} from "react-native-webgl";
import FiltersBar from "./FiltersBar";
import SizeAndRot from "./SizeAndRot";
import UnsharpMask from "./UnsharpMask";
import LinearFiltration from "./LinearFiltration";
import Retouch from './Retouch';


let filters = require('../libs/filters.js');
let imageUtils = require('../libs/imageUtils.js');

let response;
let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse"/>;

export default class Editor extends React.Component {

    static navigationOptions = ({navigation}) => {
        const params = navigation.state.params || {resizeImage: require('../assets/ui/full_size.png')};
        return {
            title: 'Edit image',
            headerStyle: {
                backgroundColor: '#000',
                height: 40,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'normal',
            },
            headerRight: (
				<View style={{width: 60, flex: 1, flexDirection: 'row', alignItems: "center", justifyContent: "center"}}>
					<TouchableOpacity onPress={params.setResizeMode}>
						<Image style={{
							width: 20, height: 20, marginRight: 10
						}} source={params.resizeImage}>
						</Image>
					</TouchableOpacity>
					<TouchableOpacity onPress={params.savePicture}>
						<Image style={{
							width: 20, height: 20, marginRight: 10
						}} source={require('../assets/ui/save.png')}>
						</Image>
					</TouchableOpacity>
				</View>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            imageSource: null,
            pixels: null,
            basePixels: null,
			baseSource: null,
			newWidth: null,
			newHeight: null,
            width: null,
            height: null,
            canvas: null,
            loadingBar: null,
            rotationValue: null,
            currentPanel: null,
            navigationColors: {
                filters: "#00CF68",
                sizeAndRot: "white",
                unsharpMask: "white",
                linearFiltration: "white",
                retouch: "white"
            },
            transformDots: {
                count: 0,
                f1: {x: -10, y: 0},
                f2: {x: -10, y: 0},
                f3: {x: -10, y: 0},
                s1: {x: -10, y: 0},
                s2: {x: -10, y: 0},
                s3: {x: -10, y: 0}
            },
            transformDotsCoordinates: {
                f1: {x: 0, y: 0},
                f2: {x: 0, y: 0},
                f3: {x: 0, y: 0},
                s1: {x: 0, y: 0},
                s2: {x: 0, y: 0},
                s3: {x: 0, y: 0}
            },
            imageContainer: {
                width: 0,
                height: 0
            },
            rngl: null,
            gl: null,
            drawableDots: null,
            imageMode: "contain",
            panelIndex: 1,
			wasChanged: false,
            retouchCircle: null,
            retouchRadius: 1,
            retouchAmount: 1,
            retouchX: 0,
            retouchY: 0,
        };
        this.choosePanel = this.choosePanel.bind(this);
        this.setResizeMode = this.setResizeMode.bind(this);
		this.savePixels = this.savePixels.bind(this);
		this.savePicture = this.savePicture.bind(this);
    }
	
	savePicture() {
		this.props.navigation.navigate('SaveImage', {image: this.state.baseSource, pixels: this.state.basePixels, width: this.state.width, height: this.state.height});
	}

    savePixels() {
        this.setState({
            basePixels: this.state.pixels,
			baseSource: this.state.imageSource,
			width: this.state.newWidth,
			height: this.state.newHeight,
			wasChanged: false,
            retouchCircle: null,
        });
    }
	
	cancelSavePixels() {
        this.setState({
			wasChanged: false,
			imageSource: this.state.baseSource,
            retouchCircle: null,
        });
    }

    updateImage(src, callback) {
        this.state.gl.viewport(0, 0, this.state.gl.drawingBufferWidth, this.state.gl.drawingBufferHeight);
        let buffer = this.state.gl.createBuffer();
        this.state.gl.bindBuffer(this.state.gl.ARRAY_BUFFER, buffer);
        this.state.gl.bufferData(
            this.state.gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 4, 4, -1]),
            this.state.gl.STATIC_DRAW
        );
        let vertexShader = this.state.gl.createShader(this.state.gl.VERTEX_SHADER);
        this.state.gl.shaderSource(
            vertexShader,
            `\
			attribute vec2 p;
			varying vec2 uv;
			void main() {
			  gl_Position = vec4(p,1.0,1.0);
			  uv = 0.5 * (p+1.0);
			}`
        );
        this.state.gl.compileShader(vertexShader);
        const fragmentShader = this.state.gl.createShader(this.state.gl.FRAGMENT_SHADER);
        this.state.gl.shaderSource(
            fragmentShader,
            `\
			precision highp float;
			varying vec2 uv;
			uniform sampler2D t;
			void main() {
			  gl_FragColor = texture2D(t, uv);
			}`
        );
        this.state.gl.compileShader(fragmentShader);
        let program = this.state.gl.createProgram();
        this.state.gl.attachShader(program, vertexShader);
        this.state.gl.attachShader(program, fragmentShader);
        this.state.gl.linkProgram(program);
        this.state.gl.useProgram(program);
        let p = this.state.gl.getAttribLocation(program, "p");
        this.state.gl.enableVertexAttribArray(p);
        this.state.gl.vertexAttribPointer(p, 2, this.state.gl.FLOAT, false, 0, 0);
        this.state.rngl
            .loadTexture({image: src, yflip: true})
            .then(({texture}) => {
                this.state.gl.activeTexture(this.state.gl.TEXTURE0);
                this.state.gl.bindTexture(this.state.gl.TEXTURE_2D, texture);
                this.state.gl.drawArrays(this.state.gl.TRIANGLES, 0, 3);
                this.state.gl.flush();
                this.state.rngl.endFrame();
            });
        //
        if (typeof callback == "function")
            callback();
    }

    setResizeMode() {

        if (this.state.panelIndex == 4) {
            ToastAndroid.show("You can't set resize mode in linear filtration tool", ToastAndroid.LONG);
            return;
        }

        if (this.state.imageMode === "contain") {
            this.setState({imageMode: "cover"});
            this.props.navigation.setParams({resizeImage: require('../assets/ui/min_size.png')});
        }
        else {
            this.setState({imageMode: "contain"});
            this.props.navigation.setParams({resizeImage: require('../assets/ui/full_size.png')});
        }
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
                new_colors[3] = 1;

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
			
			 let new_pixels_filter = [];
			
			if(angle !== 0)
			{
				let weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
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
			}
			else
			{
				new_pixels_filter = new_pixels;
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
                pixels: crop_pixels,
				newWidth: n_width,
				newHeight: n_height
            });
            /*imageUtils.getBase64FromPixels(crop_pixels, n_width, n_height).then(res => {
                this.setState({
                    imageSource: {uri: 'data:image/jpeg;base64,' + res},
                    loadingBar: null
                });
            });*/
        });
    }

    resize(size) {
        this.setState({
            loadingBar: loadingBar
        }, () => {
	
			
			let k = size/100;
			
			let new_pixels = [];
			
			
			let pixels_size1 = [];
			let pixels_size2 = [];
			let tmp_p = this.state.pixels;
			let tmp_w = this.state.newWidth;
			let tmp_h = this.state.newHeight;
			let p1, p2;
			let dk = 1/k;
			
			let ps1w, ps2w, ps1h, ps2h;

			if (k < 1) {


				for (let i = 1; i < dk; i *= 2) {
					if (i * 2 >= dk) {
						p1 = i;
						p2 = i * 2;
					}
				}
				
				if (p1 === 1)
				{
					pixels_size1 = tmp_p;
					ps1w = tmp_w;
					ps1h = tmp_h;
				}
				for (let i = 2; i <= p2; i *= 2) {
					let t = this.convolution([0, 0, 0, 0, 1/4, 1/4, 0, 1/4, 1/4], tmp_p, tmp_w, tmp_h);
					tmp_p = [];
					for (let j = 0; j < Math.floor(tmp_w / 2) * Math.floor(tmp_h / 2); j++) {
						let tpX = (j % Math.floor(tmp_w / 2)) * 2;
						let tpY = parseInt(j / Math.floor(tmp_w / 2)) * 2;
						tmp_p[j] = t[tpY * tmp_w + tpX];
					}

					tmp_w = Math.floor(tmp_w/2);
					tmp_h = Math.floor(tmp_h/2);


					if (i === p1) {
						pixels_size1 = tmp_p;
						ps1w = tmp_w;
						ps1h = tmp_h;
					}
					if (i === p2) {
						pixels_size2 = tmp_p;
						ps2w = tmp_w;
						ps2h = tmp_h;
					}

				}
			}	
			
			for(let i = 0; i < this.state.newWidth * this.state.newHeight; i++)
			{
				let pX = i % this.state.newWidth - parseInt(this.state.newWidth / 2);
                let pY = parseInt(i / this.state.newWidth) - parseInt(this.state.newHeight / 2);
				
				let npX = Math.round(pX / k) + parseInt(this.state.newWidth / 2);
				let npY = Math.round(pY / k) + parseInt(this.state.newHeight / 2);
				
				if(npX >= 0 && npY >= 0 && npX < this.state.newWidth && npY < this.state.newHeight)
				{
					if(k > 1)
						new_pixels[i] = this.bilinearFilter(npX, npY, this.state.pixels, this.state.newWidth);
					else if(k < 1)
						new_pixels[i] = this.trilinearFiltration(npX, npY, pixels_size1, pixels_size2, ps1w, ps2w, p1, p2, dk);
					else
						new_pixels[i] = this.state.pixels[npY * this.state.newWidth + npX];
				}
				else
				{
					new_pixels[i] = -1;
				}
			}
			
            /*let w_result = parseInt(this.state.width / 100 * size);
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
            }*/

            this.setState({
                pixels: new_pixels,
            });

            imageUtils.getBase64FromPixels(new_pixels, this.state.newWidth, this.state.newHeight).then(res => {
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

    convolution(weights, pixelsData, width, height) {
        let new_pixels = [];
        this.setState({
            loadingBar: loadingBar
        }, () => {

        });
        if (weights.length === 1) {
            return pixelsData;
        }
        let side = Math.round(Math.sqrt(weights.length));
        let halfSide = Math.floor(side / 2);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                for (let cy = 0; cy < side; cy++) {
                    for (let cx = 0; cx < side; cx++) {
                        let scy = y + cy - halfSide;
                        let scx = x + cx - halfSide;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            let srcOff = (scy * width + scx);
                            let wt = weights[cy * side + cx];
                            r += imageUtils.toColorArr(pixelsData[srcOff])[0] * wt;
                            g += imageUtils.toColorArr(pixelsData[srcOff])[1] * wt;
                            b += imageUtils.toColorArr(pixelsData[srcOff])[2] * wt;
                            a += imageUtils.toColorArr(pixelsData[srcOff])[3] * wt;
                        }
                    }
                }
                let new_colors = [r, g, b, 1];
                new_colors = imageUtils.normalaizeColors(new_colors);
                new_pixels[y * width + x] = imageUtils.RGBToInt(new_colors);
            }
        }
        return new_pixels;
    }

   

    unsharpMask(radius, amount, threshold) {
		this.setState({
			wasChanged: true,
		});
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


        let blured_pixels = this.convolution(weights, this.state.basePixels, this.state.width, this.state.height);

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
            -1, -1, -1], this.state.basePixels, this.state.width, this.state.height);


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
            0, 1, 0], this.state.basePixels, this.state.width, this.state.height);


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

    emboss() {
        let new_pixels = this.convolution([0, 1, 0,
            1, 0, -1,
            0, -1, 0], this.state.basePixels, this.state.width, this.state.height);

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

    async sobel() {
        let new_pixels = this.convolution([-1, 0, 1,
            -2, 0, 2,
            -1, 0, 1], this.state.basePixels, this.state.width, this.state.height);
        await this.setState({
            pixels: new_pixels
        }, () => {
            setTimeout(() => {
                new_pixels = this.convolution([-1, 0, 1,
                    -2, 0, 2,
                    -1, 0, 1], new_pixels, this.state.width, this.state.height);

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
        this.props.navigation.setParams({
            setResizeMode: this.setResizeMode,
			savePicture: this.savePicture,
            resizeImage: require('../assets/ui/full_size.png')
        });
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
                height: res[2],
				newWidth: res[1],
				newHeight: res[2]
            });
            this.setState({
                imageSource: {uri: response.uri},
				baseSource: {uri: response.uri},
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
		this.setState({
			wasChanged: true,
		});
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
            loadingBar: loadingBar,
			wasChanged: true,
        }, () => {
            this.rotate(rot);
            setTimeout(() => {this.resize(size)}, 10);
        });
    }

    linearFiltration(type) {
        switch (type) {
            case "set":
                this.dotsToImageCoordinates();
                break;
            case "clear":
                this.setState({
                    currentPanel: <LinearFiltration dotsCount={0} callbackFunction={this.linearFiltration.bind(this)}/>,
                    transformDots: {
                        count: 0,
                        f1: {x: -10, y: 0},
                        f2: {x: -10, y: 0},
                        f3: {x: -10, y: 0},
                        s1: {x: -10, y: 0},
                        s2: {x: -10, y: 0},
                        s3: {x: -10, y: 0}
                    },
                    transformDotsCoordinates: {
                        f1: {x: 0, y: 0},
                        f2: {x: 0, y: 0},
                        f3: {x: 0, y: 0},
                        s1: {x: 0, y: 0},
                        s2: {x: 0, y: 0},
                        s3: {x: 0, y: 0}
                    }
                }, () => {
                    this.drawDots()
                });
                break;
        }
    }

    choosePanel(panel) {
		this.setState({
			imageSource: this.state.baseSource
		});
        switch (panel) {
            case "filter":
                this.setState({
                    currentPanel: <FiltersBar callbackFunction={this.filterCallback.bind(this)}/>,
                    navigationColors: {
                        filters: "#00CF68",
                        sizeAndRot: "white",
                        unsharpMask: "white",
                        linearFiltration: "white",
                        retouch: "white"
                    },
                    panelIndex: 1
                });
                break;
            case "size":
                this.setState({
                    currentPanel: <SizeAndRot callbackFunction={this.sizeAndRotCallback.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "#00CF68",
                        unsharpMask: "white",
                        linearFiltration: "white",
                        retouch: "white"
                    },
                    panelIndex: 2
                });
                break;
            case "usm":
                this.setState({
                    currentPanel: <UnsharpMask callbackFunction={this.unsharpMask.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "white",
                        unsharpMask: "#00CF68",
                        linearFiltration: "white",
                        retouch: "white"
                    },
                    panelIndex: 3
                });
                break;
            case "lin":
                this.setState({
                    currentPanel: <LinearFiltration dotsCount={this.state.transformDots.count} callbackFunction={this.linearFiltration.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "white",
                        unsharpMask: "white",
                        linearFiltration: "#00CF68",
                        retouch: "white"
                    },
                    panelIndex: 4
                });
                if (this.state.imageMode === "cover")
                    this.setResizeMode();
                break;
            case "reto":
                this.setState({
                    currentPanel: <Retouch callbackFunction={this.retouchCallback.bind(this)}/>,
                    navigationColors: {
                        filters: "white",
                        sizeAndRot: "white",
                        unsharpMask: "white",
                        linearFiltration: "white",
                        retouch: "#00CF68"
                    },
                    panelIndex: 5
                });
                break;

        }
    }

    drawDots() {
        this.setState({
            drawableDots: (
                <View style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
                    <View style={[styles.circle, {
                        backgroundColor: '#00CF68',
                        left: this.state.transformDots.f1.x - 2,
                        top: this.state.transformDots.f1.y - 2
                    }]}/>
                    <View style={[styles.circle, {
                        backgroundColor: '#00CF68',
                        left: this.state.transformDots.f2.x - 2,
                        top: this.state.transformDots.f2.y - 2
                    }]}/>
                    <View style={[styles.circle, {
                        backgroundColor: '#00CF68',
                        left: this.state.transformDots.f3.x - 2,
                        top: this.state.transformDots.f3.y - 2
                    }]}/>
                    <View style={[styles.circle, {
                        backgroundColor: 'red',
                        left: this.state.transformDots.s1.x - 2,
                        top: this.state.transformDots.s1.y - 2
                    }]}/>
                    <View style={[styles.circle, {
                        backgroundColor: 'red',
                        left: this.state.transformDots.s2.x - 2,
                        top: this.state.transformDots.s2.y - 2
                    }]}/>
                    <View style={[styles.circle, {
                        backgroundColor: 'red',
                        left: this.state.transformDots.s3.x - 2,
                        top: this.state.transformDots.s3.y - 2
                    }]}/>
                </View>
            )
        });
    }

    bilinearFilter(npX, npY, matrix, w) {
        let color = [];
        let r1 = 0, g1 = 0, b1 = 0;
        let r2 = 0, g2 = 0, b2 = 0;

        newPix = Math.floor(npY) * w + Math.floor(npX);
        color = imageUtils.toColorArr(matrix[newPix]);
        r1 += color[0] * (1 - (npX - Math.floor(npX)));
        g1 += color[1] * (1 - (npX - Math.floor(npX)));
        b1 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.floor(npY) * w + Math.ceil(npX);
        color = imageUtils.toColorArr(matrix[newPix]);
        r1 += color[0] * (npX - Math.floor(npX));
        g1 += color[1] * (npX - Math.floor(npX));
        b1 += color[2] * (npX - Math.floor(npX));

        r1 *= (1 - (npY - Math.floor(npY)));
        g1 *= (1 - (npY - Math.floor(npY)));
        b1 *= (1 - (npY - Math.floor(npY)));

        newPix = Math.ceil(npY) * w + Math.floor(npX);
        color = imageUtils.toColorArr(matrix[newPix]);
        r2 += color[0] * (1 - (npX - Math.floor(npX)));
        g2 += color[1] * (1 - (npX - Math.floor(npX)));
        b2 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.ceil(npY) * w + Math.ceil(npX);
        color = imageUtils.toColorArr(matrix[newPix]);
        r2 += color[0] * (npX - Math.floor(npX));
        g2 += color[1] * (npX - Math.floor(npX));
        b2 += color[2] * (npX - Math.floor(npX));

        r2 *= (npY - Math.floor(npY));
        g2 *= (npY - Math.floor(npY));
        b2 *= (npY - Math.floor(npY));

        return imageUtils.RGBToInt(imageUtils.normalaizeColors([r1 + r2, g1 + g2, b1 + b2, 1]));
    }

    trilinearFiltration(npX, npY, pixels_size1, pixels_size2, ps1w, ps2w, p1, p2, dk) {


        let color = [];
        let r1 = 0, g1 = 0, b1 = 0;
        let r2 = 0, g2 = 0, b2 = 0;

        newPix = Math.floor(npY / p1) * ps1w + Math.floor(npX / p1);
        if (newPix >= pixels_size1.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size1[newPix]);
        r1 += color[0] * (1 - (npX - Math.floor(npX)));
        g1 += color[1] * (1 - (npX - Math.floor(npX)));
        b1 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.floor(npY / p1) * ps1w + Math.ceil(npX / p1);
        if (newPix >= pixels_size1.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size1[newPix]);
        r1 += color[0] * (npX - Math.floor(npX));
        g1 += color[1] * (npX - Math.floor(npX));
        b1 += color[2] * (npX - Math.floor(npX));

        r1 *= (1 - (npY - Math.floor(npY)));
        g1 *= (1 - (npY - Math.floor(npY)));
        b1 *= (1 - (npY - Math.floor(npY)));

        newPix = Math.ceil(npY / p1) * ps1w + Math.floor(npX / p1);
        if (newPix >= pixels_size1.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size1[newPix]);
        r2 += color[0] * (1 - (npX - Math.floor(npX)));
        g2 += color[1] * (1 - (npX - Math.floor(npX)));
        b2 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.ceil(npY / p1) * ps1w + Math.ceil(npX / p1);
        if (newPix >= pixels_size1.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size1[newPix]);
        r2 += color[0] * (npX - Math.floor(npX));
        g2 += color[1] * (npX - Math.floor(npX));
        b2 += color[2] * (npX - Math.floor(npX));

        r2 *= (npY - Math.floor(npY));
        g2 *= (npY - Math.floor(npY));
        b2 *= (npY - Math.floor(npY));

        let tr1 = r1 + r2;
        let tg1 = g1 + g2;
        let tb1 = b1 + b2;

        r1 = 0;
        g1 = 0;
        b1 = 0;
        r2 = 0;
        g2 = 0;
        b2 = 0;

        newPix = Math.floor(npY / p2) * ps2w + Math.floor(npX / p2);
        if (newPix >= pixels_size2.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size2[newPix]);
        r1 += color[0] * (1 - (npX - Math.floor(npX)));
        g1 += color[1] * (1 - (npX - Math.floor(npX)));
        b1 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.floor(npY / p2) * ps2w + Math.ceil(npX / p2);
        if (newPix >= pixels_size2.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size2[newPix]);
        r1 += color[0] * (npX - Math.floor(npX));
        g1 += color[1] * (npX - Math.floor(npX));
        b1 += color[2] * (npX - Math.floor(npX));

        r1 *= (1 - (npY - Math.floor(npY)));
        g1 *= (1 - (npY - Math.floor(npY)));
        b1 *= (1 - (npY - Math.floor(npY)));

        newPix = Math.ceil(npY / p2) * ps2w + Math.floor(npX / p2);
        if (newPix >= pixels_size2.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size2[newPix]);
        r2 += color[0] * (1 - (npX - Math.floor(npX)));
        g2 += color[1] * (1 - (npX - Math.floor(npX)));
        b2 += color[2] * (1 - (npX - Math.floor(npX)));

        newPix = Math.ceil(npY / p2) * ps2w + Math.ceil(npX / p2);

        if (newPix >= pixels_size2.length)
            color = [255, 255, 255, 1];
        else
            color = imageUtils.toColorArr(pixels_size2[newPix]);
        r2 += color[0] * (npX - Math.floor(npX));
        g2 += color[1] * (npX - Math.floor(npX));
        b2 += color[2] * (npX - Math.floor(npX));

        r2 *= (npY - Math.floor(npY));
        g2 *= (npY - Math.floor(npY));
        b2 *= (npY - Math.floor(npY));

        let tr2 = r1 + r2;
        let tg2 = g1 + g2;
        let tb2 = b1 + b2;


        let r = Math.round((tr1 * (p2 - dk) + tr2 * (dk - p1)) / p1);
        let g = Math.round((tg1 * (p2 - dk) + tg2 * (dk - p1)) / p1);
        let b = Math.round((tb1 * (p2 - dk) + tb2 * (dk - p1)) / p1);

        return imageUtils.RGBToInt(imageUtils.normalaizeColors([tr1, tg1, tb1, 1]));
    }


    dotsToImageCoordinates() {
		this.setState({
			wasChanged: true,
		});
        let k = (this.state.width > this.state.height) ? parseFloat(this.state.width / this.state.imageContainer.width) : parseFloat(this.state.height / this.state.imageContainer.height);
        let tmp = this.state.transformDotsCoordinates;
        for (let key in this.state.transformDotsCoordinates) {
            tmp[key].x = Math.round(this.state.transformDots[key].x * k - Math.max((this.state.imageContainer.width * k - this.state.width) / 2, 0));
            tmp[key].y = Math.round(this.state.transformDots[key].y * k - Math.max((this.state.imageContainer.height * k - this.state.height) / 2, 0));
        }
        this.setState({
            transformDotsCoordinates: tmp
        });

        let x1 = this.state.transformDotsCoordinates.f1.x;
        let x2 = this.state.transformDotsCoordinates.f2.x;
        let x3 = this.state.transformDotsCoordinates.f3.x;
        let y1 = this.state.transformDotsCoordinates.f1.y;
        let y2 = this.state.transformDotsCoordinates.f2.y;
        let y3 = this.state.transformDotsCoordinates.f3.y;

        let sx1 = this.state.transformDotsCoordinates.s1.x;
        let sx2 = this.state.transformDotsCoordinates.s2.x;
        let sx3 = this.state.transformDotsCoordinates.s3.x;
        let sy1 = this.state.transformDotsCoordinates.s1.y;
        let sy2 = this.state.transformDotsCoordinates.s2.y;
        let sy3 = this.state.transformDotsCoordinates.s3.y;

        let det = sx1 * sy2 + sx2 * sy3 + sx3 * sy1 - sx3 * sy2 - sx2 * sy1 - sx1 * sy3;


        let invertMatrix = [[(sy2 - sy3) / det, (sx3 - sx2) / det, (sx2 * sy3 - sy2 * sx3) / det],
            [(sy3 - sy1) / det, (sx1 - sx3) / det, (sx3 * sy1 - sx1 * sy3) / det],
            [(sy1 - sy2) / det, (sx2 - sx1) / det, (sx1 * sy2 - sx2 * sy1) / det]];


        let transformMatrix = [[x1 * invertMatrix[0][0] + x2 * invertMatrix[1][0] + x3 * invertMatrix[2][0],
            x1 * invertMatrix[0][1] + x2 * invertMatrix[1][1] + x3 * invertMatrix[2][1],
            x1 * invertMatrix[0][2] + x2 * invertMatrix[1][2] + x3 * invertMatrix[2][2]],
            [y1 * invertMatrix[0][0] + y2 * invertMatrix[1][0] + y3 * invertMatrix[2][0],
                y1 * invertMatrix[0][1] + y2 * invertMatrix[1][1] + y3 * invertMatrix[2][1],
                y1 * invertMatrix[0][2] + y2 * invertMatrix[1][2] + y3 * invertMatrix[2][2]],
            [1 * invertMatrix[0][0] + 1 * invertMatrix[1][0] + 1 * invertMatrix[2][0],
                1 * invertMatrix[0][1] + 1 * invertMatrix[1][1] + 1 * invertMatrix[2][1],
                1 * invertMatrix[0][2] + 1 * invertMatrix[1][2] + 1 * invertMatrix[2][2]]];


        let new_pixels = [];

        let delta = transformMatrix[0][0] * transformMatrix[1][1] - transformMatrix[0][1] * transformMatrix[1][0];

        let pixels_size1 = [];
        let pixels_size2 = [];
        let tmp_p = this.state.basePixels;
        let tmp_w = this.state.width;
        let tmp_h = this.state.height;
        let p1, p2;
        let dk = Math.sqrt(delta);
		let ps1w, ps2w, ps1h, ps2h;

        if (delta >= 1) {


            for (let i = 1; i < dk; i *= 2) {
                if (i * 2 >= dk) {
                    p1 = i;
                    p2 = i * 2;
                }
            }
            if (p1 === 1)
			{
                pixels_size1 = tmp_p;
				ps1w = tmp_w;
				ps1h = tmp_h;
			}
            for (let i = 2; i <= p2; i *= 2) {
                let t = this.convolution([0, 0, 0, 0, 1 / 4, 1 / 4, 0, 1 / 4, 1 / 4], tmp_p, tmp_w, tmp_h);
                tmp_p = [];
                for (let j = 0; j < Math.floor(tmp_w / 2) * Math.floor(tmp_h / 2); j++) {
                    let tpX = (j % Math.floor(tmp_w / 2)) * 2;
                    let tpY = parseInt(j / Math.floor(tmp_w / 2)) * 2;
                    tmp_p[j] = t[tpY * tmp_w + tpX];
                }
                tmp_w /= 2;
                tmp_h /= 2;


                if (i === p1) {
                    pixels_size1 = tmp_p;
					ps1w = tmp_w;
					ps1h = tmp_h;
                }
                if (i === p2) {
                    pixels_size2 = tmp_p;
					ps2w = tmp_w;
					ps2h = tmp_h;
                }

            }
        }


        for (let i = 0; i < this.state.width * this.state.height; i++) {
            let pX = i % this.state.width;
            let pY = parseInt(i / this.state.width);

            let npX = transformMatrix[0][0] * pX + transformMatrix[0][1] * pY + transformMatrix[0][2];
            let npY = transformMatrix[1][0] * pX + transformMatrix[1][1] * pY + transformMatrix[1][2];


            let newPix = Math.round(npY) * this.state.width + Math.round(npX);

            if (Math.floor(npX) >= 0 && Math.ceil(npX) < this.state.width && Math.floor(npY) >= 0 && Math.ceil(npY) < this.state.height) {
                if (delta < 1) {

                    new_pixels[i] = this.bilinearFilter(npX, npY, this.state.basePixels, this.state.width);

                }
                else {


                    new_pixels[i] = this.trilinearFiltration(npX, npY, pixels_size1, pixels_size2, ps1w, ps2w, p1, p2, dk);
                }
            }
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
			this.linearFiltration("clear");
        });


    }

    retouchCallback(radius, amount)
    {
        this.setState({
            retouchRadius: radius,
            retouchAmount: amount
        });

    }

    handleImageTouch(e) {

        if(this.state.panelIndex === 5) {
            this.setState({
                wasChanged: true,
            });
            let k = (this.state.width > this.state.height) ? parseFloat(this.state.width / this.state.imageContainer.width) : parseFloat(this.state.height / this.state.imageContainer.height);
            let retouchX = Math.round(e.nativeEvent.locationX * k - Math.max((this.state.imageContainer.width * k - this.state.width) / 2, 0)),
                retouchY = Math.round(e.nativeEvent.locationY * k - Math.max((this.state.imageContainer.height * k - this.state.height) / 2, 0));

            this.setState({
                retouchCircle: <View style={[styles.retouchCircle, {
                    left: e.nativeEvent.locationX-this.state.retouchRadius-1,
                    top: e.nativeEvent.locationY-this.state.retouchRadius-1,
                    width: this.state.retouchRadius*2+1,
                    height: this.state.retouchRadius*2+1
                }]}/>,
                retouchX: retouchX,
                retouchY: retouchY
            });

            let new_pixels = this.state.pixels.slice();

            let radius = this.state.retouchAmount;
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


            let blured_pixels = [];

            for(let i = Math.round(-this.state.retouchRadius * k) - this.state.retouchAmount; i <= Math.round(this.state.retouchRadius * k) + this.state.retouchAmount; i++)
            {
                for(let j = Math.round(-this.state.retouchRadius * k) - this.state.retouchAmount; j <= Math.round(this.state.retouchRadius * k) + this.state.retouchAmount; j++)
                {
                    let pX = retouchX + j;
                    let pY = retouchY + i;
                    let Pix = pY * this.state.width + pX;

                    blured_pixels.push(this.state.pixels[Pix]);
                }
            }

            blured_pixels = this.convolution(weights, blured_pixels, parseInt(Math.sqrt(blured_pixels.length)), parseInt(Math.sqrt(blured_pixels.length)));


            let l = parseInt(Math.sqrt(blured_pixels.length)) - this.state.retouchAmount*2;

            let crop_blur = new Array(l*l);

            for (let i = 0; i < l*l; i++) {
                let pX = i % l;
                let pY = parseInt(i / l);
                pX += this.state.retouchAmount;
                pY += this.state.retouchAmount;
                let newPix = pY * parseInt(Math.sqrt(blured_pixels.length)) + pX;
                crop_blur[i] = blured_pixels[newPix];
            }



            let c = 0;

            for(let i = Math.round(-this.state.retouchRadius * k); i <= Math.round(this.state.retouchRadius * k); i++)
            {
                for(let j = Math.round(-this.state.retouchRadius * k); j <= Math.round(this.state.retouchRadius * k); j++)
                {
                    let pX = retouchX + j;
                    let pY = retouchY + i;
                    let r = Math.sqrt((pX - retouchX)*(pX - retouchX) + (pY - retouchY)*(pY - retouchY));
                    if(r <= this.state.retouchRadius * k) {
                        let Pix = pY * this.state.width + pX;
                        new_pixels[Pix] = crop_blur[c];
                    }
                    c++;
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


        if (this.state.panelIndex !== 4)
            return;

        let tmp = this.state.transformDots;
        switch (this.state.transformDots.count) {
            case 0:
                tmp.count = 1;
                tmp.f1 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
            case 1:
                tmp.count = 2;
                tmp.f2 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
            case 2:
                tmp.count = 3;
                tmp.f3 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
            case 3:
                tmp.count = 4;
                tmp.s1 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
            case 4:
                tmp.count = 5;
                tmp.s2 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
            case 5:
                tmp.count = 6;
                tmp.s3 = {x: e.nativeEvent.locationX, y: e.nativeEvent.locationY};
                this.setState({
                    transformDots: tmp,
                }, () => {
                    this.drawDots()
                });
                break;
        }
        this.setState({
            currentPanel: <LinearFiltration dotsCount={tmp.count} callbackFunction={this.linearFiltration.bind(this)}/>,
        });
    }

    /*onContextCreate = (gl: WebGLRenderingContext) => {
		this.setState({
			gl: gl,
			rngl: gl.getExtension("RN")
		}, () => {
			let width = this.state.gl.drawingBufferWidth;
			let height = this.state.gl.drawingBufferHeight;
			let rngl = this.state.rngl;
			let gl = this.state.gl;
			this.updateImage("http://i.imgur.com/tCatS2c.jpg", function(){
				var pixels = new Uint8Array(width * height * 4);
				gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);//async
			});		
		});
    };*/

    render() {
        return (
            <View style={styles.container}>
                <View onLayout={(e) => {
                    this.setState({
                        imageContainer: {
                            width: e.nativeEvent.layout.width,
                            height: e.nativeEvent.layout.height,
                        }
                    })
                }} style={styles.imageDesk}>
                    {/*<WebGLView
                        style={{ width: 100, height: 100 }}
                        onContextCreate={this.onContextCreate}
                    />*/}
                    <TouchableWithoutFeedback onPress={(e) => this.handleImageTouch(e)}>
                        <ImageBackground resizeMode={this.state.imageMode} source={this.state.imageSource}
                                         style={styles.uploadImage}>
                            {this.state.drawableDots}
                            {this.state.retouchCircle}
                            {this.state.loadingBar}
                        </ImageBackground>
                    </TouchableWithoutFeedback>
                </View>
                <View style={styles.editPanel}>
                    {this.state.currentPanel}
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={() => this.choosePanel("filter")}>
                        <Text style={{color: this.state.navigationColors.filters, fontSize: 14}}>FILTER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("size")}>
                        <Text style={{color: this.state.navigationColors.sizeAndRot, fontSize: 14}}>SIZE&ROT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("usm")}>
                        <Text style={{color: this.state.navigationColors.unsharpMask, fontSize: 14}}>USM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("lin")}>
                        <Text style={{color: this.state.navigationColors.linearFiltration, fontSize: 14}}>BL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("reto")}>
                        <Text style={{color: this.state.navigationColors.retouch, fontSize: 14}}>RETO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.choosePanel("lin")}>
                        <Text style={{color: this.state.navigationColors.linearFiltration, fontSize: 14}}>BOKEH</Text>
                    </TouchableOpacity>
                </View>
				{this.state.wasChanged ? <View style={styles.bottomBar}>
					<TouchableOpacity onPress={this.cancelSavePixels.bind(this)}>
						<Image style={{
							width: 20, height: 20
						}} source={require('../assets/ui/cross.png')}>
						</Image>
					</TouchableOpacity>
					<TouchableOpacity onPress={this.savePixels.bind(this)}>
						<Image style={{
							width: 20, height: 20
						}} source={require('../assets/ui/tick.png')}>
						</Image>
					</TouchableOpacity>
				</View> : null}
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
        paddingTop: 10,
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
    },
    circle: {
        width: 5,
        height: 5,
        borderRadius: 100 / 2,
        position: "absolute",
    },
    retouchCircle: {
        borderRadius: 100 / 2,
        position: "absolute",
        borderWidth: 1,
        borderColor: '#00CF68',
    }
});
