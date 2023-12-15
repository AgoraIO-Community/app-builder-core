import {StyleSheet, Text, View} from 'react-native';
import React, {useContext} from 'react';
import {RtcContext} from '../../../agora-rn-uikit';
import ThemeConfig from '../../../src/theme';
import {useVB} from './useVB.native';
import {useLocalUserInfo} from 'customization-api';
import PropsContext, {
  ToggleState,
} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import InlineNotification from '../../atoms/InlineNotification';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcLocalView,
  RtcRemoteView,
  VideoRenderMode,
} from 'react-native-agora';

const LocalView = RtcLocalView.SurfaceView;

const VideoPreview = () => {
  const {
    setPreviewVideoTrack,
    setSaveVB,
    previewVideoEngine,
    setPreviewVideoEngine,
  } = useVB();
  const rtc = useContext(RtcContext);
  const vContainerRef = React.useRef(null);
  const {video: localVideoStatus} = useLocalUserInfo();
  const {rtcProps} = useContext(PropsContext);

  const isLocalVideoON = localVideoStatus === ToggleState.enabled;

  const rtcEngine = React.useRef(null);

  const createCameraTrack = async () => {
    if (isLocalVideoON && vContainerRef.current && !previewVideoEngine) {
      rtcEngine.current = new RtcEngine();
      await rtcEngine.current.init({appId: $config.APP_ID});
      await rtcEngine.current.enableVideo();

      await rtcEngine.current.setChannelProfile(
        ChannelProfile.LiveBroadcasting,
      );
      await rtcEngine.current.setClientRole(ClientRole.Broadcaster);
      await rtcEngine.current.startPreview();
      setPreviewVideoEngine(rtcEngine.current);
    }
  };

  React.useEffect(() => {
    return;
    // not able to create a sepate video track for mobile
    const initialize = async () => {
      // await createCameraTrack();
    };
    initialize();
    return () => {
      console.log('cleanup local preview');
      if (rtcEngine.current) {
        // rtcEngine.current.stopPreview();
        // rtcEngine.current.destroy();
        // setPreviewVideoEngine(null);
        setSaveVB(false);
      }
    };
  }, [isLocalVideoON]);

  return (
    <View style={styles.previewContainer}>
      {isLocalVideoON ? (
        <LocalView
          ref={vContainerRef}
          style={{flex: 1}}
          channelId={rtcProps.channel}
          renderMode={VideoRenderMode.Fit}
        />
      ) : (
        <InlineNotification
          text="  Camera is currently off. Selected background will be applied as soon
        as your camera turns on."
        />
      )}
    </View>
  );
};

export default VideoPreview;

const styles = StyleSheet.create({
  previewContainer: {
    padding: 20,
    paddingBottom: 8,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    flex: 1,
  },

  desktopPreview: {width: 300, height: 166},
  mobilePreview: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    backgroundColor: 'rgba(255, 171, 0, 0.15)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  iconStyleView: {
    marginRight: 4,
    width: 20,
    height: 20,
  },
});
