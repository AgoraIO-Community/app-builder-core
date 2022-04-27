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
import {useChatUIData} from '../components/useChatUI';

export enum UNREAD_MESSAGE_COUNT_TYPE {
  GroupAndPrivateCount,
  GroupCount,
  PrivateCount,
  PaticularUserUnReadCount,
}

function useUnreadMessageCount() {
  const {
    pendingMessageLength,
    pendingPrivateNotification,
    pendingPublicNotification,
    privateMessageCountMap,
    lastCheckedPrivateState,
  } = useChatUIData();

  const getUnreadCount = (type: UNREAD_MESSAGE_COUNT_TYPE, uid?: string) => {
    switch (type) {
      case UNREAD_MESSAGE_COUNT_TYPE.GroupAndPrivateCount:
        return pendingMessageLength;
      case UNREAD_MESSAGE_COUNT_TYPE.GroupCount:
        return pendingPublicNotification;
      case UNREAD_MESSAGE_COUNT_TYPE.PrivateCount:
        return pendingPrivateNotification;
      case UNREAD_MESSAGE_COUNT_TYPE.PaticularUserUnReadCount:
        return uid
          ? (privateMessageCountMap && privateMessageCountMap[uid]
              ? privateMessageCountMap[uid]
              : 0) -
              (lastCheckedPrivateState && lastCheckedPrivateState[uid]
                ? lastCheckedPrivateState[uid]
                : 0)
          : 0;
      default:
        return 0;
    }
  };

  return getUnreadCount;
}

export default useUnreadMessageCount;
