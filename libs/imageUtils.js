import React from 'react';
import { NativeModules } from 'react-native';

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
let  getBase64FromPixels = async function(pixels, width, height) {
    let res = "";

    await new Promise((resolve, reject) => {
        NativeModules.Bitmap.getBase64FromPixels(pixels, width, height, (err, data) => {
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
 *
 * @param num
 * @returns {*[]}
 */
let toColorArr = function (num) {
    num >>>= 0;
    let b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
    return [r, g, b, a];
};

/**
 *
 * @param colors
 * @returns {number}
 * @constructor
 */
let RGBToInt = function(colors){
    return ((colors[3] << 24) * 255) | colors[0] << 16 | colors[1] << 8 | colors[2];
};

/**
 *
 * @param colors
 * @returns {*}
 */
let normalaizeColors = function(colors) {
    for(let i = 0; i < 4; i++) {
        if (colors[i] > 255)
            colors[i] = 255;
        colors[i] = parseInt(colors[i]);
    }
    return colors;
};

module.exports.getPixelsArray = getPixelsArray;
module.exports.getBase64FromPixels = getBase64FromPixels;
module.exports.toColorArr = toColorArr;
module.exports.RGBToInt = RGBToInt;
module.exports.normalaizeColors = normalaizeColors;