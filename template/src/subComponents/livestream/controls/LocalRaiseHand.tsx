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
import React, {useContext, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import ChatContext from '../../../components/ChatContext';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import {PropsContext} from '../../../../agora-rn-uikit';
import Toast from '../../../../react-native-toast-message';
import {BtnTemplate} from '../../../../agora-rn-uikit';

const LocalRaiseHand = (props: any) => {
  const {raiseHandRequestActive, setRaiseHandRequestActive} = props;
  const {styleProps} = useContext(PropsContext);
  const {localBtnStyles} = styleProps || {};
  const {muteLocalAudio} = localBtnStyles || {};
  const {sendControlMessage} = useContext(ChatContext);

  useEffect(() => {
    if (raiseHandRequestActive)
      Toast.show({
        type: 'success',
        text1: 'Request sent to host for approval',
        visibilityTime: 1000,
      });
  }, [raiseHandRequestActive]);

  return (
    <BtnTemplate
      name={raiseHandRequestActive ? 'raiseHandIcon' : 'raiseHandIcon'}
      btnText={raiseHandRequestActive ? 'Lower hand' : 'Raise Hand'}
      color={raiseHandRequestActive && '#FD0845'}
      style={{
        ...style.localBtn,
        ...(localBtnStyles as object),
        ...(muteLocalAudio as object),
      }}
      disabled={raiseHandRequestActive}
      onPress={() => {
        if (!raiseHandRequestActive) {
          setRaiseHandRequestActive(true);
          sendControlMessage(LiveStreamControlMessageEnum.raiseHandRequest);
        }
      }}
    />
  );
};

const style = StyleSheet.create({
  localBtn: {
    borderRadius: 23,
    borderWidth: 4 * StyleSheet.hairlineWidth,
    borderColor: '#007aff',
    backgroundColor: '#007aff',
  },
});

export default LocalRaiseHand;
