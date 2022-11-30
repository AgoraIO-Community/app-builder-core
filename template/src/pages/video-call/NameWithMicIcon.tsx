import React, {useContext} from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {RenderInterface} from '../../../agora-rn-uikit';
import ImageIcon from '../../atoms/ImageIcon';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import ColorContext from '../../components/ColorContext';
import {useString} from '../../utils/useString';

interface NameWithMicIconProps {
  user: RenderInterface;
}

const NameWithMicIcon = (props: NameWithMicIconProps) => {
  const {user} = props;
  const {primaryColor} = useContext(ColorContext);
  const {height, width} = useWindowDimensions();
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  return (
    <>
      <View>
        <ImageIcon
          name={user.audio ? 'mic-on' : 'mic-off'}
          tintColor={user.audio ? primaryColor : 'red'}
          iconSize={'small'}
        />
      </View>
      <View style={{flex: 1}}>
        <TextWithTooltip
          value={user.name || remoteUserDefaultLabel}
          style={[
            style.name,
            {
              fontSize: RFValue(14, height > width ? height : width),
            },
          ]}
        />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  name: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    flexShrink: 1,
    marginLeft: 8,
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
});

export default NameWithMicIcon;
