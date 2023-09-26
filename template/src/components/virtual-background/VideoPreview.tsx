import {StyleSheet, Text, View, Linking} from 'react-native';
import React, {useContext} from 'react';
import {useContent, useLocalUserInfo, useRtc} from 'customization-api';
import {MaxVideoView, RtcContext} from '../../../agora-rn-uikit';
import type RtcEngine from '../../../bridge/rtc/webNg/';
import {ToggleState} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import {RtcLocalView} from 'react-native-agora';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useVB} from './useVB';

type WebRtcEngineInstance = InstanceType<typeof RtcEngine>;

const VideoPreview = () => {
  const {defaultContent, activeUids} = useContent();
  const {setVideoTrack} = useVB();
  const [maxUid] = activeUids;
  const rtc = useContext(RtcContext);
  const {RtcEngineUnsafe} = rtc as unknown as {
    RtcEngineUnsafe: WebRtcEngineInstance;
  };

  const vContainerRef = React.useRef(null);
  const {video: localVideoStatus} = useLocalUserInfo();

  const isLocalVideoON = localVideoStatus === ToggleState.enabled;

  const updateVideoTrack = async clonedMediaStreamTrack => {
    const clonedVideoTrack = await AgoraRTC?.createCustomVideoTrack({
      mediaStreamTrack: clonedMediaStreamTrack,
    });
    setVideoTrack(clonedVideoTrack);
  };

  const destroyCameraTrack = () => {};

  const cloneCameraTrack = () => {
    if (isLocalVideoON) {
      const localVideoTrack = RtcEngineUnsafe?.localStream?.video;
      const clonedMediaStreamTrack = localVideoTrack
        ?.getMediaStreamTrack()
        .clone();

      const clonedMediaStream = new MediaStream([clonedMediaStreamTrack]);
      const videoEle = document.createElement('video');
      vContainerRef.current.appendChild(videoEle);
      videoEle.srcObject = clonedMediaStream;
      vContainerRef?.current?.appendChild(videoEle);
      videoEle.play();
      updateVideoTrack(clonedMediaStreamTrack);
    } else {
      const videoEle = vContainerRef.current.querySelector('video');
      if (videoEle) {
        videoEle.srcObject = null;
        vContainerRef.current.removeChild(videoEle);
      }
    }
  };

  const destroyClonedCameraTrack = () => {
    if (vContainerRef.current) {
      const videoEle = vContainerRef.current.querySelector('video');
      if (videoEle) {
        videoEle.srcObject = null;
        vContainerRef.current.removeChild(videoEle);
      }
    }
  };

  const createCameraTrack = async () => {
    if (isLocalVideoON) {
      const localVideo = await AgoraRTC.createCameraVideoTrack();
      localVideo.play(vContainerRef.current);
      setVideoTrack(localVideo);
      return localVideo;
    }
    return null;
  };

  React.useEffect(() => {
    if (vContainerRef.current) {
      const initialize = async () => {
        const localVideo = await createCameraTrack();
        return () => {
          console.log('cleanup local preview');
          if (localVideo) {
            localVideo.stop();
            localVideo.close();
          }
        };
      };

      initialize();
    }
  }, []);

  return (
    <View style={styles.container1}>
      {isLocalVideoON ? (
        <View ref={vContainerRef} style={{width: 300, height: 166}}></View>
      ) : (
        <View>
          <Text style={styles.text}>Switch ON CAM for preview</Text>
        </View>
      )}
    </View>
  );
};

export default VideoPreview;

const styles = StyleSheet.create({
  container1: {
    padding: 20,
    paddingBottom: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },

  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: 14,
  },
});
