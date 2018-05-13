import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid, TextInput} from 'react-native';
import {StackNavigator} from 'react-navigation';

let ImagePicker = require('react-native-image-picker');
let imageUtils = require('../libs/imageUtils.js');

let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse" />;

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
			name: null,
        };
    }

    componentDidMount() {
		const {params} = this.props.navigation.state;
        this.setState({
			image: params.image,
		});
    }

	saveImage() {
	console.log(this.props.navigation.state);
		imageUtils.savePixelsToFile((this.state.name === "") ? "untitled" : this.state.name, this.props.navigation.state.params.pixels,
			this.props.navigation.state.params.width, this.props.navigation.state.params.	height);
	}

    render() {
        return (
            <View style={styles.container}>
				<TextInput
					style={{width: 300, height: 40, marginBottom: 10, marginTop: 30, borderWidth: 0, color: "#00CF68"}}
					onChangeText={(name) => this.setState({name})}
					value={this.state.name}
					placeholder={"File name"}
					placeholderTextColor={"#00CF68"}
					underlineColorAndroid={"#00CF68"}
				  />
				<Image source={this.state.image} style={{width: 300, height: 300}} resizeMode={"contain"} />
				<Button color={"#00CF68"} title={"Save picture"} style={{marginTop: 10}} onPress={this.saveImage.bind(this)}/>
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
