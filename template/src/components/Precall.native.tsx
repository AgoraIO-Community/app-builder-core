import React, {useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import ColorContext from './ColorContext';
import TextInput from '../atoms/TextInput';
import Error from '../subComponents/Error';

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const maxUsers = useContext(MaxUidContext);
  const rtc = useContext(RtcContext);
  rtc.RtcEngine.startPreview();
  const {setCallActive, queryComplete, username, setUsername, error} = props;
  return (
    <ImageBackground
      source={{uri: $config.bg}}
      style={style.full}
      resizeMode={'cover'}>
      <View style={style.heading}>
        <Text style={style.headingText}>Precall </Text>
      </View>
      {error ? (
        <Error error={error} showBack={true} />
      ) : (
        <></>
      )}
      <View style={style.full}>
        <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
      </View>
      <View style={style.textInputHolder}>
        <TextInput
          value={username}
          onChangeText={(text) => {
            if (username !== 'Getting name...') {
              setUsername(text);
            }
          }}
          onSubmitEditing={() => {}}
          placeholder="Display Name"
        />
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
        disabled={!queryComplete}
        style={
          queryComplete
            ? [style.buttonActive, {backgroundColor: primaryColor}]
            : [style.buttonDisabled, {backgroundColor: primaryColor + '80'}]
        }>
        <Text style={style.buttonText}>
          {queryComplete ? 'Join Room' : 'Loading...'}
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  heading: {flex: 0.1, justifyContent: 'center'},
  headingText: {
    fontSize: 24,
    color: '#333',
    fontWeight: '700',
    alignSelf: 'center',
  },
  textInputHolder: {
    flex: 0.1,
    alignSelf: 'center',
    paddingTop: 20,
    width: '100%',
  },
  textInput: {
    width: '80%',
    paddingLeft: 8,
    borderColor: '#099DFD',
    borderWidth: 2,
    color: '#333',
    fontSize: 16,
    // marginBottom: 15,
    // maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  controls: {flex: 0.2, flexDirection: 'row', alignSelf: 'center', padding: 5},
  width50: {width: 50},
  buttonActive: {
    backgroundColor: '#099DFD',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  buttonDisabled: {
    backgroundColor: '#099DFD80',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
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
