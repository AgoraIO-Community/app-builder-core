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
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import ColorContext from '../components/ColorContext';
import {ImageIcon} from '../../agora-rn-uikit';
import { useRecording } from './recording/useRecording';
import { useString } from '../utils/useString';

const Recording = () => {
  const {primaryColor} = useContext(ColorContext);
  const {startRecording, stopRecording, recordingActive} = useRecording(data => data);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!recordingActive) {
          startRecording && startRecording();
        } else {
          stopRecording && stopRecording();
        }
      }}>
      <View style={[style.localButton, {borderColor: primaryColor}]}>
        <ImageIcon
          name={recordingActive ? 'recordingActiveIcon' : 'recordingIcon'}
          style={[style.buttonIcon]}
          color={recordingActive ? '#FD0845': $config.PRIMARY_COLOR}
        />
      </View>
      <Text
        style={{
          textAlign: 'center',
          marginTop: 5,
          color: recordingActive ? '#FD0845' : $config.PRIMARY_COLOR,
        }}>
        {recordingActive ? useString('recording') : useString('record')}
      </Text>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 23,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '100%',
    height: '100%',
  },
});

export default Recording;
