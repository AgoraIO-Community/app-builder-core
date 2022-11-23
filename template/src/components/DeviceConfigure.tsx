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
/**
 * JOINING THE CALL
 * 1. User logs in, opens device panel
 * 2. User storage is checked for previous Selected Mic and Selected Cam
 * 3. If deviceExist in storage
 *   a. Check if the stored devices are present in deviceList
 *    - If Yes, use this devices
 *    - If No, take the first device from deviceList (dont store this in user storage yet, as this was automatically preferred)
 * 4. During the call if user themselves selects a device from the dropdown, store that in memory
 * DURING THE CALL
 * 1. When a new device is added, the list is updated
 * 2. When a device is removed, the list is updated
 * 3. Whenever the deviceList is changed as result of a device being added or removed
 *   a. Check if the current active device still exists in the updated list
 *     - If yes, continue using it
 *     - If not, take the first active device in deviceList (dont store this in user storage yet, as this was automatically preferred)
 * NOTE
 * Whenever the deviceList is changed, first check in stored user preference, if the devices stored in user-preference is not found or
 * is not active then only set the first available devices from devicelList
 */
import React, {useState, useContext, useEffect, useCallback} from 'react';
import {RtcContext, ClientRole} from '../../agora-rn-uikit';
import DeviceContext from './DeviceContext';
import StorageContext from '../components/StorageContext';
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
  const [deviceList, setDeviceList] = useState<any>([]);
  const {store, setStore} = useContext(StorageContext);
  const rtc = useRtc();
  const [userPreferredMic, setUserPreferredMic] = React.useState(
    () => store?.lastActiveMic || '',
  );
  const [userPreferredCamera, setUserPreferredCamera] = React.useState(
    () => store?.lastActiveCam || '',
  );

  const deviceExists = (dvId: string) => {
    const response = deviceList.find(
      (device: deviceInfo) => device.deviceId == dvId,
    );
    return response;
  };

  // 1. Fetch all available devices
  const refreshDevices = useCallback(async () => {
    rtc.RtcEngine.getDevices(function (devices: deviceInfo[]) {
      console.log('DeviceTesting: fetching all devices: ', devices);
      /**
       * Some browsers list the same microphone twice with different Id's,
       * their group Id's match as they are the same physical device.
       * deviceId == default is an oddity in chrome which stores the user
       * preference
       * The device Ids are empty when permissions are not given
       * Check browserrs audioInput
       *
       */
      /**
       *  1. Fetch devices and filter so the deviceId with default or empty
       *     values are exluded for both audio and video devices. Also exclude
       *     output devices. ex: Mac speakers are of type audiooutput(device.kind)
       *  2. Store only unique devices with unique groupIds
       */

      const uniqueDevices = devices.filter(
        (device: deviceInfo) =>
          device?.deviceId !== 'default' &&
          device?.deviceId !== '' &&
          (device.kind == 'audioinput' || device.kind == 'videoinput'),
      );
      setDeviceList(uniqueDevices);
    });
  }, []);

  // 2. Register listeners for new devices being added or removed through the call
  useEffect(() => {
    AgoraRTC.onMicrophoneChanged = async (changedDevice: changedDeviceInfo) => {
      // When new audio device is plugged in ,refresh the devices list.
      console.log('DeviceTesting: on-microphone-changed', changedDevice);
      if (changedDevice && changedDevice.state === 'ACTIVE') {
        console.log('DeviceTesting: mic added');
        setDeviceList((prevState: deviceInfo[]) => [
          ...prevState,
          changedDevice.device,
        ]);
      }
      if (changedDevice && changedDevice.state === 'INACTIVE') {
        console.log('DeviceTesting: mic removed');
        setDeviceList((devices: deviceInfo[]) =>
          devices.filter(
            (device: deviceInfo) =>
              device.deviceId !== changedDevice?.device?.deviceId,
          ),
        );
      }
    };
    AgoraRTC.onCameraChanged = async (changedDevice: changedDeviceInfo) => {
      // When new video device is plugged in ,refresh the devices list.
      console.log('DeviceTesting: on-camera-changed', changedDevice);
      if (changedDevice && changedDevice.state === 'ACTIVE') {
        console.log('DeviceTesting: camera added');
        setDeviceList((prevState: deviceInfo[]) => [
          ...prevState,
          changedDevice.device,
        ]);
      }
      if (changedDevice && changedDevice.state === 'INACTIVE') {
        console.log('DeviceTesting: camera removed');
        setDeviceList((devices: deviceInfo[]) =>
          devices.filter(
            (device: deviceInfo) =>
              device.deviceId !== changedDevice?.device?.deviceId,
          ),
        );
      }
    };
  }, []);

  // 3. Update the selected mic and camera when devicelist changes
  useEffect(() => {
    console.log('DeviceTesting: Devicelist updated', deviceList);
    // 3.a If selectedMic exist and still active
    if (selectedMic && deviceExists(selectedMic)) {
      console.log('DeviceTesting:MIC using the current device');
    } else if (userPreferredMic && deviceExists(userPreferredMic)) {
      // 3.b If user prefered device exists and is still valid use the device
      console.log('DeviceTesting:MIC current device removed. Using preferred');
      setSelectedMic(userPreferredMic);
    } else {
      for (const i in deviceList) {
        if (deviceList[i].kind === 'audioinput') {
          console.log('DeviceTesting:MIC set auto selected device');
          setSelectedMic(deviceList[i].deviceId);
          break;
        }
      }
    }

    if (selectedCam && deviceExists(selectedCam)) {
      console.log('DeviceTesting:CAM using the current device');
    } else if (userPreferredCamera && deviceExists(userPreferredCamera)) {
      console.log('DeviceTesting:CAM current device removed. Using preferred');
      setSelectedCam(userPreferredCamera);
    } else if (!selectedCam || selectedCam.trim().length == 0) {
      for (const i in deviceList) {
        if (deviceList[i].kind === 'videoinput') {
          console.log('DeviceTesting:CAM set auto selected device');
          setSelectedCam(deviceList[i].deviceId);
          break;
        }
      }
    }
  }, [deviceList]);

  /**
   * Whenever userPreferred mic or camera changes update
   * the store and update the selected mic or camera
   */
  useEffect(() => {
    if (!userPreferredCamera) return;
    console.log('DeviceTesting: userPreferredCamera changed');
    setStore &&
      setStore((store) => ({...store, lastActiveCam: userPreferredCamera}));
    userPreferredCamera && setSelectedCam(userPreferredCamera);
  }, [userPreferredCamera]);

  useEffect(() => {
    if (!userPreferredMic) return;
    console.log('DeviceTesting: userPreferredMic changed');
    setStore &&
      setStore((store) => ({...store, lastActiveMic: userPreferredMic}));
    userPreferredMic && setSelectedMic(userPreferredMic);
  }, [userPreferredMic]);

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
    if (deviceList.length === 0) {
      refreshDevices();
    }
  }, [rtc]);

  return (
    <DeviceContext.Provider
      value={{
        selectedCam,
        selectedMic,
        deviceList,
        setDeviceList,
        setUserPreferredMic,
        setUserPreferredCamera,
      }}>
      {props.children}
    </DeviceContext.Provider>
  );
};

export default DeviceConfigure;
