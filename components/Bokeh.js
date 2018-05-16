import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class Bokeh extends React.Component {

    constructor(props) {
        super(props);
        this.invokeCallback = this.invokeCallback.bind(this);
        this.state = {
            amountValue: 1
        };
    }

    componentDidMount() {

    }

    invokeCallback() {
        this.props.callbackFunction(this.state.amountValue);
    }

    onAmountChange(val) {
        this.setState({
            amountValue: val
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 0.7, justifyContent: 'center', paddingLeft: 0}}>
                    <Text style={{color: "white", marginLeft: 15, lineHeight: 40}}>Select a rectangle and apply effect</Text>

                    <Text style={{color: "white", marginLeft: 15}}>Amount:</Text>
                    <Slider
                        step={1}
                        maximumValue={50}
                        minimumValue={1}
                        style={styles.sliderStyle}
                        onValueChange={this.onAmountChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                </View>
                <View style={{flex: 0.1, alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between',
                    paddingTop: 69, paddingBottom: 13}}>
                    <Text style={{color: "white"}}>{this.state.amountValue}</Text>
                </View>
				<View style={{flex: 0.2, alignItems: 'center', justifyContent: 'center'}}>
					<Button color={"#00CF68"} title={"Set"} style={styles.setButton} onPress={() => {this.invokeCallback()}} />
				</View>
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
        flex: 1,
    }
});
