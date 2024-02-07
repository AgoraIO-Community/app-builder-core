import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';

import {useContent} from 'customization-api';

// AppKey:
// 41754367#1042822
// OrgName:
// 41754367
// AppName:
// 1042822
// API request url
// WebSocket Address:
// msync-api-41.chat.agora.io
// REST API:
// a41.chat.agora.io

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendChatSDKMessage: (toUid: number, message: string) => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    sendChatSDKMessage: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const defaultContentRef = React.useRef(defaultContent);

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    const initializeChatSDK = async () => {
      try {
        // Initializes the Web client.
        const newConn = new AgoraChat.connection({
          appKey: $config.CHAT_APP_KEY,
        });
        // Logs into Agora Chat.
        newConn.open({
          user: data.uid.toString(),
          // pwd: data.chatUserPwd,
          agoraToken: data.chatUserToken,
          success: e => {
            console.log('%cChatSDK: User is logged in', 'color: blue');
          },
          error: e => {
            console.log('%cChatSDK: User login failed', 'color: red');
          },
        });

        //  event listener for messages
        newConn.addEventHandler('connection&message', {
          // app is connected to chat server
          onConnected: () => {
            console.log('%cChatSDK: connected to chat server', 'color: blue');
          },
          // text message is recieved
          onTextMessage: message => {
            debugger;
            console.log(
              '%cChatSDK: received msg: %s. from: %s',
              'color: blue',
              JSON.stringify(message, null, 2),
              defaultContentRef.current[message.from]?.name,
            );
          },
          // on token expired
          onTokenExpired: () => {
            debugger;
            console.log('%cChatSDK: token has expired', 'color: blue');
          },
          onError: error => {
            debugger;
            console.log('on error', error);
          },
        });
        connRef.current = newConn;
        console.log('%cChatSDK: Initialize Chat SDK: %s', 'color: green');
      } catch (error) {
        console.log(
          '%cChatSDK: initialization error: %s',
          'color: red',
          JSON.stringify(error, null, 2),
        );
      }
    };

    // initializing chat sdk
    initializeChatSDK();
  }, []);

  const sendChatSDKMessage = (toUid: number, message: string) => {
    if (connRef.current) {
      const option = {
        chatType: 'singleChat',
        type: 'txt',
        from: data.uid.toString(),
        to: toUid.toString(),
        msg: message,
      };

      //@ts-ignore
      const msg = AgoraChat.message.create(option);

      connRef.current
        .send(msg)
        .then(res => {
          console.log(
            '%cChatSDK: Send private msg success: %s',
            'color: blue',
            JSON.stringify(res, null, 2),
          );
        })
        .catch(error => {
          console.log(
            '%cChatSDK: Send private msg fail: %s',
            'color: blue',
            error,
          );
        });
    }
  };
  return (
    <chatConfigureContext.Provider value={{open, setOpen, sendChatSDKMessage}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
