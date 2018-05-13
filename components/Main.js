import React from 'react';
import {StyleSheet, Text, View, Button, Image, ProgressBarAndroid, ImageBackground} from 'react-native';
import {StackNavigator} from 'react-navigation';

let ImagePicker = require('react-native-image-picker');

let options = {
    title: 'Choose image',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};

let loadingBar = <ProgressBarAndroid color={"#00CF68"} styleAttr="Inverse" />;

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingBar: null
        };
    }

    componentDidMount() {

    }

    selectImage() {
        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
				this.setState({
					loadingBar: loadingBar
				});
				setTimeout(() => {
					this.props.navigation.navigate('Editor', {response: response});
					this.setState({
						loadingBar: null
					});
				}, 10);
				
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
				<ImageBackground source={require('../assets/ui/mm_bg.jpg')}  style={styles.bgImage}>
					<Image source={require('../assets/ui/splash.png')} style={{width: 300, height: 80, marginTop: -20, marginBottom: 50}} resizeMode={"cover"} />
					<View style={{width: 132, height: 80, justifyContent: "space-between"}}>
						<Button color={"#00CF68"} title={"Choose picture"} style={{alignSelf: 'stretch', marginBottom: 10}} onPress={this.selectImage.bind(this)}/>
						<Button color={"#00CF68"} title={"About"} style={{alignSelf: 'stretch'}} onPress={() => {}}/>
					</View>
					<View style={{height: 60, justifyContent: "center"}}>
						{this.state.loadingBar}
					</View>
				</ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
	bgImage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },
    uploadAvatar: {
        width: 200,
        height: 200,
    }
});
