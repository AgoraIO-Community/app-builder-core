import React, {useContext} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';

const Precall = (props: any) => {
  const maxUsers = useContext(MaxUidContext);
  const rtc = useContext(RtcContext);
  rtc.RtcEngine.startPreview();
  const {setCallActive, queryComplete} = props;
  return (
    <View style={style.full}>
      <View style={style.heading}>
        <Text style={style.headingText}>Precall</Text>
      </View>
      <View style={style.full}>
        <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
      </View>
      <View style={style.controls}>
        <LocalUserContext>
          <LocalVideoMute />
          <View style={style.width50} />
          <LocalAudioMute />
          <View style={style.width50} />
          <SwitchCamera />
        </LocalUserContext>
      </View>
      <TouchableOpacity
        onPress={() => setCallActive(true)}
        disabled={!queryComplete}>
        <View style={queryComplete ? style.buttonActive : style.buttonDisabled}>
          <Text style={style.buttonText}>Join Room</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  heading: {flex: 0.1, justifyContent: 'center'},
  headingText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '400',
    alignSelf: 'center',
  },
  controls: {flexDirection: 'row', alignSelf: 'center', padding: 10},
  width50: {width: 50},
  buttonActive: {
    backgroundColor: '#099DFD',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#099DFD',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    opacity: 0.3,
  },
  buttonText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
});

export default Precall;
