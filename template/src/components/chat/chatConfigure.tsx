import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useLocalUid} from '../agora-rn-uikit';

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

  useEffect(() => {
    // initialize chat sdk
    try {
      const conn = new AgoraChat.connection({
        appKey: $config.CHAT_APP_KEY,
      });
      conn.open({
        user: data.uid.toString(),
        agoraToken: data.chatToken,
      });
      console.log('initialize chat sdk', conn);
    } catch (error) {
      console.log('ac error', error);
    }
  }, []);
  return (
    <chatConfigureContext.Provider value={{open, setOpen}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
