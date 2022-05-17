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
import React, {useState, useContext, useEffect, useCallback} from 'react';
import {RtcContext, ClientRole} from '../../agora-rn-uikit';
import DeviceContext from './DeviceContext';
import AgoraRTC from 'agora-rtc-sdk-ng';

interface Props {
  userRole: ClientRole;
}

const DeviceConfigure: React.FC<Props> = (props: any) => {
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [deviceList, setDeviceList] = useState<any>([]);
  const rtc = useContext(RtcContext);

  const refreshDevices = useCallback(async () => {
    rtc.RtcEngine.getDevices(function (devices: any) {
      console.log('set devices');
      setDeviceList(devices);
    });
  }, []);

  useEffect(() => {
    AgoraRTC.onMicrophoneChanged = async (changedDevice: any) => {
      // When new audio device is plugged in ,refresh the devices list.
      refreshDevices();
      if (changedDevice && changedDevice.state === 'ACTIVE') {
        if (changedDevice.device?.kind === 'audioinput') {
          setSelectedMic(changedDevice.device?.deviceId);
        }
      }
    };
    AgoraRTC.onCameraChanged = async (changedDevice: any) => {
      // When new video device is plugged in ,refresh the devices list.
      refreshDevices();
      if (changedDevice && changedDevice.state === 'ACTIVE') {
        if (changedDevice.device?.kind === 'videoinput') {
          setSelectedCam(changedDevice.device?.deviceId);
        }
      }
    };
  });

  useEffect(() => {
    if (!selectedMic || selectedMic.trim().length == 0) {
      for (const i in deviceList) {
        if (deviceList[i].kind === 'audioinput') {
          setSelectedMic(deviceList[i].deviceId);
          break;
        }
      }
    }
    if (!selectedCam || selectedCam.trim().length == 0) {
      for (const i in deviceList) {
        if (deviceList[i].kind === 'videoinput') {
          setSelectedCam(deviceList[i].deviceId);
          break;
        }
      }
    }
    console.log('deviceList', deviceList);
  }, [deviceList]);

  useEffect(() => {
    if (selectedCam.length !== 0) {
      rtc.RtcEngine.changeCamera(
        selectedCam,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam]);

  useEffect(() => {
    if (selectedCam.length !== 0) {
      rtc.RtcEngine.changeMic(
        selectedMic,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic]);

  useEffect(() => {
    // See if device is empty
    const deviceIdIsEmpty = deviceList.find(
      (device) => device?.deviceId === '',
    );
    // If stream exists and deviceIds are empty, check for devices again
    if (
      rtc?.RtcEngine?.localStream &&
      Object.keys(rtc?.RtcEngine?.localStream).length !== 0 &&
      (deviceIdIsEmpty || deviceList.length === 0)
    ) {
      refreshDevices();
    }
  }, [rtc]);

  return (
    <DeviceContext.Provider
      value={{
        selectedCam,
        setSelectedCam,
        selectedMic,
        setSelectedMic,
        deviceList,
        setDeviceList,
      }}>
      {true ? props.children : <></>}
    </DeviceContext.Provider>
  );
};

export default DeviceConfigure;
