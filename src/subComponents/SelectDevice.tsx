import React, {useContext} from 'react';
import {Picker} from 'react-native';
import DeviceContext from '../components/DeviceContext';
import styles from '../components/styles';

const SelectDevice = (props: any) => {
  const {
    selectedCam,
    setSelectedCam,
    selectedMic,
    setSelectedMic,
    deviceList
  } = useContext(DeviceContext);

  return (
    <>
      <Picker
        selectedValue={selectedCam}
        style={styles.popupPicker}
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
      <Picker
        selectedValue={selectedMic}
        style={styles.popupPicker}
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
    </>
  );
};
export default SelectDevice;
