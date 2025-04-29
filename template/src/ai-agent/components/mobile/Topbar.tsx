import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useRoomInfo} from 'customization-api';
import ThemeConfig from '../../../theme';
import {SettingButton} from '../ControlButtons';
import {getAILayoutType} from '../../utils';

const MobileTopbar = () => {
  const {
    data: {meetingTitle},
  } = useRoomInfo();

  return (
    <View style={style.rootStyle}>
      <View style={style.containerStyle}>
        <Text style={style.textStyle}>{meetingTitle}</Text>
      </View>
      {getAILayoutType() !== 'LAYOUT_TYPE_2' ? (
        <View>
          <SettingButton />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  rootStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  containerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  textStyle: {
    color: $config.FONT_COLOR,
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default MobileTopbar;
