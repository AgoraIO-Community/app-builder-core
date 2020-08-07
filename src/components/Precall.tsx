/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useEffect, useState} from 'react';
import {View, Picker, TouchableOpacity, Text} from 'react-native';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {LocalAudioMute, LocalVideoMute} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';

const Precall = (props: any) => {
  const [selectedCam, setSelectedCam] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const {setCallActive} = props;
  const rtc = useContext(RtcContext);
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
    <View style={{flex: 1}}>
      <MaxUidConsumer>
        {(maxUsers) => (
          <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
        )}
      </MaxUidConsumer>
      <Picker
        selectedValue={selectedCam}
        style={{
          height: 50,
          width: '50vw',
          alignSelf: 'center',
          marginVertical: '2vh',
        }}
        onValueChange={(itemValue) => setSelectedCam(itemValue)}>
        {deviceList.map((device: any) => {
          if (device.kind === 'videoinput') {
            return <Picker.Item label={device.label} value={device.deviceId} />;
          }
        })}
      </Picker>
      <Picker
        selectedValue={selectedMic}
        style={{
          height: 50,
          width: '50vw',
          alignSelf: 'center',
          marginBottom: '2vh',
        }}
        onValueChange={(itemValue) => setSelectedMic(itemValue)}>
        {deviceList.map((device: any) => {
          if (device.kind === 'audioinput') {
            return <Picker.Item label={device.label} value={device.deviceId} />;
          }
        })}
      </Picker>
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          padding: 10,
          marginBottom: '2vh',
        }}>
        <LocalUserContext>
          <LocalVideoMute />
          <View style={{width: '5vw'}} />
          <LocalAudioMute />
        </LocalUserContext>
      </View>
      <TouchableOpacity onPress={() => setCallActive(true)}>
        <View
          style={{
            backgroundColor: '#6E757D',
            height: 50,
            width: '50vw',
            alignSelf: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            marginBottom: '5vh',
          }}>
          <Text style={{textAlign: 'center', color: '#fff', fontSize: 18}}>Join</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Precall;
