import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {RenderInterface, UidType} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {useLayout, useRender} from 'customization-api';
import {getPinnedLayoutName} from './DefaultLayouts';

interface VideoRendererProps {
  user: RenderInterface;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user}) => {
  const isActiveSpeaker = useIsActiveSpeaker();
  const {currentLayout} = useLayout();
  const {activeUids} = useRender();
  // const showShareNotice =
  //   currentLayout === getPinnedLayoutName() &&
  //   activeUids &&
  //   activeUids?.length &&
  //   activeUids[0] === user.uid;
  const activeSpeaker = isActiveSpeaker(user.uid);
  return (
    <View
      style={[
        maxStyle.container,
        activeSpeaker
          ? maxStyle.activeContainerStyle
          : maxStyle.nonActiveContainerStyle,
      ]}>
      <ScreenShareNotice uid={user.uid} />
      <NetworkQualityPill
        user={user}
        primaryColor={$config.PRIMARY_ACTION_BRAND_COLOR}
        rootStyle={{
          marginLeft: 25,
          top: 12,
          right: 12,
          backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
        }}
        small
      />
      <MaxVideoView
        fallback={() => {
          return FallbackLogo(user?.name, activeSpeaker);
        }}
        user={user}
        containerStyle={{borderRadius: 12}}
        key={user.uid}
      />
      <NameWithMicIcon user={user} />
    </View>
  );
};

const maxStyle = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 12,
    borderWidth: 4,
  },
  activeContainerStyle: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  nonActiveContainerStyle: {
    borderColor: $config.VIDEO_AUDIO_TILE_COLOR,
  },
});

export default VideoRenderer;
