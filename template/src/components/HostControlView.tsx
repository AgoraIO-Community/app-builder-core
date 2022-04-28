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
import {View, Text, StyleSheet} from 'react-native';
import chatContext, {controlMessageEnum} from './ChatContext';
import SecondaryButton from '../atoms/SecondaryButton';
import {useString} from '../utils/useString';

const HostControlView = () => {
  const {sendControlMessage} = useContext(chatContext);
  const hostControlsLabel = useString('hostControlsLabel')();
  const muteAllAudioButton = useString('muteAllAudioButton')();
  const muteAllVideoButton = useString('muteAllVideoButton')();
  return (
    <>
      <Text style={style.heading}>{hostControlsLabel}</Text>
      <View>
        <View style={style.btnContainer}>
          <SecondaryButton
            onPress={() => sendControlMessage(controlMessageEnum.muteAudio)}
            text={muteAllAudioButton}
          />
        </View>
        <View style={style.btnContainer}>
          <SecondaryButton
            onPress={() => sendControlMessage(controlMessageEnum.muteVideo)}
            text={muteAllVideoButton}
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
    color: $config.PRIMARY_FONT_COLOR,
    // marginBottom: 20,
    alignSelf: 'center',
  },
  btnContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
});

export default HostControlView;
