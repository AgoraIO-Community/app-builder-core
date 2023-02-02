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
import AgoraRTC from 'agora-rtc-sdk-ng';
import {useRtc, PrimaryButton} from 'customization-api';
import Toast from '../../react-native-toast-message';
import TertiaryButton from '../atoms/TertiaryButton';
import {StyleSheet, Text} from 'react-native';
import CustomIcon from '../atoms/CustomIcon';
import StorageContext from './StorageContext';

import type RtcEngine from '../../bridge/rtc/webNg/';

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

  const {store, setStore} = useContext(StorageContext);
  const {rememberedDevicesList, activeDeviceId} = store;

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
   * Sets the devices to first item on the devices list
   * optionally takes device list to use that instead
   * of state which might be stale
   */
  const fallbackToFirstDevice = (
    kind: deviceKind,
    uniqueDevices?: MediaDeviceInfo[],
  ) => {
    const deviceListLocal = uniqueDevices || deviceList;
    switch (kind) {
      case 'audioinput':
        const audioInputFallbackDeviceId = deviceListLocal.find(
          (device) => device.kind === 'audioinput',
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
          (device) => device.kind === 'audiooutput',
        )?.deviceId;

        setSelectedSpeaker(audioOutputFallbackDeviceId);
        break;
    }
  };

  useEffect(() => {
    // Labels are empty in firefox when permission is granted first time
    // refresh device list if labels are empty

    const logTag = 'useEffect[rtc]';

    if (activeDeviceId && deviceList.length !== 0) {
      const {
        videoinput: storedVideoInput,
        audioinput: storedAudioInput,
        audiooutput: storedAudioOutput,
      } = activeDeviceId;

      // If stream exists and selected devices are empty, check for devices again
      if (!selectedCam || selectedCam.trim().length == 0) {
        log(logTag, 'Device list populated but No selected cam');
        const currentVideoDevice = getAgoraTrackDeviceId('video');
        if (
          currentVideoDevice &&
          storedVideoInput &&
          deviceList.find((device) => device.deviceId === storedVideoInput)
        ) {
          log(logTag, 'Setting cam to active id', storedVideoInput);
          setSelectedCam(storedVideoInput);
        } else {
          setUiSelectedCam(currentVideoDevice);
        }
      }

      if (!selectedMic || selectedMic.trim().length == 0) {
        log(logTag, 'Device list populated but No selected mic');
        const currentAudioDevice = getAgoraTrackDeviceId('audio');
        if (
          currentAudioDevice &&
          storedAudioInput &&
          deviceList.find((device) => device.deviceId === storedAudioInput)
        ) {
          log(logTag, 'Setting mic to active id', storedAudioInput);
          setSelectedMic(storedAudioInput);
        } else {
          setUiSelectedMic(currentAudioDevice);
        }
      }

      if (!selectedSpeaker || selectedSpeaker.trim().length == 0) {
        log(logTag, 'Device list populated but No selected speaker');
        // Initializes ui with first speaker in device list
        if (
          storedAudioInput &&
          deviceList.find((device) => device.deviceId === storedAudioOutput)
        ) {
          setSelectedSpeaker(storedAudioOutput);
        } else {
          log(logTag, 'Setting speaker to active id', storedAudioOutput);
          setUiSelectedSpeaker(
            deviceList.find((device) => device.kind === 'audiooutput')
              ?.deviceId,
          );
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

  // Port this to useEffectEvent(https://beta.reactjs.org/reference/react/useEffectEvent) when
  // released
  useEffect(() => {
    AgoraRTC.onMicrophoneChanged = async (changedDeviceData) => {
      // Extracted because we want to perform fallback with the latest
      // device list, state update will be handled with next render
      const updatedDeviceList = await refreshDeviceList();
      const changedDevice = changedDeviceData.device;
      log(
        `mic: on-microphone-changed from ${selectedMic}`,
        changedDevice.label,
        changedDeviceData.state,
        changedDeviceData,
      );

      if (changedDeviceData.state === 'ACTIVE') {
        const rememberedDevice =
          rememberedDevicesList[changedDevice.kind][changedDevice.deviceId];
        if (!rememberedDevice) {
        } else {
          if (rememberedDevice === 'switch-on-connect') {
            setSelectedMic(changedDevice.deviceId);
          }
        }
      } else {
        if (changedDevice.deviceId === selectedMic) {
          fallbackToFirstDevice('audioinput', updatedDeviceList);
        }
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
      const updatedDeviceList = await refreshDeviceList();
      if (
        changedDevice.device.deviceId === selectedMic &&
        changedDevice.state === 'INACTIVE'
      ) {
        fallbackToFirstDevice('audiooutput', updatedDeviceList);
      }
      if (selectedMic === 'default') {
        setSelectedSpeaker('default');
      }
    };
  }, [selectedSpeaker]);

  useEffect(() => {
    AgoraRTC.onCameraChanged = async (changedDevice) => {
      log('cam: on-camera-changed');
      const updatedDeviceList = await refreshDeviceList();
      if (
        changedDevice.device.deviceId === selectedCam &&
        changedDevice.state === 'INACTIVE'
      ) {
        fallbackToFirstDevice('videoinput', updatedDeviceList);
      }
    };
  }, [selectedCam]);

  const setSelectedMic = (deviceId: deviceId) => {
    log('Setting mic to', deviceId);
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
    log('Setting cam to', deviceId);
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
    log('Setting speaker to', deviceId);
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
    const deviceTypeData = {
      audioinput: {
        name: 'mic',
        setAction: setSelectedMic,
      },
      videoinput: {
        name: 'webcam',
        setAction: setSelectedCam,
      },
      audiooutput: {
        name: 'mic',
        setAction: setSelectedSpeaker,
      },
    }[device.kind];

    Toast.show({
      type: 'info',
      // leadingIcon: <CustomIcon name={'mic-on'} />,
      text1: 'New mic detected',
      // @ts-ignore
      text2: (
        <Text>
          <Text>New {deviceTypeData.name} named </Text>
          <Text style={{fontWeight: 'bold'}}>{device.label}</Text>
          <Text> detected. Do you want to switch</Text>
        </Text>
      ),
      // text2: `New mic named ${
      //   updatedDeviceList.find(
      //     (device) => device.deviceId === changedDevice.device.deviceId,
      //   ).label
      // } detected. Do you want to switch`,
      visibilityTime: 6000,
      primaryBtn: (
        <>
          <PrimaryButton
            containerStyle={style.primaryBtn}
            textStyle={{fontWeight: '600', fontSize: 16, paddingLeft: 0}}
            text="SWITCH DEVICE"
            onPress={() => {
              deviceTypeData.setAction(device.deviceId);
              Toast.hide();
            }}
          />
          <PrimaryButton
            containerStyle={style.primaryBtn}
            textStyle={{fontWeight: '600', fontSize: 16, paddingLeft: 0}}
            text="SWITCH DEVICE REM"
            onPress={() => {
              deviceTypeData.setAction(device.deviceId);
              updateRememberedDeviceList(device, true);
              Toast.hide();
            }}
          />
        </>
      ),
      secondaryBtn: (
        <>
          <TertiaryButton
            containerStyle={style.secondaryBtn}
            text="IGNORE"
            onPress={() => {
              Toast.hide();
            }}
          />
          <TertiaryButton
            containerStyle={style.secondaryBtn}
            text="IGNORE REM"
            onPress={() => {
              updateRememberedDeviceList(device, false);
              Toast.hide();
            }}
          />
        </>
      ),
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

const style = StyleSheet.create({
  secondaryBtn: {marginLeft: 16, height: 40, paddingVertical: 0},
  primaryBtn: {
    maxWidth: 150,
    minWidth: 150,
    height: 40,
    borderRadius: 4,
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  primaryBtnText: {
    fontWeight: '600',
    fontSize: 16,
    paddingLeft: 0,
  },
});

export default DeviceConfigure;
