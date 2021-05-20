import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import chatContext, {controlMessageEnum} from './ChatContext';
import ColorContext from './ColorContext';
import SecondaryButton from '../atoms/SecondaryButton';

const HostControlView = () => {
  const {sendControlMessage} = useContext(chatContext);
  const {primaryColor} = useContext(ColorContext);
  return (
    <>
      <Text style={style.heading}>Host Controls</Text>
      <View>
        <View style={style.btnContainer}>
          <SecondaryButton
            onPress={() => sendControlMessage(controlMessageEnum.muteAudio)}
            text={'Mute all audios'}
          />
        </View>
        <View style={style.btnContainer}>
          <SecondaryButton
            onPress={() => sendControlMessage(controlMessageEnum.muteVideo)}
            text={'Mute all videos'}
          />
        </View>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    // marginBottom: 20,
    alignSelf: 'center',
  },
  btnContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
});

export default HostControlView;
