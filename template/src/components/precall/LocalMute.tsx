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
import React, {useState, useEffect, useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {useCustomization} from 'customization-implementation';
import {
  isAndroid,
  isIOS,
  isMobileUA,
  isValidReactComponent,
} from '../../utils/common';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import PreCallSettings from './PreCallSettings';
import Spacer from '../../atoms/Spacer';
import {usePreCall} from './usePreCall';
import DeviceContext from '../DeviceContext';

const PreCallLocalMute = (props: {isMobileView?: boolean}) => {
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
  const {isMobileView = false} = props;
  const isNative = isAndroid() || isIOS();
  // for mweb check for camera * mic availablity for desktop it happens in settings panel
  // refactor later to set mic/camera availablity oustside settings panel <selectDevice>
  const {deviceList} = useContext(DeviceContext);
  const {setCameraAvailable, setMicAvailable} = usePreCall();
  const audioDevices = deviceList.filter((device) => {
    if (device.kind === 'audioinput') {
      return true;
    }
  });
  const videoDevices = deviceList.filter((device) => {
    if (device.kind === 'videoinput') {
      return true;
    }
  });
  useEffect(() => {
    if (audioDevices && audioDevices.length) {
      isMobileView && !isNative && setMicAvailable(true);
    }
  }, [audioDevices]);

  useEffect(() => {
    if (videoDevices && videoDevices.length) {
      isMobileView && !isNative && setCameraAvailable(true);
    }
  }, [videoDevices]);
  return (
    <View
      style={[style.precallControls, isMobileView && {paddingVertical: 10}]}
      testID="precall-controls">
      <View style={{width: 52, height: 52}}>
        <AudioMute
          isMobileView={isMobileView}
          showLabel={isMobileUA() ? !isMobileView : $config.ICON_TEXT}
          showToolTip={true}
        />
      </View>

      {!$config.AUDIO_ROOM && (
        <>
          <Spacer size={isMobileView ? 24 : 16} horizontal={true} />
          <View
            style={{
              width: 52,
              height: 52,
            }}>
            <VideoMute
              isMobileView={isMobileView}
              showLabel={isMobileUA() ? !isMobileView : $config.ICON_TEXT}
              showToolTip={true}
            />
          </View>
        </>
      )}

      {/* Settings View in Mobile */}
      {isMobileView && !isNative && (
        <>
          <Spacer size={isMobileView ? 24 : 16} horizontal={true} />
          <View
            style={{
              width: 52,
              height: 52,
            }}>
            <PreCallSettings />
          </View>
        </>
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
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    // borderBottomLeftRadius: 4,
    // borderBottomRightRadius: 4,
  },
});
