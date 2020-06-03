import React, {useEffect} from 'react';
import {StyleProp, StyleSheet, ViewProps, ViewStyle} from "react-native";
import {VideoMirrorMode, VideoRenderMode} from "react-native-agora/lib/Types";


export interface RtcSurfaceViewProps extends ViewProps {
    zOrderMediaOverlay?: boolean;
    zOrderOnTop?: boolean;
    renderMode?: VideoRenderMode;
    channelId?: string;
    mirrorMode?: VideoMirrorMode;
}
export interface RtcUidProps {
    uid: number;
}
export interface StyleProps{
    style?: StyleProp<ViewStyle>;
}

interface SurfaceViewInterface extends RtcSurfaceViewProps, RtcUidProps, StyleProps{}

const SurfaceView = (props: SurfaceViewInterface) => {
    console.log("Surface View props", props);
    useEffect(function () {
        const stream: AgoraRTC.Stream = window.engine.streams.get(props.uid);
        stream.play(String(props.uid));
        return ()=>{
            console.log(`unmounting stream ${props.uid}`, stream);
            stream.stop();
        }
    },[props.uid]);

    return <div id={String(props.uid)} style={{flex:1, ...props.style as Object}}>
    </div>
}

export default SurfaceView;