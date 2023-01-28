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
import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {PropsContext} from '../../agora-rn-uikit';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../subComponents/LocalVideoMute';
import Recording, {RecordingButtonProps} from '../subComponents/Recording';
import LocalSwitchCamera, {
  LocalSwitchCameraProps,
} from '../subComponents/LocalSwitchCamera';
import ScreenshareButton, {
  ScreenshareButtonProps,
} from '../subComponents/screenshare/ScreenshareButton';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {ClientRole} from '../../agora-rn-uikit';
import LiveStreamControls, {
  LiveStreamControlsProps,
} from './livestream/views/LiveStreamControls';
import {isWebInternal, useIsDesktop} from '../utils/common';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import LocalEndcall, {LocalEndcallProps} from '../subComponents/LocalEndCall';
import Spacer from '../atoms/Spacer';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

const Controls = () => {
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop()('toolbar');
  const {
    data: {isHost},
  } = useMeetingInfo();
  return (
    <View
      testID="videocall-controls"
      style={[
        style.container,
        {
          paddingHorizontal: isDesktop ? 32 : 16,
        },
      ]}>
      <View style={style.leftContent}>
        <View testID="layout-btn" style={{marginRight: 10}} collapsable={false}>
          {/**
           * .measure returns undefined on Android unless collapsable=false or onLayout are specified
           * so added collapsable property
           * https://github.com/facebook/react-native/issues/29712
           * */}
          <LayoutIconButton />
        </View>
        <View testID="invite-btn" style={{marginHorizontal: 10}}>
          <CopyJoinInfo />
        </View>
      </View>
      <View style={style.centerContent}>
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          <LiveStreamControls showControls={true} isDesktop />
        ) : (
          <></>
        )}
        <>
          {/**
           * In event mode when raise hand feature is active
           * and audience is promoted to host, the audience can also
           * demote himself
           */}
          {$config.EVENT_MODE ? (
            <LiveStreamControls
              isDesktop
              showControls={rtcProps?.role == ClientRole.Broadcaster && !isHost}
            />
          ) : (
            <></>
          )}
          <View testID="localAudio-btn" style={{marginHorizontal: 10}}>
            <LocalAudioMute showToolTip={true} />
          </View>
          {!$config.AUDIO_ROOM && (
            <View
              testID="localVideo-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <LocalVideoMute showToolTip={true} />
            </View>
          )}
          {!$config.AUDIO_ROOM && isMobileOrTablet() && (
            <View
              testID="switchCamera-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <LocalSwitchCamera />
            </View>
          )}
          {$config.SCREEN_SHARING && !isMobileOrTablet() && (
            <View
              testID="screenShare-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <ScreenshareButton />
            </View>
          )}
          {isHost && $config.CLOUD_RECORDING && (
            <View
              testID="recording-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <Recording />
            </View>
          )}
        </>
        <View testID="endCall-btn" style={{marginHorizontal: 10}}>
          <LocalEndcall />
        </View>
      </View>
      <View style={style.rightContent}></View>
    </View>
  );
};

type ControlsComponentsArrayProps = [
  (props: LocalAudioMuteProps) => JSX.Element,
  (props: LocalVideoMuteProps) => JSX.Element,
  (props: LocalSwitchCameraProps) => JSX.Element,
  (props: ScreenshareButtonProps) => JSX.Element,
  (props: RecordingButtonProps) => JSX.Element,
  (props: LocalEndcallProps) => JSX.Element,
  (props: LiveStreamControlsProps) => JSX.Element,
];

export const ControlsComponentsArray: ControlsComponentsArrayProps = [
  LocalAudioMute,
  LocalVideoMute,
  LocalSwitchCamera,
  ScreenshareButton,
  Recording,
  LocalEndcall,
  LiveStreamControls,
];

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: $config.TOOLBAR_COLOR,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContent: {
    flex: 1,
  },
});

export default Controls;
