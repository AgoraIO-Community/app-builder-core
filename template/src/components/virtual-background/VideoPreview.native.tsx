import {StyleSheet, Text, View} from 'react-native';
import React, {useContext} from 'react';
import {RtcContext} from '../../../agora-rn-uikit';
import ThemeConfig from '../../../src/theme';
import {useLocalUserInfo} from 'customization-api';
import {ToggleState} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import InlineNotification from '../../atoms/InlineNotification';
import {RtcLocalView, VideoRenderMode} from 'react-native-agora';

const LocalView = RtcLocalView.SurfaceView;

const VideoPreview = () => {
  const rtc = useContext(RtcContext);
  const vContainerRef = React.useRef(null);
  const {video: localVideoStatus} = useLocalUserInfo();

  const isLocalVideoON = localVideoStatus === ToggleState.enabled;

  return (
    <View style={styles.previewContainer}>
      {isLocalVideoON ? (
        <LocalView
          ref={vContainerRef}
          style={{flex: 1}}
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
