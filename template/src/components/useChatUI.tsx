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
import {createHook} from 'fpe-api';
import React,{createContext, SetStateAction} from 'react';

export interface privateMsgLastSeenInterface {
  userId: string | number,
  lastSeenCount: number
}
export interface ChatUIDataInterface {
  pendingMessageLength: number,
  pendingPrivateNotification: number,
  pendingPublicNotification: number,
  lastCheckedPrivateState: object,
  privateMessageCountMap: object ,
  setLastCheckedPublicState: React.Dispatch<SetStateAction<number>>,
  setPrivateMessageLastSeen: React.Dispatch<SetStateAction<privateMsgLastSeenInterface>>,
  setPrivateChatDisplayed: React.Dispatch<SetStateAction<boolean>>
}

const ChatUIDataContext = createContext({
  pendingMessageLength: 0, 
  pendingPrivateNotification: 0,
  pendingPublicNotification: 0, 
  lastCheckedPrivateState: {},
  privateMessageCountMap: {},
  setLastCheckedPublicState: () => {},
  setPrivateMessageLastSeen: () => {},
  setPrivateChatDisplayed: () => {},
 } as ChatUIDataInterface);

const ChatUIDataProvider = (props:any) => {
  return (
    <ChatUIDataContext.Provider
      value={{...props}}
    >
      {true ? props.children : <></>}
    </ChatUIDataContext.Provider>
  );
};

const useChatUIData = createHook(ChatUIDataContext)

export {ChatUIDataProvider,useChatUIData};

