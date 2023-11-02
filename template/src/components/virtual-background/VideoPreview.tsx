import {StyleSheet, Text, View, Linking} from 'react-native';
import React, {useContext} from 'react';
import {useContent, useLocalUserInfo, useRtc} from 'customization-api';
import {MaxVideoView, RtcContext} from '../../../agora-rn-uikit';
import type RtcEngine from '../../../bridge/rtc/webNg/';
import {ToggleState} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import {RtcLocalView} from 'react-native-agora';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useVB} from './useVB';
import ThemeConfig from '../../../src/theme';

type WebRtcEngineInstance = InstanceType<typeof RtcEngine>;

const VideoPreview = () => {
  const {defaultContent, activeUids} = useContent();
  const {setPreviewVideoTrack, setSaveVB, previewVideoTrack} = useVB();
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
    setPreviewVideoTrack(clonedVideoTrack);
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
    if (isLocalVideoON && vContainerRef.current && !previewVideoTrack) {
      const localVideo = await AgoraRTC.createCameraVideoTrack();
      localVideo.play(vContainerRef.current);
      setPreviewVideoTrack(localVideo);
      return localVideo;
    }
    return null;
  };

  React.useEffect(() => {
    let localVideo = null;
    const initialize = async () => {
      localVideo = await createCameraTrack();
    };

    initialize();
    return () => {
      console.log('cleanup local preview');
      if (localVideo) {
        localVideo.stop();
        localVideo.close();
        setPreviewVideoTrack(null);
        setSaveVB(false);
      }
    };
  }, [isLocalVideoON]);

  return (
    <View style={styles.container1}>
      {isLocalVideoON ? (
        <View ref={vContainerRef} style={{width: 300, height: 166}}></View>
      ) : (
        <View style={styles.msgContainer}>
          <Text style={styles.text}>Camera is off.</Text>
          <Text style={styles.text}>
            Saved changes are applied as soon as camera turns ON.
          </Text>
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
    fontSize: 12,
    lineheight: 16,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
  },
  msgContainer: {
    padding: 12,
    borderRadius: 4,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
