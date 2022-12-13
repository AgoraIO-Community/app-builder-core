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
import React, {useState} from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent} from '../../utils/common';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import Spacer from 'src/atoms/Spacer';

const PreCallLocalMute: React.FC = (props: {isMobileView?: boolean}) => {
  const {VideoMute, AudioMute} = useCustomization((data) => {
    let components: {
      VideoMute: React.ComponentType<LocalAudioMuteProps>;
      AudioMute: React.ComponentType<LocalVideoMuteProps>;
    } = {
      AudioMute: LocalAudioMute,
      VideoMute: LocalVideoMute,
    };
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data.components?.precall?.audioMute &&
    //     typeof data.components?.precall?.audioMute !== 'object'
    //   ) {
    //     if (
    //       data.components?.precall?.audioMute &&
    //       isValidReactComponent(data.components?.precall?.audioMute)
    //     ) {
    //       components.AudioMute = data.components?.precall?.audioMute;
    //     }
    //   }

    //   if (
    //     data.components?.precall?.videoMute &&
    //     typeof data.components?.precall?.videoMute !== 'object'
    //   ) {
    //     if (
    //       data.components?.precall?.videoMute &&
    //       isValidReactComponent(data.components?.precall?.videoMute)
    //     ) {
    //       components.VideoMute = data.components?.precall?.videoMute;
    //     }
    //   }
    // }
    return components;
  });

  return (
    <View
      style={[
        style.precallControls,
        {paddingVertical: props.isMobileView ? 20 : 30},
      ]}
      testID="precall-controls">
      {!$config.AUDIO_ROOM && (
        <View
          style={{
            alignSelf: 'center',
            marginRight: props.isMobileView ? 20 : 0,
          }}>
          <VideoMute />
        </View>
      )}
      <View style={{alignSelf: 'center'}}>
        <AudioMute />
      </View>
    </View>
  );
};
export const PreCallLocalMuteComponentsArray: [
  (props: LocalAudioMuteProps) => JSX.Element,
  (props: LocalVideoMuteProps) => JSX.Element,
] = [LocalAudioMute, LocalVideoMute];

export default PreCallLocalMute;

const style = StyleSheet.create({
  precallControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    shadowColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['10%'],
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
  },
});
