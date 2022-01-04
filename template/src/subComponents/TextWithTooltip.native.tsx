/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useState, useRef} from 'react';
import {View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, useWindowDimensions} from 'react-native';
/**
 * Component showing text with tooltip on mobile native
 */
const TextWithToolTip = (props: any) => {
    const {width:globalWidth, height:globalHeight} = useWindowDimensions();
    const [toolTipVisible, setToolTipVisible] = useState(false);
    const [position, setPosition] = useState({})
    const ref = useRef(null);
    return(
        <View style={{flex: 1}}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={toolTipVisible}
                onRequestClose={() => {
                    setToolTipVisible(!toolTipVisible);
                }}
            >
                <TouchableWithoutFeedback onPress={()=>{setToolTipVisible(!toolTipVisible)}}>
                    <View 
                        style={style.backDrop} 
                    />
                </TouchableWithoutFeedback>
                <View style={[style.textContainer, position]}>
                    <Text style={style.textStyle}>{props.value}</Text>
                </View>
            </Modal>
            <TouchableOpacity ref={ref} onPress={() => {
                    ref?.current?.measure( (fx, fy, localWidth, localHeight, px, py) => {
                        // console.log('Component width is: ' + width2)
                        // console.log('Component height is: ' + height)
                        // console.log('X offset to frame: ' + fx)
                        // console.log('Y offset to frame: ' + fy)
                        // console.log('X offset to page: ' + px)
                        // console.log('Y offset to page: ' + py)
                        const rightPos = (globalWidth - (px + localWidth)) - 20 < 0 ? 10 : (globalWidth - (px + localWidth)) - 20
                        const leftPos = px < 0 ? 10 : px
                        if(px > globalWidth/2){
                            if(py > globalHeight/2){
                                setPosition({
                                    top: py - localHeight,
                                    right: rightPos,
                                    maxWidth: (globalWidth - rightPos) - 30,
                                })
                            }else{
                                setPosition({
                                    top: py+localHeight,
                                    right: rightPos,
                                    maxWidth: (globalWidth - rightPos) - 30,
                                })
                            }
                        }else{
                            if(py > globalHeight/2){
                                setPosition({
                                    top: py - localHeight,
                                    left: leftPos,
                                    maxWidth: (globalWidth - leftPos - 5),
                                })
                            }else{
                                setPosition({
                                    top: py+localHeight,
                                    left: leftPos,
                                    maxWidth: (globalWidth - leftPos - 5),
                                })
                            }
                        }
                        setTimeout(() =>{
                            setToolTipVisible(!toolTipVisible)
                        })
                    })     
                }}>
                <Text style={props.style} numberOfLines={1}>{props.value}</Text>
            </TouchableOpacity>
        </View>
    )
};

const style = StyleSheet.create({
    backDrop:{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    textContainer:{ 
        position: 'absolute',
        zIndex: 999,
        marginRight: 20
    },
    textStyle:{
        backgroundColor:'white', padding: 5, margin: 5        
    }
})

export default TextWithToolTip;
