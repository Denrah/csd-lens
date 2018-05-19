import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground, Slider, Button, View} from 'react-native';


export default class LinearFiltration extends React.Component {

    constructor(props) {
        super(props);
        this.invokeCallback = this.invokeCallback.bind(this);
        this.state = {
            rotationValue: 0,
            sizeValue: 0,
        };
    }

    componentDidMount() {

    }

    invokeCallback(val) {
        switch (val) {
            case "clear":
                this.props.callbackFunction("clear");
                break;
            case "set":
                this.props.callbackFunction("set");
                break;
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 0.6, alignItems: 'center', justifyContent: 'center'}}>
                    <Text
                        style={{color: "white"}}>Select {(this.props.dotsCount < 3) ? (3 - this.props.dotsCount) + " base dots" : (6 - this.props.dotsCount) + " target dots"}</Text>
                </View>
                <View style={{flex: 0.2, alignItems: 'center', justifyContent: 'center'}}>
                    <Button color={"#00CF68"} title={"Clear"} style={styles.setButton} onPress={() => {
                        this.invokeCallback("clear")
                    }}/>
                </View>
                <View style={{flex: 0.2, alignItems: 'center', justifyContent: 'center'}}>
                    <Button color={"#00CF68"} title={"Set"} style={styles.setButton} onPress={() => {
                        this.invokeCallback("set")
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
