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
import React, {useContext} from 'react';
import {Picker, StyleSheet, View, Text} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import DeviceContext from '../components/DeviceContext';
import ColorContext from '../components/ColorContext';
import {useString} from '../utils/useString';
// import {dropdown} from '../../theme.json';
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
}

const SelectVideoDevice = (props: SelectVideoDeviceProps) => {
  const {selectedCam, setSelectedCam, deviceList} = useContext(DeviceContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  return props?.render ? (
    props.render(selectedCam, setSelectedCam, deviceList, isPickerDisabled)
  ) : (
    <Picker
      enabled={!isPickerDisabled}
      selectedValue={selectedCam}
      style={[{borderColor: btnTheme}, style.popupPicker]}
      onValueChange={(itemValue) => setSelectedCam(itemValue)}>
      {deviceList.map((device: any) => {
        if (device.kind === 'videoinput') {
          return (
            <Picker.Item
              label={device.label}
              value={device.deviceId}
              key={device.deviceId}
            />
          );
        }
      })}
    </Picker>
  );
};

interface SelectAudioDeviceProps {
  render?: (
    selectedMic: string,
    setSelectedMic: (mic: string) => void,
    deviceList: MediaDeviceInfo[],
    isDisabled: boolean,
  ) => JSX.Element;
}

const SelectAudioDevice = (props: SelectAudioDeviceProps) => {
  const {selectedMic, setSelectedMic, deviceList} = useContext(DeviceContext);
  const [isPickerDisabled, btnTheme] = useSelectDevice();
  return props?.render ? (
    props.render(selectedMic, setSelectedMic, deviceList, isPickerDisabled)
  ) : (
    <Picker
      enabled={!isPickerDisabled}
      selectedValue={selectedMic}
      style={[{borderColor: btnTheme}, style.popupPicker]}
      onValueChange={(itemValue) => setSelectedMic(itemValue)}>
      {deviceList.map((device: any) => {
        if (device.kind === 'audioinput') {
          return (
            <Picker.Item
              label={device.label}
              value={device.deviceId}
              key={device.deviceId}
            />
          );
        }
      })}
    </Picker>
  );
};

const SelectDevice = () => {
  const [isPickerDisabled] = useSelectDevice();
  //commented for v1 release
  // const settingScreenInfoMessage = useString('settingScreenInfoMessage')();
  const settingScreenInfoMessage = $config.AUDIO_ROOM
    ? 'Audio sharing is disabled for attendees. Raise hand to request permission to share.'
    : 'Video and Audio sharing is disabled for attendees. Raise hand to request permission to share.';
  return (
    <View>
      <View style={{marginTop: 15}}></View>
      <View>
        {!$config.AUDIO_ROOM && <SelectVideoDevice />}
        <SelectAudioDevice />
      </View>
      <View style={{marginTop: 15}}></View>
      {$config.EVENT_MODE && isPickerDisabled && (
        <View>
          <Text style={style.infoTxt}>{settingScreenInfoMessage}</Text>
        </View>
      )}
    </View>
  );
};
export const SelectDeviceComponentsArray: [
  (props: SelectVideoDeviceProps) => JSX.Element,
  (props: SelectAudioDeviceProps) => JSX.Element,
] = [SelectVideoDevice, SelectAudioDevice];

const style = StyleSheet.create({
  popupPicker: {
    height: 30,
    marginBottom: 10,
    borderRadius: 50,
    paddingHorizontal: 15,
    fontSize: 15,
    minHeight: 35,
  },
  infoTxt: {
    textAlign: 'center',
    fontSize: 12,
    color: '#FF0000',
  },
});

export default SelectDevice;
