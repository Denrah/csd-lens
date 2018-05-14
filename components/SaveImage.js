import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid, TextInput, ToastAndroid} from 'react-native';
import {StackNavigator} from 'react-navigation';

let ImagePicker = require('react-native-image-picker');
let imageUtils = require('../libs/imageUtils.js');

let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse"/>;

export default class SaveImage extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'Save image',
            headerStyle: {
                backgroundColor: '#000',
                height: 40,
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

    render() {
        return (
            <View style={styles.container}>
                <Image source={this.state.image} style={{width: 300, height: 300, marginTop: 30, marginBottom: 30}} resizeMode={"contain"}/>
                <Button color={"#00CF68"} title={"Save picture"}
                        onPress={this.saveImage.bind(this)}/>
                {this.state.loadingBar}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1D1D1D',
        alignItems: 'center',
    }
});
