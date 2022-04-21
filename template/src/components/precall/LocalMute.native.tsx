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
import {useFpe} from 'fpe-api';

import React from 'react';
import {View, StyleSheet} from 'react-native';
import {getCmpTypeGuard} from '../../utils/common';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
} from '../../../agora-rn-uikit';
import {LocalUserContext} from '../../../agora-rn-uikit';
import {useString} from '../../utils/useString';

const PreCallLocalMute: React.FC = () => {
  const {videoMute, audioMute} = useFpe((data) =>
    typeof data?.components?.precall === 'object'
      ? data.components?.precall
      : {},
  );
  const AudioCmp = getCmpTypeGuard(LocalAudioMute, audioMute);
  const VideoCmp = getCmpTypeGuard(LocalVideoMute, videoMute);
  return (
    <LocalUserContext>
      <View style={style.width50}>
        <AudioCmp btnText={useString('toggleAudioButton')()} />
      </View>
      <View style={style.width50} />
      <View style={style.width50}>
        <VideoCmp btnText={useString('toggleVideoButton')()} />
      </View>
      <View style={style.width50} />
      <View style={style.width50}>
        <SwitchCamera btnText={useString('switchCameraButton')()} />
      </View>
    </LocalUserContext>
  );
};
export default PreCallLocalMute;

const style = StyleSheet.create({
  width50: {width: 50},
});
