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
import LiveStreamContext, {
  RaiseHandValue,
} from '../../../components/livestream';
import {PropsContext} from '../../../../agora-rn-uikit';
import {BtnTemplate} from '../../../../agora-rn-uikit';
import icons from '../../../assets/icons';
import {useString} from '../../../utils/useString';
import ChatContext from '../../../components/ChatContext';

const LocalRaiseHand = () => {
  const {styleProps} = useContext(PropsContext);
  const {audienceSendsRequest, audienceRecallsRequest, raiseHandList} =
    useContext(LiveStreamContext);
  const {localUid} = useContext(ChatContext);
  const {localBtnStyles} = styleProps || {};
  const {theme} = styleProps || {};
  const {muteLocalAudio} = localBtnStyles || {};
  //commented for v1 release
  //const handStatusText = useString<boolean>('raiseHandButton');
  const handStatusText = (toggle: boolean) =>
    toggle ? 'Lower hand' : 'Raise Hand';
  return (
    <BtnTemplate
      icon={icons['raiseHandIcon']}
      btnText={handStatusText(
        raiseHandList[localUid]?.raised === RaiseHandValue.TRUE,
      )}
      color={
        raiseHandList[localUid]?.raised === RaiseHandValue.TRUE
          ? '#FD0845'
          : theme
      }
      style={{
        ...style.localBtn,
        ...(localBtnStyles as object),
        ...(muteLocalAudio as object),
      }}
      onPress={() => {
        if (raiseHandList[localUid]?.raised === RaiseHandValue.TRUE) {
          audienceRecallsRequest();
        } else {
          audienceSendsRequest();
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
