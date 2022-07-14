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
import {UidType} from '../../agora-rn-uikit';
import {useContext} from 'react';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import {LiveStreamControlMessageEnum} from '../components/livestream';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';

export enum CONTROL_MESSAGE_TYPE {
  controlMessageToEveryOne,
  controlMessageToUid,
}
function useSendControlMessage() {
  const {sendControlMessage, sendControlMessageToUid} = useContext(ChatContext);
  const {isHost} = useMeetingInfo();
  return (
    type: CONTROL_MESSAGE_TYPE,
    message: controlMessageEnum | LiveStreamControlMessageEnum,
    uid?: UidType,
  ) => {
    if (isHost || ($config.EVENT_MODE && $config.RAISE_HAND)) {
      switch (type) {
        case CONTROL_MESSAGE_TYPE.controlMessageToEveryOne:
          sendControlMessage(message);
          break;
        case CONTROL_MESSAGE_TYPE.controlMessageToUid:
          if (uid) {
            sendControlMessageToUid(message, uid);
          } else {
            console.error('UID should be passed');
          }
          break;
        default:
          break;
      }
    } else {
      console.error('A host can only send the control message.');
    }
  };
}

export default useSendControlMessage;
