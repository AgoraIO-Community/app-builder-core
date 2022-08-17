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
import {useChatMessages} from '../components/chat-messages/useChatMessages';
import {MESSAGE_TYPE} from './useSendMessage';

function useDeleteMessage() {
  const {deleteChatMessage} = useChatMessages();
  return (type: MESSAGE_TYPE, msgId: string, uid?: UidType) => {
    switch (type) {
      case MESSAGE_TYPE.group:
        deleteChatMessage(msgId);
        break;
      case MESSAGE_TYPE.private:
        if (uid) {
          deleteChatMessage(msgId, uid);
        } else {
          console.error('To delete the private message, UID should be passed');
        }
        break;
      default:
        break;
    }
  };
}

export default useDeleteMessage;
