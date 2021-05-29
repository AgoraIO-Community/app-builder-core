import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import SelectDevice from '../subComponents/SelectDevice';
import HostControlView from './HostControlView';
import ColorContext from './ColorContext';
import {SidePanelType} from '../subComponents/SidePanelEnum';

const SettingsView = (props: any) => {
  const {isHost} = props;
  return (
    <View
      style={
        Platform.OS === 'web' ? style.settingsView : style.settingsViewNative
      }>
      <View style={style.main}>
        <Text style={style.heading}>Select Input Device</Text>
        <View style={style.popupPickerHolder}>
          <SelectDevice />
        </View>
        {isHost ? <HostControlView /> : <></>}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  main: {
    backgroundColor: $config.secondaryFontColor,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
    flexGrow: 1,
    shadowColor: $config.primaryFontColor + '80',
    shadowOpacity: .5,
    shadowOffset: {width:-2, height: 0},
    shadowRadius: 3,
    paddingHorizontal: 20,
  },
  popupPickerHolder: {
    // height: '40%',
    justifyContent: 'space-around',
    // paddingHorizontal: '8%',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: $config.primaryFontColor,
    // marginBottom: 20,
    alignSelf: 'center',
  },
  settingsView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    backgroundColor: $config.secondaryFontColor,
    flex: 1,
  },
  settingsViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: $config.secondaryFontColor,
  },
});

export default SettingsView;
