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
import { checkIsComponent } from '../../utils/common';
import { PreCallLocalVideoMute, PreCallLocalAudioMute } from './index';
import { LocalUserContext } from '../../../agora-rn-uikit';

const PreCallLocalMute: React.FC = () => {
  const PreCallLocalVideoMuteFpe = useFpe(data => data.components?.PreCallScreen?.PreCallLocalMute?.PreCallLocalVideoMute)
  const PreCallLocalAudioMuteFpe = useFpe(data => data.components?.PreCallScreen?.PreCallLocalMute?.PreCallLocalAudioMute)
  return (
    <View style={style.precallControls}>
      <LocalUserContext>
        <View style={{ alignSelf: 'center' }}>
          {checkIsComponent(PreCallLocalVideoMuteFpe) ? <PreCallLocalVideoMuteFpe /> : <PreCallLocalVideoMute />}
        </View>
        <View style={{ alignSelf: 'center' }}>
          {checkIsComponent(PreCallLocalAudioMuteFpe) ? <PreCallLocalAudioMuteFpe /> : <PreCallLocalAudioMute />}
        </View>
      </LocalUserContext>
    </View>
  )
}
export default PreCallLocalMute;

const style = StyleSheet.create({
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
});