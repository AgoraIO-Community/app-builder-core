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
import {useFpe} from 'fpe-api';
import {isValidReactComponent} from '../../utils/common';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';

const PreCallLocalMute: React.FC = () => {
  const {
    VideoMute,
    AudioMute,
    AudioMuteAfterView,
    AudioMuteBeforeView,
    VideoMuteAfterView,
    VideoMuteBeforeView,
  } = useFpe((data) => {
    let components: {
      VideoMuteBeforeView: React.ComponentType;
      VideoMuteAfterView: React.ComponentType;
      AudioMuteBeforeView: React.ComponentType;
      AudioMuteAfterView: React.ComponentType;
      VideoMute: React.ComponentType<LocalAudioMuteProps>;
      AudioMute: React.ComponentType<LocalVideoMuteProps>;
    } = {
      AudioMuteAfterView: React.Fragment,
      AudioMuteBeforeView: React.Fragment,
      VideoMuteAfterView: React.Fragment,
      VideoMuteBeforeView: React.Fragment,
      AudioMute: LocalAudioMute,
      VideoMute: LocalVideoMute,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data.components?.precall?.audioMute &&
        typeof data.components?.precall?.audioMute !== 'object'
      ) {
        if (
          data.components?.precall?.audioMute &&
          isValidReactComponent(data.components?.precall?.audioMute)
        ) {
          components.AudioMute = data.components?.precall?.audioMute;
        }
      }

      if (
        data.components?.precall?.audioMute &&
        typeof data.components?.precall?.audioMute === 'object'
      ) {
        if (
          data.components?.precall?.audioMute?.after &&
          isValidReactComponent(data.components?.precall?.audioMute?.after)
        ) {
          components.AudioMuteAfterView =
            data.components?.precall?.audioMute?.after;
        }
        if (
          data.components?.precall?.audioMute?.before &&
          isValidReactComponent(data.components?.precall?.audioMute?.before)
        ) {
          components.AudioMuteBeforeView =
            data.components?.precall?.audioMute?.before;
        }
      }

      if (
        data.components?.precall?.videoMute &&
        typeof data.components?.precall?.videoMute !== 'object'
      ) {
        if (
          data.components?.precall?.videoMute &&
          isValidReactComponent(data.components?.precall?.videoMute)
        ) {
          components.VideoMute = data.components?.precall?.videoMute;
        }
      }

      if (
        data.components?.precall?.videoMute &&
        typeof data.components?.precall?.videoMute === 'object'
      ) {
        if (
          data.components?.precall?.videoMute?.after &&
          isValidReactComponent(data.components?.precall?.videoMute?.after)
        ) {
          components.VideoMuteAfterView =
            data.components?.precall?.videoMute?.after;
        }
        if (
          data.components?.precall?.videoMute?.before &&
          isValidReactComponent(data.components?.precall?.videoMute?.before)
        ) {
          components.VideoMuteBeforeView =
            data.components?.precall?.videoMute?.before;
        }
      }
    }
    return components;
  });
  return (
    <View style={style.precallControls}>
      <View style={{alignSelf: 'center'}}>
        <AudioMuteBeforeView />
        <AudioMute />
        <AudioMuteAfterView />
      </View>
      <View style={{alignSelf: 'center'}}>
        <VideoMuteBeforeView />
        <VideoMute />
        <VideoMuteAfterView />
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
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
});
