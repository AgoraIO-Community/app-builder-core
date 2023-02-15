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
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from 'react';
import {ClientRole} from '../../agora-rn-uikit';
import DeviceContext from './DeviceContext';
import AgoraRTC, {DeviceInfo} from 'agora-rtc-sdk-ng';
import {useRtc, PrimaryButton} from 'customization-api';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';
import {StyleSheet, Text} from 'react-native';
import CustomIcon from '../atoms/CustomIcon';
import StorageContext from './StorageContext';

import type RtcEngine from '../../bridge/rtc/webNg/';
import ColorContext from './ColorContext';

const log = (...args) => {
  console.log('[DeviceConfigure] ', ...args);
};

type WebRtcEngineInstance = InstanceType<typeof RtcEngine>;

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

  const {primaryColor} = useContext(ColorContext);
  const {store, setStore} = useContext(StorageContext);
  const {rememberedDevicesList, activeDeviceId} = store;

  const isChrome = useMemo(() => {
    return (
      deviceList.filter((device) => device.deviceId === 'default').length > 0
    );
  }, [deviceList]);

  // const rememberedDevicesList = useRef<
  //   Record<MediaDeviceInfo['kind'], savedDeviceInfo[]>
  // >({
  //   audioinput: [],
  //   videoinput: [],
  //   audiooutput: [],
  // });

  const updateActiveDeviceId = (
    kind: MediaDeviceInfo['kind'],
    deviceId: string,
  ) => {
    // const {kind, deviceId} = device;

    setStore((prevState) => ({
      ...prevState,
      activeDeviceId: {
        ...activeDeviceId,
        [kind]: deviceId,
      },
    }));
  };

  const updateRememberedDeviceList = (
    device: MediaDeviceInfo,
    switchOnConnect: boolean,
  ) => {
    const {kind} = device;
    // rememberedDevicesList.current[kind].push({...device, switchOnConnect});
    // window.localStorage.setItem(
    //   'rememberedDevicesList',
    //   JSON.stringify(rememberedDevicesList.current),
    // );
    setStore((prevState) => ({
      ...prevState,
      rememberedDevicesList: {
        ...prevState.rememberedDevicesList,
        [kind]: {
          [device.deviceId]: switchOnConnect
            ? 'switch-on-connect'
            : 'ignore-on-connect',
          ...prevState.rememberedDevicesList[kind],
        },
      },
    }));
  };

  const {RtcEngine} = rtc as unknown as {RtcEngine: WebRtcEngineInstance};
  const {localStream} = RtcEngine;

  const refreshDeviceList = useCallback(async () => {
    let updatedDeviceList: MediaDeviceInfo[];
    await RtcEngine.getDevices(function (devices: deviceInfo[]) {
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

      updatedDeviceList = devices.filter(
        (device: deviceInfo) =>
          // device?.deviceId !== 'default' &&
          device?.deviceId !== '' &&
          (device.kind == 'audioinput' ||
            device.kind == 'videoinput' ||
            device.kind == 'audiooutput'),
      );

      log('Setting unique devices', updatedDeviceList);
      setDeviceList(updatedDeviceList);
    });

    return updatedDeviceList;
  }, []);

  const getAgoraTrackDeviceId = (type: 'audio' | 'video') => {
    const mutedState =
      //@ts-ignore
      type === 'audio' ? !RtcEngine.isAudioEnabled : !RtcEngine.isVideoEnabled;

    let currentDevice: string;

    if (mutedState) {
      currentDevice =
        //@ts-ignore
        type === 'audio' ? RtcEngine.audioDeviceId : RtcEngine.videoDeviceId;
      log(`Agora ${type} Engine is using`, currentDevice);
    } else {
      currentDevice = localStream[type]
        ?.getMediaStreamTrack()
        .getSettings().deviceId;
      log(`Agora ${type} Track is using`, currentDevice);
    }
    return currentDevice ?? '';
  };

  /**
   * Retrieves the devices being used by agora tracks and
   * updates the selected Ui states with them.
   * Ignores for audioOutput since state acts as ground
   * truth.
   */
  const syncSelectedDeviceUi = (kind?: deviceKind) => {
    log('Refreshing', kind ?? 'all');
    switch (kind) {
      case 'audioinput':
        setUiSelectedMic(getAgoraTrackDeviceId('audio'));
        break;
      case 'videoinput':
        setUiSelectedCam(getAgoraTrackDeviceId('video'));
        break;
      case 'audiooutput':
        break;
      default:
        setUiSelectedMic(getAgoraTrackDeviceId('audio'));
        setUiSelectedCam(getAgoraTrackDeviceId('video'));
    }
  };

  /**
   * Sets the devices to the default device on chrome or
   * the first item on the devices list on other browsers
   * optionally takes device list to use that instead
   * of state which might be stale
   */
  const fallbackToDefaultDevice = (
    kind: deviceKind,
    uniqueDevices?: MediaDeviceInfo[],
  ) => {
    const deviceListLocal = uniqueDevices || deviceList;
    switch (kind) {
      case 'audioinput':
        const audioInputFallbackDeviceId = deviceListLocal.find(
          (device) =>
            device.kind === 'audioinput' &&
            (isChrome ? device.deviceId === 'default' : true),
        )?.deviceId;
        setSelectedMic(audioInputFallbackDeviceId);
        break;
      case 'videoinput':
        const videoInputFallbackDeviceId = deviceListLocal.find(
          (device) => device.kind === 'videoinput',
        )?.deviceId;
        setSelectedCam(videoInputFallbackDeviceId);
        break;
      case 'audiooutput':
        const audioOutputFallbackDeviceId = deviceListLocal.find(
          (device) =>
            device.kind === 'audiooutput' &&
            (isChrome ? device.deviceId === 'default' : true),
        )?.deviceId;

        setSelectedSpeaker(audioOutputFallbackDeviceId);
        break;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      navigator.mediaDevices.enumerateDevices();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Labels are empty in firefox when permission is granted first time
    // refresh device list if labels are empty

    const logTag = 'useEffect[rtc,store]';

    if (activeDeviceId) {
      // If stream exists and selected devices are empty, check for devices again
      if (!selectedCam || selectedCam.trim().length == 0) {
        log(logTag, 'cam: Device list populated but No selected cam');
        const currentVideoDevice = getAgoraTrackDeviceId('video');
        const {videoinput: storedVideoInput} = activeDeviceId;

        if (
          storedVideoInput &&
          currentVideoDevice &&
          currentVideoDevice !== storedVideoInput &&
          deviceList.find((device) => device.deviceId === storedVideoInput)
        ) {
          log(logTag, 'cam: Setting cam to active id', storedVideoInput);
          setSelectedCam(storedVideoInput);
        } else {
          setUiSelectedCam(currentVideoDevice);
        }
      }

      if (!selectedMic || selectedMic.trim().length == 0) {
        log(logTag, 'mic: Device list populated but No selected mic');
        const currentAudioDevice = getAgoraTrackDeviceId('audio');
        const {audioinput: storedAudioInput} = activeDeviceId;

        if (
          storedAudioInput &&
          currentAudioDevice &&
          currentAudioDevice !== storedAudioInput &&
          deviceList.find((device) => device.deviceId === storedAudioInput)
        ) {
          log(logTag, 'mic: Setting mic to active id', storedAudioInput);
          setSelectedMic(storedAudioInput);
        } else {
          setUiSelectedMic(currentAudioDevice);
        }
      }

      if (!selectedSpeaker || selectedSpeaker.trim().length == 0) {
        log(logTag, 'speaker: Device list populated but No selected speaker');
        const {audiooutput: storedAudioOutput} = activeDeviceId;
        const defaultSpeaker = deviceList.find(
          (device) =>
            device.deviceId === 'default' &&
            (isChrome ? device.deviceId === 'default' : true),
        )?.deviceId;

        if (
          defaultSpeaker &&
          storedAudioOutput &&
          defaultSpeaker !== storedAudioOutput &&
          deviceList.find((device) => device.deviceId === storedAudioOutput)
        ) {
          log(
            logTag,
            'speaker: Setting speaker to active id',
            storedAudioOutput,
          );
          setSelectedSpeaker(storedAudioOutput);
        } else {
          setUiSelectedSpeaker(defaultSpeaker);
        }
      }
    }

    if (
      deviceList.length === 0 ||
      deviceList.find((device: MediaDeviceInfo) => device.label === '')
    ) {
      log(logTag, 'Empty device list');
      refreshDeviceList();
    }
  }, [rtc, store]);

  const commonOnChangedEvent = async (changedDeviceData: DeviceInfo) => {
    // Extracted devicelist because we want to perform fallback with
    // the most current version.
    const previousDeviceList = deviceList;
    const updatedDeviceList = await refreshDeviceList();
    const changedDevice = changedDeviceData.device;

    const {logTag, currentDevice, setCurrentDevice} = {
      audioinput: {
        logTag: 'mic: on-microphone-changed',
        currentDevice: selectedMic,
        setCurrentDevice: setSelectedMic,
      },
      audiooutput: {
        logTag: 'speaker: on-speaker-changed',
        currentDevice: selectedSpeaker,
        setCurrentDevice: setSelectedSpeaker,
      },
      videoinput: {
        logTag: 'cam: on-camera-changed',
        currentDevice: selectedCam,
        setCurrentDevice: setSelectedCam,
      },
    }[changedDevice.kind];

    log(logTag, changedDeviceData);

    if (currentDevice === 'default') {
      // const previousDefaultDevice = previousDeviceList.find(
      //   (device) => device.deviceId === 'default',
      // );
      // const currentDefaultDevice = updatedDeviceList.find(
      //   (device) => device.deviceId === 'default',
      // );
      //   log(logTag, 'current Default device', {
      //     changedDeviceData,
      //     previousDeviceList,
      //     updatedDeviceList,
      //     previousDefaultDevice,
      //     currentDefaultDevice,
      //   });
      // if (previousDefaultDevice.groupId !== currentDefaultDevice.groupId) {
      //   log(logTag, 'Default device changed', {
      //     changedDeviceData,
      //     previousDeviceList,
      //     updatedDeviceList,
      //     previousDefaultDevice,
      //     currentDefaultDevice,
      //   });
      //   setCurrentDevice('default');
      // }
      setCurrentDevice('default');
    }

    const didChangeDeviceExistBefore = previousDeviceList.find(
      (device) => device.deviceId === changedDevice.deviceId,
    )
      ? true
      : false;

    if (changedDeviceData.state === 'ACTIVE' && !didChangeDeviceExistBefore) {
      const rememberedDevice =
        rememberedDevicesList[changedDevice.kind][changedDevice.deviceId];

      if (!rememberedDevice) {
        showNewDeviceDetectedToast(changedDevice);
      } else {
        if (rememberedDevice === 'switch-on-connect') {
          setCurrentDevice(changedDevice.deviceId);
          return;
        }
      }
    } else if (changedDeviceData.state === 'INACTIVE') {
      if (changedDevice.deviceId === currentDevice) {
        fallbackToDefaultDevice(changedDevice.kind, updatedDeviceList);
        return;
      }
    }
  };

  // Port this to useEffectEvent(https://beta.reactjs.org/reference/react/useEffectEvent) when
  // released
  useEffect(() => {
    log('previous devicelist updated', deviceList);
    AgoraRTC.onMicrophoneChanged = commonOnChangedEvent;
  }, [selectedMic, deviceList]);

  useEffect(() => {
    AgoraRTC.onPlaybackDeviceChanged = commonOnChangedEvent;
  }, [selectedSpeaker, deviceList]);

  useEffect(() => {
    AgoraRTC.onCameraChanged = commonOnChangedEvent;
  }, [selectedCam, deviceList]);

  const setSelectedMic = (deviceId: deviceId) => {
    log('mic: setting to', deviceId);
    return new Promise((res, rej) => {
      RtcEngine.changeMic(
        deviceId,
        () => {
          syncSelectedDeviceUi('audioinput');
          updateActiveDeviceId('audioinput', deviceId);
          res();
        },
        (e: any) => {
          console.error('DeviceConfigure: Error setting mic', e);
          rej(e);
        },
      );
    });
  };

  const setSelectedCam = (deviceId: deviceId) => {
    log('cam: setting  to', deviceId);
    return new Promise((res, rej) => {
      RtcEngine.changeCamera(
        deviceId,
        () => {
          syncSelectedDeviceUi('videoinput');
          updateActiveDeviceId('videoinput', deviceId);
          res();
        },
        (e: any) => {
          console.error('Device Configure: Error setting webcam', e);
          rej(e);
        },
      );
    });
  };

  const setSelectedSpeaker = (deviceId: deviceId) => {
    log('speaker: setting to', deviceId);
    return new Promise((res, rej) => {
      RtcEngine.changeSpeaker(
        deviceId,
        () => {
          setUiSelectedSpeaker(deviceId);
          updateActiveDeviceId('audiooutput', deviceId);
          res();
        },
        (e: any) => {
          console.error('Device Configure: Error setting speaker', e);
          rej(selectedSpeaker);
        },
      );
    });
  };

  const showNewDeviceDetectedToast = (device: MediaDeviceInfo) => {
    const {name, setAction} = {
      audioinput: {
        name: 'mic',
        setAction: setSelectedMic,
      },
      videoinput: {
        name: 'webcam',
        setAction: setSelectedCam,
      },
      audiooutput: {
        name: 'speaker',
        setAction: setSelectedSpeaker,
      },
    }[device.kind];

    Toast.show({
      type: 'checked',
      // leadingIcon: <CustomIcon name={'mic-on'} />,
      text1: `New ${name} detected`,
      // @ts-ignore
      text2: (
        <Text>
          <Text>New {name} named </Text>
          <Text style={{fontWeight: 'bold'}}>{device.label}</Text>
          <Text> detected. Do you want to switch?</Text>
        </Text>
      ),
      visibilityTime: 6000,
      checkbox: {
        disabled: false,
        color: primaryColor,
        text: 'Remember my choice',
      },
      primaryBtn: {
        text: 'SWITCH DEVICE',
        onPress: (checked: boolean) => {
          setAction(device.deviceId);
          checked && updateRememberedDeviceList(device, true);
          Toast.hide();
        },
      },
      secondaryBtn: {
        text: 'IGNORE',
        onPress: (checked: boolean) => {
          checked && updateRememberedDeviceList(device, false);
          Toast.hide();
        },
      },
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
