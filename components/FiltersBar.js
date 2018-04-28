import React from 'react';
import {StyleSheet, Text, ScrollView, TouchableOpacity, ImageBackground} from 'react-native';


export default class FiltersBar extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }



    render() {
        return (
            <ScrollView horizontal={true} style={{paddingTop: 15,
                paddingLeft: 15,
                paddingRight: 15}}>
                <TouchableOpacity onPress={this.props.callbackFunction("gray")} style={{paddingRight: 15}}>
                    <ImageBackground style={{
                        width: 70, height: 70, alignItems: 'center',
                        justifyContent: 'center',
                    }} source={require('../assets/filters/gray.png')}>
                        <Text style={{
                            color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 5
                        }}>GRAY</Text>
                    </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.callbackFunction("sepia")} style={{paddingRight: 15}}>
                    <ImageBackground style={{
                        width: 70, height: 70, alignItems: 'center',
                        justifyContent: 'center',
                    }} source={require('../assets/filters/sepia.png')}>
                        <Text style={{
                            color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 1)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 5
                        }}>SEPIA</Text>
                    </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.callbackFunction("noir")} style={{paddingRight: 15}}>
                    <ImageBackground style={{
                        width: 70, height: 70, alignItems: 'center',
                        justifyContent: 'center',
                    }} source={require('../assets/filters/threshold.png')}>
                        <Text style={{
                            color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 5
                        }}>NOIR</Text>
                    </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.callbackFunction("sharp")} style={{paddingRight: 15}}>
                    <ImageBackground style={{
                        width: 70, height: 70, alignItems: 'center',
                        justifyContent: 'center',
                    }} source={require('../assets/filters/sharp.png')}>
                        <Text style={{
                            color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 5
                        }}>SHARP</Text>
                    </ImageBackground>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.props.callbackFunction("norm")} style={{marginRight: 15}}>
                    <ImageBackground style={{
                        width: 70, height: 70, alignItems: 'center',
                        justifyContent: 'center', marginRight: 15,
                    }} source={require('../assets/filters/norm.png')}>
                        <Text style={{
                            color: "white", fontSize: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 5
                        }}>NORM</Text>
                    </ImageBackground>
                </TouchableOpacity>
            </ScrollView>
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
    uploadAvatar: {
        width: 200,
        height: 200,
    }
});
