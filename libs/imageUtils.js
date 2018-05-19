import React from 'react';
import {NativeModules} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'

/**
 * Saves result image to file in storage
 * @param name
 * @param pixels
 * @param width
 * @param height
 * @returns {Promise<*>}
 */

let savePixelsToFile = async function (name, pixels, width, height) {
    let res;
    await new Promise((resolve, reject) => {
        NativeModules.Bitmap.saveImageToFile(name, pixels, width, height, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    }).then(function (data) {
        res = data;
    });

    return res;
};

/**
 * Gets array of pixels from image
 * @param path
 * @returns {Promise<Array>}
 */
let getPixelsArray = async function (path) {
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
    });

    return res;
};

/**
 *  Gets base64 image from array of pixels
 * @param pixels
 * @param width
 * @param height
 * @returns {Promise<string>}
 */
let getBase64FromPixels = async function (pixels, width, height, path = false) {
    let res = "";
    const dirs = RNFetchBlob.fs.dirs;
    const fs = RNFetchBlob.fs;
    await new Promise((resolve, reject) => {
        RNFetchBlob.fs.exists(dirs.DocumentDir + '/temp.txt')
            .then((exist) => {
                if (exist) {
                    fs.writeFile(dirs.DocumentDir + '/temp.txt', JSON.stringify(pixels), 'utf8').then(() => {
                        new Promise((resolve, reject) => {
                            NativeModules.Bitmap.saveImageToFileFromFile(dirs.DocumentDir + '/temp.txt', width, height, (err, data) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(data);
                            });
                        }).then(function (data) {
                            RNFetchBlob.fs.readFile(data, 'base64')
                                .then((data1) => {
									if (!path) {
										resolve(data1)
									} else {
										resolve(data)
									}										
                                })
                        });
                    });
                } else {
                    fs.createFile(dirs.DocumentDir + '/temp.txt', JSON.stringify(pixels), 'utf8').then(() => {
                        new Promise((resolve, reject) => {
                            NativeModules.Bitmap.saveImageToFileFromFile(dirs.DocumentDir + '/temp.txt', width, height, (err, data) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(data);
                            });
                        }).then(function (data) {
                            RNFetchBlob.fs.readFile(data, 'base64')
                                .then((data1) => {
                                    if (!path) {
										resolve(data1)
									} else {
										resolve(data)
									}
                                })
                        });
                    });
                }
            })
    }).then(function (data) {
        res = data;
    });

    return res;
};

/**
 * Implements bokeh effect using OpenCV library
 * @param amount
 * @param pixels
 * @param width
 * @param height
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns {Promise<Array>}
 */
let getOpenCVBokehFromPixels = async function (amount, pixels, width, height, x1, y1, x2, y2) {
    let res = [];

    await new Promise((resolve, reject) => {
        NativeModules.Bitmap.getOpenCVBokehFromPixels(amount, pixels, width, height, x1, y1, x2, y2, (err, data, pixels) => {
            if (err) {
                return reject(err);
            }
            resolve([data, pixels]);
        });
    }).then(function (data) {
        res = data;
    });

    return res;
};

/**
 * Converts color number to RGBA array
 * @param num
 * @returns {*[]}
 */
let toColorArr = function (num) {
    num >>>= 0;
    let b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ((num & 0xFF000000) >>> 24) / 255;
    return [r, g, b, a];
};

/**
 * Converts RGBA array to color number
 * @param colors
 * @returns {number}
 * @constructor
 */
let RGBToInt = function (colors) {
    return ((colors[3] << 24) * 255) | colors[0] << 16 | colors[1] << 8 | colors[2];
};

/**
 * Normalizing color array to values from 0 to 255
 * @param colors
 * @returns {*}
 */
let normalaizeColors = function (colors) {
    for (let i = 0; i < 4; i++) {
        if (colors[i] > 255)
            colors[i] = 255;
        if (colors[i] < 0)
            colors[i] = 0;
        colors[i] = parseInt(colors[i]);
    }
    return colors;
};

module.exports.getPixelsArray = getPixelsArray;
module.exports.getBase64FromPixels = getBase64FromPixels;
module.exports.toColorArr = toColorArr;
module.exports.RGBToInt = RGBToInt;
module.exports.normalaizeColors = normalaizeColors;
module.exports.savePixelsToFile = savePixelsToFile;
module.exports.getOpenCVBokehFromPixels = getOpenCVBokehFromPixels;