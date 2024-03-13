import {createHook} from 'customization-implementation';
import React, {createContext, useEffect, useState} from 'react';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useContent} from 'customization-api';
import {ChatClient, ChatOptions} from 'react-native-agora-chat';

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const defaultContentRef = React.useRef(defaultContent);
  const chatClient = ChatClient.getInstance();

  const localUid = data?.uid.toString();
  const agoraToken = data?.chat.user_token;

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    const initializeChatSDK = async () => {
      const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
      const chatOptions = new ChatOptions({
        appKey: CHAT_APP_KEY,
      });

      try {
        // initialize native client
        await chatClient.init(chatOptions);
        console.warn('chat sdk: init success');

        // log in user to agoar chat
        try {
          console.warn('localUId - agoraTopken', localUid, agoraToken);
          await chatClient.loginWithAgoraToken(localUid, agoraToken);
          console.warn('chat sdk: login success');
        } catch (error) {
          console.warn(
            'chat sdk: login failed 1',
            JSON.stringify(error, null, 2),
          );
        }
      } catch (error) {
        console.warn('chat sdk: init error', error);
      }
    };

    initializeChatSDK();
  }, []);

  return (
    <chatConfigureContext.Provider value={{open, setOpen}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
