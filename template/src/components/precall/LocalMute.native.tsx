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
import { useFpe } from 'fpe-api/api';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cmpTypeGuard } from '../../utils/common';
import {LocalAudioMute,LocalVideoMute,SwitchCamera} from '../../../agora-rn-uikit';
import { LocalUserContext } from '../../../agora-rn-uikit';

const PreCallLocalMute: React.FC = () => {
  const PreCallLocalVideoMuteFpe = useFpe(data => {
    if(data.components?.PreCallScreen && typeof data.components?.PreCallScreen === 'object' && typeof data.components?.PreCallScreen.PreCallLocalMute === 'object'){
      return data.components?.PreCallScreen.PreCallLocalMute?.PreCallLocalVideoMute
    } 
  })
  const PreCallLocalAudioMuteFpe = useFpe(data => {
    if(data.components?.PreCallScreen && typeof data.components?.PreCallScreen === 'object' && typeof data.components?.PreCallScreen.PreCallLocalMute === 'object'){
      return data.components?.PreCallScreen.PreCallLocalMute?.PreCallLocalAudioMute
    } 
  })
  return (
    <LocalUserContext>
      <View style={style.width50}>
        {cmpTypeGuard(PreCallLocalVideoMuteFpe,LocalAudioMute as React.FC)}
      </View>
      <View style={style.width50} />
      <View style={style.width50}>
        {cmpTypeGuard(PreCallLocalAudioMuteFpe,LocalVideoMute as React.FC)}
      </View>
      <View style={style.width50} />
      <View style={style.width50}>
        <SwitchCamera />
      </View>
    </LocalUserContext>
  )
}
export default PreCallLocalMute;

const style = StyleSheet.create({
  width50: {width: 50},
});