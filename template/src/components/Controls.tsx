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
import {View, Dimensions, Platform, StyleSheet} from 'react-native';
import {LocalUserContext} from '../../agora-rn-uikit';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
  PropsContext,
} from '../../agora-rn-uikit';
import Recording from '../subComponents/Recording';
import SwitchCamera from '../subComponents/SwitchCamera';
import ScreenshareButton from '../subComponents/screenshare/ScreenshareButton';
import {controlsHolder} from '../../theme.json';
import mobileAndTabletCheck from '../utils/mobileWebTest';
import {ClientRole} from '../../agora-rn-uikit';
import LiveStreamControls from './livestream/views/LiveStreamControls';

const Controls = (props: any) => {
  const {rtcProps} = useContext(PropsContext);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > 1224;
  const {setRecordingActive, recordingActive, isHost} = props;

  return (
    <LocalUserContext>
      <View
        style={[
          style.controlsHolder,
          {
            paddingHorizontal: isDesktop ? '25%' : '1%',
            backgroundColor: $config.SECONDARY_FONT_COLOR + 80,
          },
        ]}
        onLayout={onLayout}>
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
            {mobileAndTabletCheck() && (
              <View style={{alignSelf: 'center'}}>
                <SwitchCamera />
              </View>
            )}
            {$config.SCREEN_SHARING && !mobileAndTabletCheck() && (
              <View style={{alignSelf: 'center'}}>
                <ScreenshareButton />
              </View>
            )}
            {isHost && $config.CLOUD_RECORDING && (
              <View style={{alignSelf: 'center'}}>
                <Recording
                  recordingActive={recordingActive}
                  setRecordingActive={setRecordingActive}
                />
              </View>
            )}
          </>
        )}
        <View style={{alignSelf: 'center'}}>
          <Endcall />
        </View>
      </View>
    </LocalUserContext>
  );
};

const style = StyleSheet.create({
  controlsHolder: {
    flex: Platform.OS === 'web' ? 1.3 : 1.6,
    ...controlsHolder,
  },
  chatNotification: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    color: $config.SECONDARY_FONT_COLOR,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    left: 25,
    top: -10,
  },
});

export default Controls;
