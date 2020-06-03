import RtcEngine from './RtcEngine';
import SurfaceView from "./SurfaceView";
import LocalView from  './LocalView'

export const RtcLocalView = {
    SurfaceView: LocalView,
    TextureView: LocalView
}

export const RtcRemoteView = {
    SurfaceView: SurfaceView,
    TextureView: SurfaceView
}

export default RtcEngine;