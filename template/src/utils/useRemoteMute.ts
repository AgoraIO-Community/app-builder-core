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
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import {UidType} from '../../agora-rn-uikit';
import {controlMessageEnum} from '../components/ChatContext';
import useIsPSTN from './isPSTNUser';
import useMutePSTN from './useMutePSTN';
import useSendControlMessage, {
  CONTROL_MESSAGE_TYPE,
} from '../utils/useSendControlMessage';

export enum MUTE_REMOTE_TYPE {
  audio,
  video,
}
function useRemoteMute() {
  const sendCtrlMsgToUid = useSendControlMessage();
  const {isHost} = useMeetingInfo();
  const isPSTN = useIsPSTN();
  const mutePSTN = useMutePSTN();
  return async (type: MUTE_REMOTE_TYPE, uid: UidType) => {
    if (isHost) {
      switch (type) {
        case MUTE_REMOTE_TYPE.audio:
          if (isPSTN(uid)) {
            try {
              mutePSTN(uid);
            } catch (error) {
              console.error('An error occurred while muting the PSTN user.');
            }
          } else {
            sendCtrlMsgToUid(
              CONTROL_MESSAGE_TYPE.controlMessageToUid,
              controlMessageEnum.muteAudio,
              uid,
            );
          }
          break;
        case MUTE_REMOTE_TYPE.video:
          if (!isPSTN(uid)) {
            sendCtrlMsgToUid(
              CONTROL_MESSAGE_TYPE.controlMessageToUid,
              controlMessageEnum.muteVideo,
              uid,
            );
          }
          break;
      }
    } else {
      console.error('A host can only mute audience audio or video.');
    }
  };
}

export default useRemoteMute;
