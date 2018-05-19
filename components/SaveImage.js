import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid, TextInput, ToastAndroid} from 'react-native';
import {StackNavigator} from 'react-navigation';
import Share, {ShareSheet} from 'react-native-share';
import RNFetchBlob from 'react-native-fetch-blob'

let ImagePicker = require('react-native-image-picker');
let imageUtils = require('../libs/imageUtils.js');


let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse"/>;

export default class SaveImage extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'Save image',
            headerStyle: {
                backgroundColor: '#000',
                height: 50,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'normal',
            }
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            loadingBar: null,
            image: null,
        };
    }

    componentDidMount() {
        const {params} = this.props.navigation.state;
        this.setState({
            image: params.image,
        });
    }

    saveImage() {
        let d = new Date();
        this.setState({loadingBar: loadingBar}, () => {
            setTimeout(() => {
                imageUtils.savePixelsToFile("LE_" + d.getDate() + "" + d.getMonth() + "" + d.getFullYear() + "" + d.getHours() + "" + d.getMinutes() + "" + d.getSeconds(),
                    this.props.navigation.state.params.pixels,
                    this.props.navigation.state.params.width, this.props.navigation.state.params.height).then(() => {
                    this.setState({loadingBar: null});
                    ToastAndroid.show("File saved", ToastAndroid.SHORT);
                });
            }, 10);
        });

    }
	
	shareImage() {
        this.setState({loadingBar: loadingBar}, () => {
            setTimeout(() => {
                imageUtils.getBase64FromPixels(this.props.navigation.state.params.pixels, this.props.navigation.state.params.width, this.props.navigation.state.params.height, true).then(res => {
					Share.open({title: "Share", message: "", url: "file://"+res, subject: "Share Link","social": "whatsapp"});					
					this.setState({loadingBar: null});
                });
            }, 10);
        });

    }

    render() {
        return (
            <View style={styles.container}>
                <Image source={this.state.image} style={{width: 300, height: 300, marginTop: 30, marginBottom: 30}}
                       resizeMode={"contain"}/>
                <Button color={"#00CF68"} title={"Save picture"}
                        onPress={this.saveImage.bind(this)}/>
				<View style={{flex:1 , marginTop:15}} >
					<Button color={"#00CF68"} title={"Share picture"}
                        onPress={this.shareImage.bind(this)}/>
				</View>
                {this.state.loadingBar}
                {(this.state.loadingBar !== null) ? <View style={styles.overlay}></View> : null}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D1D1D',
        alignItems: 'center',
    },
    overlay: {
        position: "absolute",
        backgroundColor: "transparent",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }
});
