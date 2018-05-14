import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class Retouch extends React.Component {

    constructor(props) {
        super(props);
        this.invokeCallback = this.invokeCallback.bind(this);
        this.state = {
            amountValue: 1,
            radiusValue: 1,
        };
    }

    componentDidMount() {

    }

    invokeCallback() {
        this.props.callbackFunction(this.state.radiusValue, this.state.amountValue);
    }

    onAmountChange(val) {
        this.setState({
            amountValue: val
        }, () => {this.invokeCallback()});
    }

    onRadiusChange(val) {
        this.setState({
            radiusValue: val
        }, () => {this.invokeCallback()});
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 0.8, justifyContent: 'center', paddingLeft: 0}}>
                    <Text style={{color: "white", marginLeft: 15}}>Radius:</Text>
                    <Slider
                        step={1}
                        maximumValue={50}
                        minimumValue={1}
                        value={0}
                        style={styles.sliderStyle}
                        onValueChange={this.onRadiusChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
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
                <View style={{flex: 0.2, alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between',
                    paddingTop: 31, paddingBottom: 13}}>
                    <Text style={{color: "white"}}>{this.state.radiusValue}</Text>
                    <Text style={{color: "white"}}>{this.state.amountValue}</Text>
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
