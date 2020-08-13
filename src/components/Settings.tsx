import React, {useContext, useEffect, useState} from 'react';
import {View, Picker, TouchableOpacity, Text, Image} from 'react-native';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import icons from '../assets/icons';
import styles from './styles';

const Settings = () => {
  console.log('!settings');
  const [screenListActive, setScreenListActive] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const rtc = useContext(RtcContext);
  // rtc.RtcEngine.startPreview();
  const [deviceList, setDeviceList] = useState([]);

  useEffect(() => {
    if (deviceList.length === 0) {
      rtc.RtcEngine.getDevices(function (devices: any) {
        setDeviceList(devices);
        for (const i in devices) {
          if (devices[i].kind === 'videoinput') {
            setSelectedCam(devices[i].deviceId);
            break;
          }
        }
        for (const i in devices) {
          if (devices[i].kind === 'audioinput') {
            setSelectedMic(devices[i].deviceId);
            break;
          }
        }
      });
    }
  });

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
    if (selectedCam.length !== 0) {
      rtc.RtcEngine.changeMic(
        selectedMic,
        () => {},
        (e: any) => console.log(e),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic]);

  return (
    <>
      <TouchableOpacity
        style={styles.localButton}
        disabled={buttonDisabled}
        onPress={() => {
          if (!screenListActive) {
            setScreenListActive(true);
            setButtonDisabled(true);
          }
        }}>
        <Image source={{uri: icons.settings}} style={styles.buttonIcon} />
      </TouchableOpacity>
      {screenListActive ? (
        <View style={styles.popupView}>
          <Text style={styles.popupText}>Choose Audio/Video Devices</Text>
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
          <TouchableOpacity
            style={styles.popupButton}
            onPress={() => {
              setScreenListActive(false);
              setButtonDisabled(false);
            }}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default Settings;
