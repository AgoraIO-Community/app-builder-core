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
import React,{createContext, SetStateAction} from 'react';

interface ChatUIInterface {
  pendingMessageLength: number,
  pendingPrivateNotification: any,
  pendingPublicNotification: any,
  lastCheckedPrivateState: any,
  privateMessageCountMap: any,
  setLastCheckedPublicState: React.Dispatch<SetStateAction<any>>,
  setPrivateMessageLastSeen: React.Dispatch<SetStateAction<any>>,
  setPrivateChatDisplayed: React.Dispatch<SetStateAction<any>>
}

const ChatUIContext = createContext((null as unknown) as ChatUIInterface);

const ChatUIProvider = (props:any) => {
  return (
    <ChatUIContext.Provider
      value={{...props}}
    >
      {true ? props.children : <></>}
    </ChatUIContext.Provider>
  );
};

export {ChatUIProvider,ChatUIContext};

