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
import React, {useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../subComponents/LocalVideoMute';
import Recording, {RecordingButtonProps} from '../subComponents/Recording';
import LiveStreamControls, {
  LiveStreamControlsProps,
} from './livestream/views/LiveStreamControls';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import ScreenshareButton, {
  ScreenshareButtonProps,
} from '../subComponents/screenshare/ScreenshareButton';
import {useFpe} from 'fpe-api';
import {isValidReactComponent} from '../utils/common';
import LocalEndcall, {LocalEndcallProps} from '../subComponents/LocalEndCall';
import LocalSwitchCamera, {
  LocalSwitchCameraProps,
} from '../subComponents/LocalSwitchCamera';

const Controls = () => {
  const {isHost} = useMeetingInfo();
  const {rtcProps} = useContext(PropsContext);

  const {ControlsAfterView, ControlsBeforeView} = useFpe((data) => {
    let components: {
      ControlsAfterView: React.ComponentType;
      ControlsBeforeView: React.ComponentType;
    } = {
      ControlsAfterView: React.Fragment,
      ControlsBeforeView: React.Fragment,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      if (
        data?.components?.videoCall?.bottomBar &&
        typeof data?.components?.videoCall?.bottomBar === 'object'
      ) {
        if (
          data?.components?.videoCall?.bottomBar?.after &&
          isValidReactComponent(data?.components?.videoCall?.bottomBar?.after)
        ) {
          components.ControlsAfterView =
            data?.components?.videoCall?.bottomBar?.after;
        }
        if (
          data?.components?.videoCall?.bottomBar?.before &&
          isValidReactComponent(data?.components?.videoCall?.bottomBar?.before)
        ) {
          components.ControlsBeforeView =
            data?.components?.videoCall?.bottomBar?.before;
        }
      }
    }
    return components;
  });
  return (
    <>
      <ControlsBeforeView />
      <View style={style.bottomBar}>
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          <LiveStreamControls showControls={true} />
        ) : (
          <>
            {/**
             * In event mode when raise hand feature is active
             * and audience is promoted to host, the audience can also
             * demote himself
             */}
            {$config.EVENT_MODE && (
              <LiveStreamControls
                showControls={
                  rtcProps?.role == ClientRole.Broadcaster && !isHost
                }
              />
            )}
            <View style={{alignSelf: 'center'}}>
              <LocalAudioMute />
            </View>
            <View style={{alignSelf: 'center'}}>
              <LocalVideoMute />
            </View>
            {isHost && $config.CLOUD_RECORDING && (
              <View style={{alignSelf: 'baseline'}}>
                <Recording />
              </View>
            )}
            <View style={{alignSelf: 'center'}}>
              <LocalSwitchCamera />
            </View>
          </>
        )}
        <View style={{alignSelf: 'center'}}>
          <LocalEndcall />
        </View>
      </View>
      <ControlsAfterView />
    </>
  );
};
export const ControlsComponentsArray: [
  (props: LocalAudioMuteProps) => JSX.Element,
  (props: LocalVideoMuteProps) => JSX.Element,
  (props: LocalSwitchCameraProps) => JSX.Element,
  (props: ScreenshareButtonProps) => JSX.Element,
  (props: RecordingButtonProps) => JSX.Element,
  (props: LocalEndcallProps) => JSX.Element,
  (props: LiveStreamControlsProps) => JSX.Element,
] = [
  LocalAudioMute,
  LocalVideoMute,
  LocalSwitchCamera,
  ScreenshareButton,
  Recording,
  LocalEndcall,
  LiveStreamControls,
];
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
