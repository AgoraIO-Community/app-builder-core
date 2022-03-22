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
import {
  View,
  StyleSheet,
} from 'react-native';
import {LocalUserContext} from '../../agora-rn-uikit';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  Endcall,
} from '../../agora-rn-uikit';
import Recording from '../subComponents/Recording';
import { useVideoCall } from 'fpe-api';
import { useString } from 'src/utils/useString';

const Controls = () => {
  const {setRecordingActive, recordingActive, isHost} = useVideoCall(data => data);
  
  return (
    <LocalUserContext>
      <View style={style.bottomBar}>
        <View style={{alignSelf: 'center'}}>
          <LocalAudioMute btnText={useString('audio')} />
        </View>
        <View style={{alignSelf: 'center'}}>
          <LocalVideoMute btnText={useString('video')}/>
        </View>
        {isHost ? (
          $config.CLOUD_RECORDING ? (
            <View style={{alignSelf: 'center'}}>
              <Recording
                recordingActive={recordingActive}
                setRecordingActive={setRecordingActive}
              />
            </View>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        <View style={{alignSelf: 'center'}}>
          <SwitchCamera btnText={useString('switch')} />
        </View>
        <View style={{alignSelf: 'center'}}>
          <Endcall btnText={useString('hangUp')} />
        </View>
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  bottomBar: {
    flex: 1,
    paddingHorizontal: '1%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '80',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'relative',
    margin: 0,
    minHeight: 40,
    bottom: 0,
  },
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 2,
    borderColor: $config.PRIMARY_COLOR,
    // borderWidth: 1,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 35,
    height: 35,
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default Controls;
