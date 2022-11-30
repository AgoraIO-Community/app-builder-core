import React, {useContext} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ThemeConfig from '../../theme';
import {RenderInterface} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import {useString} from '../../utils/useString';

interface NameWithMicIconProps {
  user: RenderInterface;
}

const NameWithMicIcon = (props: NameWithMicIconProps) => {
  const {user} = props;
  const {height, width} = useWindowDimensions();
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  return (
    <View style={style.container}>
      <View>
        <ImageIcon
          name={user.audio ? 'mic-on' : 'mic-off'}
          tintColor={
            user.audio
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : $config.SEMANTIC_ERROR
          }
          iconSize={'small'}
        />
      </View>
      <View style={{flex: 1}}>
        <Text numberOfLines={1} textBreakStrategy="simple" style={style.name}>
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
    height: 30,
    left: 12,
    bottom: 12,
    borderRadius: 20,
    flexDirection: 'row',
    zIndex: 5,
    maxWidth: '100%',
  },
  name: {
    color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.extraSmall,
    lineHeight: ThemeConfig.FontSize.extraSmall,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexShrink: 1,
    marginLeft: 8,
  },
});

export default NameWithMicIcon;
