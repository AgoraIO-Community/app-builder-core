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
      setPickerDisabled(true);
      setBtnTheme('rgba(16, 16, 16, 0.3)');
    } else {
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
      .filter((device) => {
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
      data.find((device) => device.value === selectedCam),
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
  return props?.render ? (
    props.render(selectedCam, setSelectedCam, deviceList, isPickerDisabled)
  ) : (
    <>
      <Text style={style.label}>Camera</Text>
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
            ? 'No Camera Detected'
            : isPendingUpdate
            ? 'Updating'
            : 'No Camera Selected'
        }
        data={isPermissionGranted ? data : []}
        onSelect={({label, value}) => {
          setIsFocussed(true);
          try {
            pendingStateUpdateHelper(
              async () => await setSelectedCam(value),
              setIsPendingUpdate,
            );
          } catch (e) {
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
      .filter((device) => {
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
      data.find((device) => device.value === selectedMic),
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
  return props?.render ? (
    props.render(selectedMic, setSelectedMic, deviceList, isPickerDisabled)
  ) : (
    <View>
      <Text style={style.label}>Microphone</Text>
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
            ? 'No Microphone Detected'
            : isPendingUpdate
            ? 'Updating'
            : 'No Microphone Selected'
        }
        data={isPermissionGranted ? data : []}
        onSelect={({label, value}) => {
          setIsFocussed(true);
          try {
            pendingStateUpdateHelper(
              async () => await setSelectedMic(value),
              setIsPendingUpdate,
            );
          } catch (e) {
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
  const {selectedSpeaker, setSelectedSpeaker, deviceList} =
    useContext(DeviceContext);
  const local = useContext(LocalContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  const [isFocussed, setIsFocussed] = React.useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(isPickerDisabled);
  const newRandomDeviceId = randomNameGenerator(64).toUpperCase();

  const data = useMemo(() => {
    return deviceList
      .filter((device) => {
        if (device.kind === 'audiooutput') {
          return true;
        }
      })
      ?.map((device) => {
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
      data.find((device) => device.value === selectedSpeaker),
    );
    if (isPendingUpdate) {
      selectedDeviceExists && setIsPendingUpdate(false);
    } else {
      !selectedDeviceExists && data?.length && setIsPendingUpdate(true);
    }
  }, [selectedSpeaker, data]);

  return props?.render ? (
    props.render(
      selectedSpeaker,
      setSelectedSpeaker,
      deviceList,
      isPickerDisabled,
    )
  ) : (
    <View>
      <Text style={style.label}>Speaker</Text>
      {(local.permissionStatus === PermissionState.GRANTED_FOR_CAM_AND_MIC ||
        local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY) &&
      (!data || data.length === 0) ? (
        <Dropdown
          icon={props?.isIconDropdown ? 'speaker' : undefined}
          enabled={!isPickerDisabled}
          selectedValue={newRandomDeviceId}
          label={''}
          data={[
            {
              value: newRandomDeviceId,
              label: 'System Default Speaker Device',
            },
          ]}
          onSelect={({label, value}) => {
            setIsFocussed(true);
            try {
              pendingStateUpdateHelper(
                async () => await setSelectedSpeaker(value),
                setIsPendingUpdate,
              );
            } catch (e) {
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
              ? 'No Speaker Detected'
              : isPendingUpdate
              ? 'Updating'
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
}

const SelectDevice = (props: SelectDeviceProps) => {
  const [isPickerDisabled] = useSelectDevice();
  const {deviceList} = useContext(DeviceContext);
  const {setCameraAvailable, setMicAvailable, setSpeakerAvailable} =
    usePreCall();

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
    if (audioDevices && audioDevices.length) {
      setMicAvailable(true);
    }
  }, [audioDevices]);

  useEffect(() => {
    if (videoDevices && videoDevices.length) {
      setCameraAvailable(true);
    }
  }, [videoDevices]);

  useEffect(() => {
    if (speakerDevices && speakerDevices.length) {
      setSpeakerAvailable(true);
    }
  }, [speakerDevices]);

  //commented for v1 release
  // const settingScreenInfoMessage = useString('settingScreenInfoMessage')();
  // const settingScreenInfoMessage = $config.AUDIO_ROOM
  //   ? 'Audio sharing is disabled for attendees. Raise hand to request permission to share.'
  //   : 'Video and Audio sharing is disabled for attendees. Raise hand to request permission to share.';
  const settingScreenInfoMessage =
    'Attendees need to raise their hand to access the devices.';
  return (
    <>
      <>
        {$config.EVENT_MODE && isPickerDisabled && (
          <>
            <Spacer size={24} />
            <View style={style.infoTxtContainer}>
              <Text style={style.infoTxt}>{settingScreenInfoMessage}</Text>
            </View>
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
