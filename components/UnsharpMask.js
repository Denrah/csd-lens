import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class UnsharpMask extends React.Component {

    constructor(props) {
        super(props);
        this.invokeCallback = this.invokeCallback.bind(this);
        this.state = {
            radiusValue: 0,
            amountValue: 0,
            thresholdValue: 0,
        };
    }

    componentDidMount() {

    }

    invokeCallback() {
        this.props.callbackFunction(this.state.radiusValue, this.state.amountValue, this.state.thresholdValue);
    }

    onRadiusChange(val) {
        this.setState({
            radiusValue: val
        });
    }

    onAmountChange(val) {
        this.setState({
            amountValue: parseFloat(val).toFixed(1)
        });
    }

    onThresholdChange(val) {
        this.setState({
            thresholdValue: val
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{
                    flex: 0.2, flexDirection: 'column', justifyContent: 'space-between',
                    paddingTop: 11, paddingBottom: 13, paddingLeft: 15
                }}>
                    <Text style={{color: "white"}}>Radius:</Text>
                    <Text style={{color: "white"}}>Amount:</Text>
                    <Text style={{color: "white"}}>Threshold:</Text>
                </View>
                <View style={{flex: 0.5, justifyContent: 'center', paddingTop: 10}}>
                    <Slider
                        step={1}
                        minimumValue={0}
                        maximumValue={10}
                        style={styles.sliderStyle}
                        onValueChange={this.onRadiusChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                    <Slider
                        step={0.1}
                        maximumValue={10}
                        style={styles.sliderStyle}
                        onValueChange={this.onAmountChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                    <Slider
                        step={1}
                        maximumValue={255}
                        style={styles.sliderStyle}
                        onValueChange={this.onThresholdChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                </View>
                <View style={{
                    flex: 0.1, alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between',
                    paddingTop: 12, paddingBottom: 13
                }}>
                    <Text style={{color: "white"}}>{this.state.radiusValue}</Text>
                    <Text style={{color: "white"}}>{this.state.amountValue}</Text>
                    <Text style={{color: "white"}}>{this.state.thresholdValue}</Text>
                </View>
                <View style={{flex: 0.2, alignItems: 'center', justifyContent: 'center'}}>
                    <Button color={"#00CF68"} title={"Set"} style={styles.setButton} onPress={() => {
                        this.invokeCallback()
                    }}/>
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
        marginBottom: 10,
    },
    setButton: {
        flex: 1,
    }
});
