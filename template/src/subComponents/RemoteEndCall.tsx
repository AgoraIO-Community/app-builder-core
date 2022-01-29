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
import {StyleSheet} from 'react-native';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import {BtnTemplate} from '../../agora-rn-uikit';

const RemoteEndCall = (props: {uid: number; isHost: boolean}) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  return props.isHost && String(props.uid)[0] !== '1' ? (
    <BtnTemplate
      style={style.remoteButton}
      onPress={() => {
        sendControlMessageToUid(controlMessageEnum.kickUser, props.uid);
      }}
      color='#FD0845'
      name={'remoteEndCall'} // earlier was endCall, added remoteEndCall
    />
  ) : (
    <></>
  );
};

const style = StyleSheet.create({
  remoteButton: {
    width: 30,
    height: 25,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    marginHorizontal: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
});

export default RemoteEndCall;
