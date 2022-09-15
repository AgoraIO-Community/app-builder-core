import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {RenderInterface, UidType} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import ColorContext from '../../components/ColorContext';
import NetworkQualityPill from '../../subComponents/NetworkQualityPill';
import NameWithMicIcon from './NameWithMicIcon';

interface VideoRendererProps {
  user: RenderInterface;
}
const VideoRenderer: React.FC<VideoRendererProps> = ({user}) => {
  const {primaryColor} = useContext(ColorContext);
  return (
    <View style={maxStyle.container}>
      <ScreenShareNotice uid={user.uid} />
      <NetworkQualityPill
        user={user}
        primaryColor={primaryColor}
        rootStyle={{
          marginLeft: 25,
          top: 8,
          right: 10,
        }}
        small
      />
      <MaxVideoView
        fallback={() => {
          return FallbackLogo(user?.name);
        }}
        user={user}
        key={user.uid}
      />
      <View style={maxStyle.nameHolder}>
        <NameWithMicIcon user={user} />
      </View>
    </View>
  );
};

const maxStyle = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex4: {flex: 4, backgroundColor: '#ffffff00'},
  flex1: {flex: 1},
  nameHolder: {
    marginTop: -25,
    backgroundColor: $config.SECONDARY_FONT_COLOR + 'aa',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    height: 25,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    zIndex: 5,
    maxWidth: '100%',
  },
  name: {
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 25,
    fontWeight: '700',
    flexShrink: 1,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export default VideoRenderer;
