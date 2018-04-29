import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class SizeAndRot extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

	invokeCallback(val) {
		
	}

    render() {
        return (
			<View style={styles.container}>
				<View style={{flex: 0.8}}>
					<Slider
					  step={1}
					  maximumValue={360}
					  style={styles.sliderStyle}
					/>
					<Slider
					  step={1}
					  maximumValue={100}
					  style={styles.sliderStyle}
					/>
				</View>
				<Button title={"Set"} style={styles.setButton} onPress={() => {}} />
			</View>
        );
    }
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "row"
	},
	sliderStyle: {
		alignSelf: 'stretch',
	},
	setButton: {
		flex: 0.2,
		alignSelf: 'stretch'
	}
});
