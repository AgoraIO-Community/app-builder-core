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
import LiveStreamContext, {
  RaiseHandValue,
} from '../../../components/livestream';
import {useString} from '../../../utils/useString';
import Styles from '../../../components/styles';
import ChatContext from '../../../components/ChatContext';
import IconButton from '../../../atoms/IconButton';

const LocalRaiseHand = () => {
  const {audienceSendsRequest, audienceRecallsRequest, raiseHandList} =
    useContext(LiveStreamContext);
  const {localUid} = useContext(ChatContext);
  //commented for v1 release
  //const handStatusText = useString<boolean>('raiseHandButton');
  const handStatusText = (toggle: boolean) =>
    toggle ? 'Lower hand' : 'Raise Hand';
  const isHandRasied = raiseHandList[localUid]?.raised === RaiseHandValue.TRUE;
  return (
    <IconButton
      iconProps={{
        name: isHandRasied ? 'lowerHand' : 'raiseHand',
        tintColor: isHandRasied ? '#FF414D' : $config.PRIMARY_COLOR,
      }}
      btnText={handStatusText(isHandRasied)}
      style={Styles.localButton as Object}
      styleText={{
        fontFamily: 'Source Sans Pro',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '400',
        color: isHandRasied ? '#FF414D' : $config.PRIMARY_COLOR,
      }}
      onPress={() => {
        if (isHandRasied) {
          audienceRecallsRequest();
        } else {
          audienceSendsRequest();
        }
      }}
    />
  );
};

export default LocalRaiseHand;
