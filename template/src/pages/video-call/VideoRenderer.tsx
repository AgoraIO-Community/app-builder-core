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
          : user.video
          ? maxStyle.noVideoStyle
          : maxStyle.nonActiveContainerStyle,
      ]}>
      <ScreenShareNotice uid={user.uid} />
      <NetworkQualityPill user={user} />
      <MaxVideoView
        fallback={() => {
          return FallbackLogo(user?.name, activeSpeaker);
        }}
        user={user}
        containerStyle={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
        }}
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
  noVideoStyle: {
    borderColor: 'transparent',
  },
});

export default VideoRenderer;
