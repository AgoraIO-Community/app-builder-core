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
import React, {useContext, useEffect, useState, useMemo} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  PropsContext,
  ClientRole,
  LocalContext,
  PermissionState,
  LocalUserContext,
} from '../../agora-rn-uikit';
import DeviceContext from '../components/DeviceContext';
import ColorContext from '../components/ColorContext';
import {useString} from '../utils/useString';
import Spacer from '../atoms/Spacer';
import Dropdown from '../atoms/Dropdown';
import {usePreCall} from '../components/precall/usePreCall';
import ThemeConfig from '../theme';
import {randomNameGenerator} from '../utils';
import pendingStateUpdateHelper from '../utils/pendingStateUpdateHelper';
import InlineNotification from '../atoms/InlineNotification';
import {
  settingsPanelCameraLabel,
  settingsPanelLiveStreamingAttendeeInfo,
  settingsPanelMicrophoneLabel,
  settingsPanelNoCameraDetectedText,
  settingsPanelNoCameraSelectedText,
  settingsPanelNoMicrophoneDetectedText,
  settingsPanelNoMicrophoneSelectedText,
  settingsPanelNoSpeakerDetectedText,
  settingsPanelSpeakerLabel,
  settingsPanelSystemDefaultSpeakerText,
  settingsPanelUpdatingText,
} from '../language/default-labels/precallScreenLabels';
import {LogSource, logger} from '../logger/AppBuilderLogger';
// import {dropdown} from '../../theme.json';

/*
 * Chrome sometimes doesn't apply the "Default" prefix hence
 * Checks if the deviceId is default and adds "Default - " to label
 * string if not already present to differentiate from actual
 * device entry.
 */
const applyDefaultPrefixConditionally = (device: MediaDeviceInfo) => {
  const {label, deviceId} = device;
  if (deviceId === 'default') {
    return label.includes('Default') ? label : 'Default - ' + label;
  }
  return label;
};

/**
 * A component to diplay a dropdown and select a device.
 * It will add the selected device to the device context.
 */
const useSelectDevice = (): [boolean, string] => {
  const {rtcProps} = useContext(PropsContext);
  const {primaryColor} = useContext(ColorContext);
  const [btnTheme, setBtnTheme] = React.useState<string>(primaryColor);
  const [isPickerDisabled, setPickerDisabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    if ($config.EVENT_MODE && rtcProps.role === ClientRole.Audience) {
      logger.log(
        LogSource.Internals,
        'SELECT_DEVICE',
        'User is AUDIENCE and in Live mode - device picker is disabled',
      );
      setPickerDisabled(true);
      setBtnTheme('rgba(16, 16, 16, 0.3)');
    } else {
      logger.log(
        LogSource.Internals,
        'SELECT_DEVICE',
        'User is HOST - device picker is enabled',
      );
      setPickerDisabled(false);
      setBtnTheme(primaryColor);
    }
  }, [rtcProps?.role]);

  return [isPickerDisabled, btnTheme];
};

interface SelectVideoDeviceProps {
  render?: (
    selectedCam: string,
    setSelectedCam: (cam: string) => void,
    deviceList: MediaDeviceInfo[],
    isDisabled: boolean,
  ) => JSX.Element;
  isIconDropdown?: boolean;
}

const SelectVideoDevice = (props: SelectVideoDeviceProps) => {
  const {selectedCam, setSelectedCam, deviceList} = useContext(DeviceContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  const [isFocussed, setIsFocussed] = React.useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(isPickerDisabled);
  const local = useContext(LocalContext);

  const data = useMemo(() => {
    return deviceList
      .filter(device => {
        if (device.kind === 'videoinput') {
          return true;
        }
      })
      ?.map((device: any) => {
        if (device.kind === 'videoinput') {
          return {
            label: device.label,
            value: device.deviceId,
          };
        }
      });
  }, [deviceList]);

  useEffect(() => {
    const selectedDeviceExists = Boolean(
      data.find(device => device.value === selectedCam),
    );
    if (isPendingUpdate) {
      selectedDeviceExists && setIsPendingUpdate(false);
    } else {
      !selectedDeviceExists && data?.length && setIsPendingUpdate(true);
    }
  }, [selectedCam, data]);

  const isPermissionGranted =
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY;

  const cameraLabel = useString(settingsPanelCameraLabel)();
  const noCameraLabel = useString(settingsPanelNoCameraDetectedText)();
  const noCameraSelectedLabel = useString(settingsPanelNoCameraSelectedText)();
  const updateLabel = useString(settingsPanelUpdatingText)();
  return props?.render ? (
    props.render(selectedCam, setSelectedCam, deviceList, isPickerDisabled)
  ) : (
    <>
      <Text style={style.label}>{cameraLabel}</Text>
      <Dropdown
        icon={
          isPendingUpdate && isPermissionGranted
            ? 'connection-loading'
            : props?.isIconDropdown
            ? 'video-on'
            : undefined
        }
        enabled={!isPickerDisabled}
        label={
          !isPermissionGranted || !data || !data.length
            ? noCameraLabel
            : isPendingUpdate
            ? updateLabel
            : noCameraSelectedLabel
        }
        data={isPermissionGranted ? data : []}
        onSelect={({label, value}) => {
          setIsFocussed(true);
          try {
            logger.log(
              LogSource.Internals,
              'SELECT_DEVICE',
              `Trying to set camera - ${label} - ${value}`,
            );
            pendingStateUpdateHelper(
              async () => await setSelectedCam(value),
              setIsPendingUpdate,
            );
            logger.log(
              LogSource.Internals,
              'SELECT_DEVICE',
              `Camera set - ${value}`,
            );
          } catch (e) {
            logger.error(
              LogSource.Internals,
              'SELECT_DEVICE',
              `There was an error setting camera - ${value}`,
              {
                data: value,
                error: e,
              },
            );
            setIsPendingUpdate(false);
          }
        }}
        selectedValue={selectedCam}
      />
    </>
  );
};

interface SelectAudioDeviceProps {
  render?: (
    selectedMic: string,
    setSelectedMic: (mic: string) => void,
    deviceList: MediaDeviceInfo[],
    isDisabled: boolean,
  ) => JSX.Element;
  isIconDropdown?: boolean;
}

const SelectAudioDevice = (props: SelectAudioDeviceProps) => {
  const {selectedMic, setSelectedMic, deviceList} = useContext(DeviceContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  const [isFocussed, setIsFocussed] = useState(false);
  const local = useContext(LocalContext);
  const [isPendingUpdate, setIsPendingUpdate] = useState(isPickerDisabled);

  const data = useMemo(() => {
    return deviceList
      .filter(device => {
        if (device.kind === 'audioinput') {
          return true;
        }
      })
      ?.map((device: any) => {
        if (device.kind === 'audioinput') {
          return {
            label: applyDefaultPrefixConditionally(device),
            value: device.deviceId,
          };
        }
      });
  }, [deviceList]);

  useEffect(() => {
    const selectedDeviceExists = Boolean(
      data.find(device => device.value === selectedMic),
    );
    if (isPendingUpdate) {
      selectedDeviceExists && setIsPendingUpdate(false);
    } else {
      !selectedDeviceExists && data?.length && setIsPendingUpdate(true);
    }
  }, [selectedMic, data]);

  const isPermissionGranted =
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
    local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY;

  const microphoneLabel = useString(settingsPanelMicrophoneLabel)();
  const noMicrophoneDetectedLabel = useString(
    settingsPanelNoMicrophoneDetectedText,
  )();
  const updateLabel = useString(settingsPanelUpdatingText)();
  const noMicrophoneSelectedLabel = useString(
    settingsPanelNoMicrophoneSelectedText,
  )();
  return props?.render ? (
    props.render(selectedMic, setSelectedMic, deviceList, isPickerDisabled)
  ) : (
    <View>
      <Text style={style.label}>{microphoneLabel}</Text>
      <Dropdown
        icon={
          isPendingUpdate && isPermissionGranted
            ? 'connection-loading'
            : props?.isIconDropdown
            ? 'mic-on'
            : undefined
        }
        enabled={!isPickerDisabled && !isPendingUpdate}
        selectedValue={selectedMic}
        label={
          !isPermissionGranted || !data || !data.length
            ? noMicrophoneDetectedLabel
            : isPendingUpdate
            ? updateLabel
            : noMicrophoneSelectedLabel
        }
        data={isPermissionGranted ? data : []}
        onSelect={({label, value}) => {
          setIsFocussed(true);
          try {
            logger.log(
              LogSource.Internals,
              'SELECT_DEVICE',
              `Trying to set mic - ${label} - ${value}`,
            );
            pendingStateUpdateHelper(
              async () => await setSelectedMic(value),
              setIsPendingUpdate,
            );
            logger.log(
              LogSource.Internals,
              'SELECT_DEVICE',
              `Mic set - ${value}`,
            );
          } catch (e) {
            logger.error(
              LogSource.Internals,
              'SELECT_DEVICE',
              `There was an error setting mic - ${value}`,
              {
                data: value,
                error: e,
              },
            );
            setIsPendingUpdate(false);
          }
        }}
      />
    </View>
  );
};

interface SelectSpeakerDeviceProps {
  render?: (
    selectedSpeaker: string,
    setSelectedSpeaker: (speaker: string) => void,
    deviceList: MediaDeviceInfo[],
    isDisabled: boolean,
  ) => JSX.Element;
  isIconDropdown?: boolean;
}

const SelectSpeakerDevice = (props: SelectSpeakerDeviceProps) => {
  const {selectedSpeaker, setSelectedSpeaker, deviceList, isChrome} =
    useContext(DeviceContext);
  const local = useContext(LocalContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  const [isFocussed, setIsFocussed] = React.useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(isPickerDisabled);
  const newRandomDeviceId = randomNameGenerator(64).toUpperCase();

  const data = useMemo(() => {
    return deviceList
      .filter(device => {
        if (device.kind === 'audiooutput') {
          return true;
        }
      })
      ?.map(device => {
        if (device.kind === 'audiooutput') {
          return {
            label: applyDefaultPrefixConditionally(device),
            value: device.deviceId,
          };
        }
      });
  }, [deviceList]);

  useEffect(() => {
    const selectedDeviceExists = Boolean(
      data.find(device => device.value === selectedSpeaker),
    );
    if (isPendingUpdate) {
      selectedDeviceExists && setIsPendingUpdate(false);
    } else {
      !selectedDeviceExists && data?.length && setIsPendingUpdate(true);
    }
  }, [selectedSpeaker, data]);

  const speakerLabel = useString(settingsPanelSpeakerLabel)();
  const speakerDefaultLabel = useString(
    settingsPanelSystemDefaultSpeakerText,
  )();
  const noSpeakerLabel = useString(settingsPanelNoSpeakerDetectedText)();
  const updateLabel = useString(settingsPanelUpdatingText)();
  return props?.render ? (
    props.render(
      selectedSpeaker,
      setSelectedSpeaker,
      deviceList,
      isPickerDisabled,
    )
  ) : (
    <View>
      <Text style={style.label}>{speakerLabel}</Text>
      {(local.permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
        local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY) &&
      (!isChrome || !data || data.length === 0) ? (
        <Dropdown
          icon={props?.isIconDropdown ? 'speaker' : undefined}
          enabled={!isPickerDisabled}
          selectedValue={newRandomDeviceId}
          label={''}
          data={[
            {
              value: newRandomDeviceId,
              label: speakerDefaultLabel,
            },
          ]}
          onSelect={({label, value}) => {
            setIsFocussed(true);
            try {
              logger.log(
                LogSource.Internals,
                'SELECT_DEVICE',
                `Trying to set speaker - ${label} - ${value}`,
              );
              pendingStateUpdateHelper(
                async () => await setSelectedSpeaker(value),
                setIsPendingUpdate,
              );
              logger.log(
                LogSource.Internals,
                'SELECT_DEVICE',
                `Speaker set - ${value}`,
              );
            } catch (e) {
              logger.error(
                LogSource.Internals,
                'SELECT_DEVICE',
                `There was an error setting speaker - ${value}`,
                {
                  data: value,
                  error: e,
                },
              );
              setIsPendingUpdate(false);
            }
          }}
        />
      ) : (
        <Dropdown
          icon={
            isPendingUpdate
              ? 'connection-loading'
              : props?.isIconDropdown
              ? 'speaker'
              : undefined
          }
          enabled={data && data.length && !isPendingUpdate}
          selectedValue={selectedSpeaker}
          label={
            !data || !data.length
              ? noSpeakerLabel
              : isPendingUpdate
              ? updateLabel
              : ''
          }
          data={data}
          onSelect={({label, value}) => {
            setIsFocussed(true);
            setSelectedSpeaker(value);
          }}
        />
      )}
    </View>
  );
};

interface SelectDeviceProps {
  isIconDropdown?: boolean;
  isOnPrecall?: boolean;
}

const SelectDevice = (props: SelectDeviceProps) => {
  const [isPickerDisabled] = useSelectDevice();
  const {deviceList} = useContext(DeviceContext);
  const {setCameraAvailable, setMicAvailable, setSpeakerAvailable} =
    usePreCall();
  const {isOnPrecall} = props;
  const [audioDevices, videoDevices, speakerDevices] = useMemo(
    () =>
      deviceList.reduce(
        (prev, device) => {
          const [audioDevices, videoDevices, speakerDevices] = prev;
          if (device.kind === 'audioinput') {
            audioDevices.push(device);
          } else if (device.kind === 'videoinput') {
            videoDevices.push(device);
          } else if (device.kind === 'audiooutput') {
            speakerDevices.push(device);
          }

          return [audioDevices, videoDevices, speakerDevices];
        },
        [[], [], []] as any,
      ),
    [deviceList],
  );

  // const audioDevices =
  //     deviceList.filter((device) => {
  //       if (device.kind === 'audioinput') {
  //         return true;
  //       }
  //    });
  //
  // const videoDevices = deviceList.filter((device) => {
  //   if (device.kind === 'videoinput') {
  //     return true;
  //   }
  // });
  // const speakerDevices = deviceList.filter((device) => {
  //   if (device.kind === 'audiooutput') {
  //     return true;
  //   }
  // });

  useEffect(() => {
    const isDeviceAvailable = audioDevices && audioDevices.length;
    logger.log(LogSource.Internals, 'SELECT_DEVICE', 'audio devices changed', {
      data: {
        devices: [...audioDevices],
        isDeviceAvailable: isDeviceAvailable
          ? 'Yes, setting mic'
          : 'No audio devices available',
      },
    });
    if (isDeviceAvailable) {
      setMicAvailable(true);
    }
  }, [audioDevices]);

  useEffect(() => {
    const isDeviceAvailable = videoDevices && videoDevices.length;
    logger.log(LogSource.Internals, 'SELECT_DEVICE', 'camera devices changed', {
      data: {
        devices: [...videoDevices],
        isDeviceAvailable: isDeviceAvailable
          ? 'Yes, setting camera'
          : 'No video devices available',
      },
    });
    if (isDeviceAvailable) {
      setCameraAvailable(true);
    }
  }, [videoDevices]);

  useEffect(() => {
    const isDeviceAvailable = speakerDevices && speakerDevices.length;
    logger.log(
      LogSource.Internals,
      'SELECT_DEVICE',
      'speaker devices changed',
      {
        data: {
          devices: [...speakerDevices],
          isDeviceAvailable: isDeviceAvailable
            ? 'Yes, setting speaker'
            : 'No speaker devices available',
        },
      },
    );
    if (isDeviceAvailable) {
      setSpeakerAvailable(true);
    }
  }, [speakerDevices]);

  const settingScreenInfoMessage = useString(
    settingsPanelLiveStreamingAttendeeInfo,
  )();
  if (isOnPrecall) {
    return (
      <>
        <>
          {$config.EVENT_MODE && isPickerDisabled && (
            <>
              <Spacer size={24} />
              <InlineNotification
                text={settingScreenInfoMessage}
                warning={true}
                customStyle={{
                  backgroundColor: 'rgba(255, 171, 0, 0.15)',
                }}
              />
            </>
          )}
          <Spacer size={24} />
          <SelectAudioDevice {...props} />
          <Spacer size={24} />
          <SelectSpeakerDevice {...props} />
          <Spacer size={24} />
          {!$config.AUDIO_ROOM && (
            <>
              <SelectVideoDevice {...props} />
              <Spacer size={8} />
            </>
          )}
        </>
      </>
    );
  }
  return (
    <>
      <>
        {$config.EVENT_MODE && isPickerDisabled && (
          <>
            <Spacer size={24} />
            <InlineNotification
              text={settingScreenInfoMessage}
              warning={true}
              customStyle={{
                backgroundColor: 'rgba(255, 171, 0, 0.15)',
              }}
            />
          </>
        )}
        <Spacer size={24} />
        {!$config.AUDIO_ROOM && (
          <>
            <SelectVideoDevice {...props} />
            <Spacer size={24} />
          </>
        )}
        <SelectAudioDevice {...props} />
        <Spacer size={24} />
        <SelectSpeakerDevice {...props} />
        <Spacer size={24} />
      </>
    </>
  );
};
export const SelectDeviceComponentsArray: [
  (props: SelectVideoDeviceProps) => JSX.Element,
  (props: SelectAudioDeviceProps) => JSX.Element,
  (props: SelectSpeakerDeviceProps) => JSX.Element,
] = [SelectVideoDevice, SelectAudioDevice, SelectSpeakerDevice];

const style = StyleSheet.create({
  popupPicker: {
    // height: 30,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 20,
    fontSize: 14,
    fontFamily: 'Source Sans Pro',
  },
  pickerItem: {
    paddingLeft: 12,
    paddingVertical: 24,
    marginHorizontal: 8,
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  infoTxtContainer: {
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
  },
  infoTxt: {
    textAlign: 'left',
    fontSize: 16,
    color: $config.FONT_COLOR,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    padding: 12,
  },
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginBottom: 12,
  },
});

export default SelectDevice;
