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
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {ClientRole} from '../../agora-rn-uikit';
import DeviceContext from './DeviceContext';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useRtc} from 'customization-api';

const log = (...args) => {
  console.log('[DeviceConfigure] ', ...args);
};

interface Props {
  userRole: ClientRole;
}
type deviceInfo = MediaDeviceInfo;
type deviceId = deviceInfo['deviceId'];
type deviceKind = deviceInfo['kind'];

const DeviceConfigure: React.FC<Props> = (props: any) => {
  const rtc = useRtc();
  const [selectedCam, setUiSelectedCam] = useState('');
  const [selectedMic, setUiSelectedMic] = useState('');
  const [selectedSpeaker, setUiSelectedSpeaker] = useState('');
  const [deviceList, setDeviceList] = useState<deviceInfo[]>([]);

  const [
    audioOutputFallbackDeviceId,
    audioInputFallbackDeviceId,
    videoInputFallbackDeviceId,
  ] = useMemo(() => {
    return [
      deviceList.find((device) => device.kind === 'audiooutput')?.deviceId,
      deviceList.find((device) => device.kind === 'audioinput')?.deviceId,
      deviceList.find((device) => device.kind === 'videoinput')?.deviceId,
    ];
  }, [deviceList]);

  const getAgoraTrackDeviceId = (type: 'audio' | 'video') => {
    //@ts-ignore
    const currentDevice = rtc.RtcEngine.localStream[type]
      ?.getMediaStreamTrack()
      .getSettings().deviceId;
    log(
      `Agora ${type} Track is using`,
      deviceList.find((d) => d.deviceId === currentDevice),
      currentDevice,
    );
    return currentDevice;
  };

  const refreshSelectedDevice = (kind?: deviceKind) => {
    log('Refreshing', kind ?? 'all');
    switch (kind) {
      case 'audioinput':
        setUiSelectedMic(getAgoraTrackDeviceId('audio'));
        break;
      case 'audiooutput':
        setUiSelectedSpeaker(audioOutputFallbackDeviceId);
        break;
      case 'videoinput':
        setUiSelectedCam(getAgoraTrackDeviceId('video'));
        break;
      default:
        setUiSelectedMic(getAgoraTrackDeviceId('audio'));
        setUiSelectedSpeaker(audioOutputFallbackDeviceId);
        setUiSelectedCam(getAgoraTrackDeviceId('video'));
    }
  };

  const refreshDevices = useCallback(async () => {
    //@ts-ignore
    rtc.RtcEngine.getDevices(function (devices: deviceInfo[]) {
      log('Fetching all devices: ', devices);
      /**
       * Some browsers list the same microphone twice with different Id's,
       * their group Id's match as they are the same physical device.
       * deviceId == default is an oddity in chrome which stores the user
       * preference
       */
      /**
       *  1. Fetch devices and filter so the deviceId with empty
       *     values are exluded
       *  2. Store only unique devices with unique groupIds
       */

      const uniqueDevices = devices.filter(
        (device: deviceInfo) =>
          // device?.deviceId !== 'default' &&
          device?.deviceId !== '' &&
          (device.kind == 'audioinput' ||
            device.kind == 'videoinput' ||
            device.kind == 'audiooutput'),
      );

      log('Setting unique devices', uniqueDevices);
      setDeviceList(uniqueDevices);
    });
  }, []);

  useEffect(() => {
    refreshSelectedDevice();
  }, [deviceList]);

  // Port this to useEffectEvent(https://beta.reactjs.org/reference/react/useEffectEvent) when
  // released
  useEffect(() => {
    AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
      log(
        `mic: on-microphone-changed from ${selectedMic}`,
        changedDevice.device.label,
        changedDevice.state,
        changedDevice,
      );
      refreshDevices();
      if (
        changedDevice.device.deviceId === selectedMic &&
        changedDevice.state === 'INACTIVE'
      ) {
        setSelectedMic(audioInputFallbackDeviceId);
      }
      if (selectedMic === 'default') {
        setSelectedMic('default');
      }
    };
  }, [selectedMic]);

  useEffect(() => {
    AgoraRTC.onPlaybackDeviceChanged = async (changedDevice) => {
      log(
        `speaker: on-playback-changed from ${selectedSpeaker}`,
        changedDevice.device.label,
        changedDevice.state,
        changedDevice,
      );
      refreshDevices();
      if (
        changedDevice.device.deviceId === selectedMic &&
        changedDevice.state === 'INACTIVE'
      ) {
        setSelectedSpeaker(audioOutputFallbackDeviceId);
      }
      if (selectedMic === 'default') {
        setSelectedSpeaker('default');
      }
    };
  }, [selectedSpeaker]);

  useEffect(() => {
    AgoraRTC.onCameraChanged = async (changedDevice) => {
      log('cam: on-camera-changed');
      refreshDevices();
      if (
        changedDevice.device.deviceId === selectedCam &&
        changedDevice.state === 'INACTIVE'
      ) {
        setSelectedCam(videoInputFallbackDeviceId);
      }
    };
  }, [selectedCam]);

  useEffect(() => {
    // window.gd = () => getAgoraTrackDeviceId('audio');
    // If stream exists and selected devices are empty, check for devices again
    if (!selectedCam || selectedCam.trim().length == 0) {
      log('No selected cam');
      refreshSelectedDevice('videoinput');
    }

    if (!selectedMic || selectedMic.trim().length == 0) {
      log('No selected mic');
      refreshSelectedDevice('audioinput');
    }

    if (!selectedSpeaker || selectedSpeaker.trim().length == 0) {
      log('No selected speaker');
      refreshSelectedDevice('audiooutput');
    }

    // Labels are empty in firefox when permission is granted first time
    // refresh device list if labels are empty
    if (
      deviceList.length === 0 ||
      deviceList.find((device: MediaDeviceInfo) => device.label === '')
      // [selectedMic, selectedSpeaker, selectedCam].filter(
      //   (deviceId) => !Boolean(deviceId),
      // ).length > 0
    ) {
      log('Empty device list');
      refreshDevices();
    }
  }, [rtc]);

  const setSelectedMic = (deviceId: deviceId) => {
    log('Setting mic to', deviceId);
    return new Promise((res, rej) => {
      //@ts-ignore
      rtc.RtcEngine.changeMic(
        deviceId,
        () => {
          const currentMic = getAgoraTrackDeviceId('audio');
          setUiSelectedMic(currentMic);
          res(currentMic);
        },
        (e: any) => {
          console.error('DeviceConfigure: Error setting mic', e);
          rej(getAgoraTrackDeviceId('audio'));
        },
      );
    });
  };

  const setSelectedCam = (deviceId: deviceId) => {
    return new Promise((res, rej) => {
      //@ts-ignore
      rtc.RtcEngine.changeCamera(
        deviceId,
        () => {
          const currentCam = getAgoraTrackDeviceId('video');
          setUiSelectedCam(currentCam);
          res(currentCam);
        },
        (e: any) => {
          console.error('Device Configure: Error setting webcam', e);
          rej(getAgoraTrackDeviceId('audio'));
        },
      );
    });
  };

  const setSelectedSpeaker = (deviceId: deviceId) => {
    return new Promise((res, rej) => {
      //@ts-ignore
      rtc.RtcEngine.changeSpeaker(
        deviceId,
        () => {
          setUiSelectedSpeaker(deviceId);
          res(deviceId);
        },
        (e: any) => {
          console.error('Device Configure: Error setting speaker', e);
          rej(selectedSpeaker);
        },
      );
    });
  };

  return (
    <DeviceContext.Provider
      value={{
        selectedCam,
        setSelectedCam,
        selectedMic,
        setSelectedMic,
        selectedSpeaker,
        setSelectedSpeaker,
        deviceList,
        setDeviceList,
      }}>
      {props.children}
    </DeviceContext.Provider>
  );
};

export default DeviceConfigure;
