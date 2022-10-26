/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import SelectDevice from '../subComponents/SelectDevice';
import HostControlView from './HostControlView';
import {useString} from '../utils/useString';
import LanguageSelector from '../subComponents/LanguageSelector';
import {isWebInternal} from '../utils/common';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';

const SettingsView = () => {
  const {
    data: {isHost},
  } = useMeetingInfo();
  //commented for v1 release
  //const selectInputDeviceLabel = useString('selectInputDeviceLabel')();
  const selectInputDeviceLabel = 'Select Input Device';

  return (
    <View
      style={isWebInternal() ? style.settingsView : style.settingsViewNative}>
      <View style={style.main}>
        <View>
          <Text style={style.heading}>{selectInputDeviceLabel}</Text>
          <View style={style.popupPickerHolder}>
            <SelectDevice />
          </View>
        </View>
        {isHost ? <HostControlView /> : <></>}
        <LanguageSelector />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  main: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  popupPickerHolder: {
    justifyContent: 'space-around',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    alignSelf: 'center',
  },
  settingsView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    borderRadius: 12,
    marginLeft: 24,
    marginTop: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 12,
  },
  settingsViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
});

export default SettingsView;
