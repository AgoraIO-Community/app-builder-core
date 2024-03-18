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
import {useRoomInfo} from '../components/room-info/useRoomInfo';
import {controlMessageEnum} from '../components/ChatContext';
import events, {PersistanceLevel} from '../rtm-events-api';
import {MUTE_REMOTE_TYPE} from './useRemoteMute';

function useDisableButton() {
  const {
    data: {isHost},
  } = useRoomInfo();

  return async (type: MUTE_REMOTE_TYPE, action: boolean = true) => {
    if (isHost) {
      events.send(
        controlMessageEnum.disableButton,
        JSON.stringify({button: type, action}),
        PersistanceLevel.None,
      );
    } else {
      console.error(
        'A host can only enable/disable participants video/audio button.',
      );
    }
  };
}

export default useDisableButton;
