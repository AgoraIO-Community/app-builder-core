import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {RenderInterface, UidType} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';

interface VideoRendererProps {
  user: RenderInterface;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user}) => {
  const isActiveSpeaker = useIsActiveSpeaker();

  return (
    <View style={maxStyle.container}>
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
          return FallbackLogo(user?.name, isActiveSpeaker(user.uid));
        }}
        user={user}
        key={user.uid}
      />
      <NameWithMicIcon user={user} />
    </View>
  );
};

const maxStyle = StyleSheet.create({
  container: {width: '100%', height: '100%', position: 'relative'},
});

export default VideoRenderer;
