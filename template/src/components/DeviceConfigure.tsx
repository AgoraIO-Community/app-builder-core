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
import React, {useState, useEffect, useCallback} from 'react';
import {ClientRole} from '../../agora-rn-uikit';
import DeviceContext, {DeviceList} from './DeviceContext';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useRtc} from 'customization-api';

interface Props {
  userRole: ClientRole;
}
interface deviceInfo {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}
interface changedDeviceInfo {
  device: deviceInfo;
  initAt: number;
  state: 'INACTIVE' | 'ACTIVE';
  updateAt: number;
}
const DeviceConfigure: React.FC<Props> = (props: any) => {
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [deviceList, setDeviceList] = useState([]);
  const rtc = useRtc();

  const updateDeviceList = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log('WEBAPI: enumarated devices: ', devices);
      // Decvice ids are empty until when permissions are not taken
      const filteredDevices = devices.filter(
        (device) => device.deviceId !== '',
      );
      setDeviceList(filteredDevices);
    });
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = (event) => {
      console.log('WEBAPI: device-change event occured: ', event);
      updateDeviceList();
    };
  }, []);

  useEffect(() => {
    for (const i in deviceList) {
      if (deviceList[i].kind === 'videoinput') {
        console.log('WEBAPI: setting camera ', deviceList[i]);
        setSelectedCam(deviceList[i].deviceId);
        break;
      }
    }
    for (const i in deviceList) {
      if (deviceList[i].kind === 'audioinput') {
        console.log('WEBAPI: setting microphone ', deviceList[i]);
        setSelectedMic(deviceList[i].deviceId);
        break;
      }
    }
  }, [deviceList]);

  useEffect(() => {
    if (selectedCam.length !== 0) {
      console.log('WEBAPI: setting camera: ', selectedCam);
      rtc.RtcEngine.changeCamera(
        selectedCam,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCam]);

  useEffect(() => {
    if (selectedMic.length !== 0) {
      console.log('WEBAPI: setting camera: ', selectedMic);
      rtc.RtcEngine.changeMic(
        selectedMic,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic]);

  useEffect(() => {
    // If stream exists and deviceList are empty, check for devices again
    if (!deviceList || deviceList.length === 0) {
      console.log('WEBAPI: calling update device list');
      updateDeviceList();
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
      }}>
      {props.children}
    </DeviceContext.Provider>
  );
};

export default DeviceConfigure;
