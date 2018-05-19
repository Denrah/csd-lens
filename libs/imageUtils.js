import React from 'react';
import {NativeModules} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'

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
}

/**
 *
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
 *
 * @param pixels
 * @param width
 * @param height
 * @returns {Promise<string>}
 */
let getBase64FromPixels = async function (pixels, width, height) {
    let res = "";

    /*await new Promise((resolve, reject) => {
        NativeModules.Bitmap.getBase64FromPixels(pixels, width, height, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    }).then(function (data) {
        res = data;
    });*/

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
                                    resolve(data1);
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
                                    resolve(data1);
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
 *
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
 *
 * @param colors
 * @returns {number}
 * @constructor
 */
let RGBToInt = function (colors) {
    return ((colors[3] << 24) * 255) | colors[0] << 16 | colors[1] << 8 | colors[2];
};

/**
 *
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