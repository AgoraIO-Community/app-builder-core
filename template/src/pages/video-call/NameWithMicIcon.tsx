import React, {useContext} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ThemeConfig from '../../theme';
import {RenderInterface} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import {useString} from '../../utils/useString';
import {useRender} from 'customization-api';
import useIsActiveSpeaker from '../../utils/useIsActiveSpeaker';
import {isWebInternal} from '../../utils/common';
import AnimatedActiveSpeaker from '../../atoms/AnimatedActiveSpeaker';

interface NameWithMicIconProps {
  user: RenderInterface;
}

const NameWithMicIcon = (props: NameWithMicIconProps) => {
  const {user} = props;
  const {height, width} = useWindowDimensions();
  const isActiveSpeaker = useIsActiveSpeaker();
  const isSpeaking = isActiveSpeaker(user.uid);
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  return (
    <View style={style.container}>
      {/* {user.audio ? (
          <AnimatedActiveSpeaker isSpeaking={isSpeaking} />
        ) : ( */}
      <ImageIcon
        iconType="plain"
        name={
          user.audio && isSpeaking
            ? 'active-speaker'
            : user.audio
            ? 'mic-on'
            : 'mic-off'
        }
        tintColor={
          user.audio
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.SEMANTIC_ERROR
        }
        iconSize={20}
      />
      {/* )} */}
      {/* <ImageIcon
          name={
            isSpeaking ? 'active-speaker' : user.audio ? 'mic-on' : 'mic-off'
          }
          tintColor={
            isSpeaking
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : user.audio
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : $config.SEMANTIC_ERROR
          }
          iconSize={'small'}
        /> */}
      <View style={{flex: 1}}>
        <Text
          numberOfLines={1}
          textBreakStrategy="simple"
          ellipsizeMode="tail"
          style={style.name}>
          {user.name || remoteUserDefaultLabel}
        </Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
    position: 'absolute',
    alignItems: 'center',
    padding: 8,
    height: 32,
    left: 12,
    bottom: 12,
    borderRadius: 4,
    flexDirection: 'row',
    zIndex: 5,
    maxWidth: 180,
  },
  name: {
    color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexShrink: 1,
    marginLeft: 4,
  },
});

export default NameWithMicIcon;
