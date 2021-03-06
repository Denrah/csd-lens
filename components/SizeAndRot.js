import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class SizeAndRot extends React.Component {

    constructor(props) {
        super(props);
        this.invokeCallback = this.invokeCallback.bind(this);
        this.state = {
            rotationValue: 0,
            sizeValue: 100,
        };
    }

    componentDidMount() {

    }

    invokeCallback() {
        this.props.callbackFunction(this.state.sizeValue, this.state.rotationValue);
    }

    onRotationChange(val) {
        this.setState({
            rotationValue: val
        });
    }

    onSizeChange(val) {
        this.setState({
            sizeValue: val
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 0.7, justifyContent: 'center', paddingLeft: 0}}>
                    <Text style={{color: "white", marginLeft: 15}}>Size:</Text>
                    <Slider
                        step={1}
                        maximumValue={200}
						minimumValue={1}
                        value={100}
                        style={styles.sliderStyle}
                        onValueChange={this.onSizeChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                    <Text style={{color: "white", marginLeft: 15}}>Rotation:</Text>
                    <Slider
                        step={1}
                        maximumValue={360}
                        style={styles.sliderStyle}
                        onValueChange={this.onRotationChange.bind(this)}
                        thumbTintColor={"#00CF68"}
                        minimumTrackTintColor={"#00CF68"}
                        maximumTrackTintColor={"#CCC"}
                    />
                </View>
                <View style={{
                    flex: 0.1, alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between',
                    paddingTop: 31, paddingBottom: 13
                }}>
                    <Text style={{color: "white"}}>{this.state.sizeValue}</Text>
                    <Text style={{color: "white"}}>{this.state.rotationValue}</Text>
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
    },
    setButton: {
        flex: 1,
    }
});
