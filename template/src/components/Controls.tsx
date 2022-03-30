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
import {
  View,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import {LocalUserContext} from '../../agora-rn-uikit';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from '../../agora-rn-uikit';
import Recording from '../subComponents/Recording';
import SwitchCamera from '../subComponents/SwitchCamera';
import ScreenshareButton from '../subComponents/ScreenshareButton';
import {controlsHolder} from '../../theme.json';
import isMobileOrTablet from '../utils/mobileWebTest';
import { useVideoCall, ScreenShareProvider, RecordingProvider } from 'fpe-api';
import { useString } from '../utils/useString';

const Controls = () => {
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > 1224;
  const [screenshareActive, setScreenshareActive] = useState<boolean>(false);
  const {
    setRecordingActive,
    recordingActive,
    isHost,
    setLayout,
  } = useVideoCall(data => data);

  return (
    <LocalUserContext>
      <View
        style={[
          style.controlsHolder,
          {paddingHorizontal: isDesktop ? '25%' : '1%', backgroundColor: $config.SECONDARY_FONT_COLOR + 80},
        ]}
        onLayout={onLayout}>
        <View style={{alignSelf: 'center'}}>
          <LocalAudioMute btnText={useString('audio')} />
        </View>
        <View style={{alignSelf: 'center'}}>
          <LocalVideoMute btnText={useString('video')} />
        </View>
        {isMobileOrTablet() ? (
        <View style={{alignSelf: 'center'}}>
          <SwitchCamera />
        </View>
        ) : (<></>)}
        {$config.SCREEN_SHARING ? (
          !isMobileOrTablet() ? (
            <View style={{alignSelf: 'center'}}>
              <ScreenShareProvider 
                screenshareActive={screenshareActive}
                setScreenshareActive={setScreenshareActive}
              >
                <ScreenshareButton />
              </ScreenShareProvider>
            </View>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {isHost ? (
          $config.CLOUD_RECORDING ? (
            <View style={{alignSelf: 'center'}}>
              <RecordingProvider
                recordingActive={recordingActive}
                setRecordingActive={setRecordingActive}
              >
                <Recording />
              </RecordingProvider>
            </View>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        <View style={{alignSelf: 'center'}}>
          <Endcall btnText={useString('endCallButton')} />
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
  // localButton: localButton,
  // buttonIcon: buttonIcon,
});

export default Controls;
