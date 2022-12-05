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
  const [deviceList, setDeviceList] = useState<DeviceList>(null);
  const rtc = useRtc();

  const updateDeviceList = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const deviceList = devices.reduce(
        (acc, device: InputDeviceInfo) => {
          const {kind, groupId} = device;
          return {
            ...acc,
            [kind]: {
              ...acc[kind],
              [groupId]: [...(acc[kind][groupId] || []), device],
            },
          };
        },
        {
          audioinput: {},
          audiooutput: {},
          videoinput: {},
          videooutput: {},
        },
      );
      setDeviceList(deviceList);
    });
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = (event) => {
      console.log('WEB API: device-change: ', event);
      updateDeviceList();
    };
  }, []);

  useEffect(() => {
    if (!selectedMic || selectedMic.trim().length == 0) {
      (deviceList.audioinput &&
        deviceList.audioinput[Object.keys(deviceList.audioinput)[0]][0]
          .deviceId) ||
        '';
    }
    if (!selectedCam || selectedCam.trim().length == 0) {
      (deviceList.videoinput &&
        deviceList.videoinput[Object.keys(deviceList.videoinput)[0]][0]
          .deviceId) ||
        '';
    }
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
    if (selectedMic.length !== 0) {
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
    // if (deviceList.length === 0) {
    updateDeviceList();
  }, []);

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
