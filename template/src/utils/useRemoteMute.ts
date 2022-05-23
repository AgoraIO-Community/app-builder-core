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
import {useContext} from 'react';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import {UidInterface} from '../../agora-rn-uikit';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import useIsPSTN from './isPSTNUser';
import useMutePSTN from './useMutePSTN';

export enum MUTE_REMOTE_TYPE {
  audio,
  video,
}
function useRemoteMute() {
  const {sendControlMessageToUid} = useContext(ChatContext);
  const {isHost} = useMeetingInfo();
  const isPSTN = useIsPSTN();
  const mutePSTN = useMutePSTN();
  return async (type: MUTE_REMOTE_TYPE, uid: UidInterface['uid']) => {
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
            sendControlMessageToUid(controlMessageEnum.muteAudio, uid);
          }
          break;
        case MUTE_REMOTE_TYPE.video:
          if (!isPSTN(uid)) {
            sendControlMessageToUid(controlMessageEnum.muteVideo, uid);
          }
          break;
      }
    } else {
      console.error('A host can only mute audience audio or video.');
    }
  };
}

export default useRemoteMute;
