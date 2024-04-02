import {createHook} from 'customization-implementation';
import React, {createContext, useEffect, useState} from 'react';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useContent} from 'customization-api';
import {
  ChatClient,
  ChatConnectEventListener,
  ChatContactEventListener,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageEventListener,
  ChatOptions,
} from 'react-native-agora-chat';
import StorageContext from '../StorageContext';
import {ChatMessageType, useSDKChatMessages} from './useSDKChatMessages';

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteChatUser: () => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    deleteChatUser: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const defaultContentRef = React.useRef(defaultContent);
  const chatClient = ChatClient.getInstance();
  const chatManager = chatClient.chatManager;

  const localUid = data?.uid?.toString();
  const agoraToken = data?.chat?.user_token;
  const {store} = React.useContext(StorageContext);
  const {addMessageToPrivateStore, showMessageNotification, addMessageToStore} =
    useSDKChatMessages();

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    const logout = async () => {
      try {
        await chatClient.logout();
        console.warn('logout success');
      } catch (error) {
        console.warn('logout failed');
      }
    };
    const setupMessageListener = () => {
      const msgListerner: ChatMessageEventListener = {
        onMessagesReceived: (messages: Array<ChatMessage>) => {
          // all types of msg recivied : text, image, video etc..
          console.warn('on msg rcvd', messages);
          const isGroupChat =
            messages[0].chatType === ChatMessageChatType.GroupChat;
          const isPeerChat =
            messages[0].chatType === ChatMessageChatType.PeerChat;
          const {localMsgId, from, body, localTime} = messages[0];
          const chatType = body.type;

          //@ts-ignore

          switch (chatType) {
            case ChatMessageType.TXT:
              //@ts-ignore
              const chatContent = body.content;
              if (isGroupChat) {
                showMessageNotification(chatContent, from, false);
                addMessageToStore(Number(from), {
                  msg: chatContent,
                  createdTimestamp: localTime,
                  msgId: localMsgId,
                  isDeleted: false,
                  type: ChatMessageType.TXT,
                });
              }
              if (isPeerChat) {
                showMessageNotification(chatContent, from, true);
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: chatContent,
                    createdTimestamp: localTime,
                    msgId: localMsgId,
                    isDeleted: false,
                    type: ChatMessageType.TXT,
                  },
                  false,
                );
              }
              break;
            case ChatMessageType.IMAGE:
              //@ts-ignore
              const thumb = body.thumbnailRemotePath;
              //@ts-ignore
              const url = body.remotePath;
              if (isGroupChat) {
                showMessageNotification('You got group image msg', from, false);
                addMessageToStore(Number(from), {
                  msg: '',
                  createdTimestamp: localTime,
                  msgId: localMsgId,
                  isDeleted: false,
                  type: ChatMessageType.IMAGE,
                  thumb: thumb,
                  url: url,
                });
              }
              if (isPeerChat) {
                showMessageNotification(
                  'You got private image msg',
                  from,
                  true,
                );
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: '',
                    createdTimestamp: localTime,
                    msgId: localMsgId,
                    isDeleted: false,
                    type: ChatMessageType.IMAGE,
                    thumb: thumb,
                    url: url,
                  },
                  false,
                );
              }
              break;
            case ChatMessageType.FILE:
              //@ts-ignore
              const fileUrl = body.remotePath;
              //@ts-ignore
              const {file_ext} = messages[0].attributes;
              //@ts-ignore
              const fileName = body.displayName;
              if (isGroupChat) {
                showMessageNotification(
                  'You got group file msg 1',
                  from,
                  false,
                );
                addMessageToStore(Number(from), {
                  msg: '',
                  createdTimestamp: localTime,
                  msgId: localMsgId,
                  isDeleted: false,
                  type: ChatMessageType.FILE,
                  url: fileUrl,
                  ext: file_ext,
                  fileName: fileName,
                });
              }
              if (isPeerChat) {
                showMessageNotification('You got private file msg', from, true);
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: '',
                    createdTimestamp: localTime,
                    msgId: localMsgId,
                    isDeleted: false,
                    type: ChatMessageType.FILE,
                    url: fileUrl,
                    ext: file_ext,
                    fileName: fileName,
                  },
                  false,
                );
              }

              break;
          }
        },
      };
      console.warn('setup listener');
      chatManager.removeAllMessageListener();
      chatManager.addMessageListener(msgListerner);
    };

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
          console.warn('localUId - agoraToken', localUid, agoraToken);
          await chatClient.loginWithAgoraToken(localUid, agoraToken);
          console.warn('chat sdk: login success');
          // adding chat connection event listeners
          let listener: ChatConnectEventListener = {
            onTokenWillExpire() {
              console.warn('token expire.');
            },
            onTokenDidExpire() {
              console.warn('token did expire');
            },
            onConnected() {
              console.warn('onConnected');
              // once sdk connects to chat server successfully , need to add message listeners
              setupMessageListener();
            },
            onDisconnected() {
              console.warn('onDisconnected:');
            },
          };
          chatClient.addConnectionListener(listener);
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
    return () => {
      logout();
    };
  }, []);

  const deleteChatUser = async () => {
    const groupID = data.chat.group_id;
    const userID = data.uid;
    const isChatGroupOwner = data.chat.is_group_owner;
    // owner exit user > 1 , dont call delete
    // ower exit user = 1, delete ,
    // member exit user > 1 delete ,
    // member exit user = 1 , owner needs to be deleted
    const response = await fetch(
      `${$config.BACKEND_ENDPOINT}/v1/${data.channel}/chat/${groupID}/users/${userID}/${isChatGroupOwner}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
        },
      },
    );
    const res = await response.json();
    return res;
  };

  return (
    <chatConfigureContext.Provider value={{open, setOpen, deleteChatUser}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;