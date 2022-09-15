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
import {View, StyleSheet} from 'react-native';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent} from '../../utils/common';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';

const PreCallLocalMute: React.FC = () => {
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
    <View style={style.precallControls}>
      <View style={{alignSelf: 'center'}}>
        <AudioMute />
      </View>
      {!$config.AUDIO_ROOM && (
        <View style={{alignSelf: 'center'}}>
          <VideoMute />
        </View>
      )}
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
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
});
