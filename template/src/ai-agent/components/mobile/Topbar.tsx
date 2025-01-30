import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {LogoIcon, SettingsIcon} from '../icons';
import {SidePanelType, useSidePanel} from 'customization-api';
import ThemeConfig from '../../../theme';

const MobileTopbar = () => {
  const {setSidePanel} = useSidePanel();
  return (
    <View style={style.rootStyle}>
      <View style={style.containerStyle}>
        <View style={style.logContainerStyle}>
          <LogoIcon />
        </View>
        <Text style={style.textStyle}>Agora & OpenAI Demo</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSidePanel(SidePanelType.Settings);
        }}>
        <SettingsIcon />
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  rootStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  containerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'stretch',
  },
  logContainerStyle: {
    display: 'flex',
    width: 40,
    height: 40,
    paddingRight: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    color: '#C3C3C3',
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default MobileTopbar;
