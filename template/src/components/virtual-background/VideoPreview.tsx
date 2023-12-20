import {StyleSheet, View} from 'react-native';
import React, {useContext} from 'react';
import {useContent, useLocalUserInfo} from 'customization-api';
import {MaxVideoView, RtcContext} from '../../../agora-rn-uikit';
import {ToggleState} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useVB} from './useVB';
import ThemeConfig from '../../../src/theme';
import {isMobileUA} from '../../utils/common';
import InlineNotification from '../../atoms/InlineNotification';

const VideoPreview = () => {
  const {setPreviewVideoTrack, setSaveVB, previewVideoTrack} = useVB();
  const rtc = useContext(RtcContext);
  const vContainerRef = React.useRef(null);
  const {video: localVideoStatus} = useLocalUserInfo();

  const isLocalVideoON = localVideoStatus === ToggleState.enabled;
  const isMobileWeb = isMobileUA();
  const {defaultContent, activeUids} = useContent();
  const [maxUid] = activeUids;

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
    if (isMobileWeb) return;
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
    <View style={styles.previewContainer}>
      {isLocalVideoON ? (
        isMobileWeb ? (
          <View style={styles.mobilePreview}>
            <MaxVideoView
              user={defaultContent[maxUid]}
              key={maxUid}
              fallback={() => <></>}
              isPrecallScreen={true}
              containerStyle={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
              }}
            />
          </View>
        ) : (
          <View ref={vContainerRef} style={styles.desktopPreview}></View>
        )
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
