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
import {View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet} from 'react-native';
/**
 * Component showing text with tooltip on mobile native
 */
const TextWithToolTip = (props: any) => {
    const [toolTipVisible, setToolTipVisible] = useState(false)
    const [top, setTop] = useState(0)
    const [left, setLeft] = useState(0)
    const ref = useRef(null)
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
                <View style={[style.textContainer, {top: top,left: left}]}>
                    <Text style={style.textStyle}>{props.value}</Text>
                </View>
            </Modal>
            <TouchableOpacity ref={ref} onPress={() => {
                    ref?.current?.measure( (fx, fy, width, height, px, py) => {
                        // console.log('Component width is: ' + width)
                        // console.log('Component height is: ' + height)
                        // console.log('X offset to frame: ' + fx)
                        // console.log('Y offset to frame: ' + fy)
                        // console.log('X offset to page: ' + px)
                        // console.log('Y offset to page: ' + py)
                        setTop(py + height)
                        setLeft(px)
                        setToolTipVisible(!toolTipVisible)
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
