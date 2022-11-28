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
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import SelectDeviceSettings from '../subComponents/SelectDeviceSettings';
import {useString} from '../utils/useString';
import LanguageSelector from '../subComponents/LanguageSelector';
import {isWebInternal} from '../utils/common';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../utils/useRemoteMute';
import OutlineButton from '../atoms/OutlineButton';
import IconButton from '../atoms/IconButton';

const SettingsView = (props) => {
  const {
    data: {isHost},
  } = useMeetingInfo();
  //commented for v1 release
  //const selectInputDeviceLabel = useString('selectInputDeviceLabel')();
  const selectInputDeviceLabel = 'Input Device Settings';
  const settingsLabel = 'Settings';
  const hostControlsLabel = 'Host Controls';
  const {sidePanel, setSidePanel} = useSidePanel();
  const muteRemote = useRemoteMute();
  const onPressMuteVideo = () => muteRemote(MUTE_REMOTE_TYPE.video);
  const onPressMuteAudio = () => muteRemote(MUTE_REMOTE_TYPE.audio);
  return (
    <View
      style={isWebInternal() ? style.settingsView : style.settingsViewNative}>
      <View style={style.header}>
        <Text style={style.mainHeading}>{settingsLabel}</Text>
        <IconButton
          iconProps={{
            name: 'closeRounded',
            tintColor: '#000000',
          }}
          onPress={() => {
            setSidePanel(SidePanelType.None);
            props.handleClose && props.handleClose();
          }}
        />
      </View>
      <ScrollView style={style.contentContainer}>
        <Text style={style.heading}>{selectInputDeviceLabel}</Text>
        <View style={{paddingTop: 20}}>
          <SelectDeviceSettings />
        </View>
        <View style={style.hrLine}></View>
        {isHost ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <Text style={style.heading2}>{hostControlsLabel}</Text>
            <OutlineButton
              onPress={onPressMuteVideo}
              iconName="videocamOn"
              text="Mute everyone’s camera"
            />
            <OutlineButton
              onPress={onPressMuteAudio}
              iconName="micOn"
              text="Mute everyone’s mic"
            />
          </View>
        ) : (
          <></>
        )}
        <LanguageSelector />
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  heading2: {
    paddingTop: 20,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 14,
    color: '#000000',
  },
  hrLine: {
    width: '100%',
    height: 1,
    color: '#EDEDED',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  mainHeading: {
    alignSelf: 'center',
    fontSize: 16,
    letterSpacing: 0.8,
    lineHeight: 16,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    color: $config.PRIMARY_FONT_COLOR,
  },
  main: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  heading: {
    color: '#000000',
    fontFamily: 'Source Sans Pro',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
  settingsView: {
    maxWidth: '20%',
    minWidth: 338,
    borderRadius: 12,
    marginLeft: 20,
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
