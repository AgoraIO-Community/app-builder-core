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
  ChatMessageStatusCallback,
} from 'react-native-agora-chat';
import StorageContext from '../StorageContext';
import {
  ChatMessageType,
  useChatMessages,
} from '../chat-messages/useChatMessages';
import {timeNow} from '../../rtm/utils';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';

interface ChatOption {
  chatType: string;
  type: ChatMessageType;
  from: string;
  to: string;
  msg?: string;
  file?: object;
  ext?: {
    file_length: number;
    file_ext: string;
    file_name: string;
    file_url: string;
    from_platform?: string;
  };
  url?: string;
  fileName?: string;
}
interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendChatSDKMessage: (
    option: ChatOption,
    callback: ChatMessageStatusCallback,
  ) => void;
  deleteChatUser: () => void;
  downloadAttachment: (fileName: string, fileUrl: string) => void;
  deleteAttachment: (
    msgId: string,
    privateChatUser: string,
    chatType: string,
  ) => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    sendChatSDKMessage: () => {},
    deleteChatUser: () => {},
    downloadAttachment: () => {},
    deleteAttachment: () => {},
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
  const {
    addMessageToPrivateStore,
    showMessageNotification,
    addMessageToStore,
    removeMessageFromStore,
    removeMessageFromPrivateStore,
  } = useChatMessages();

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
        onMessagesRecalled: (messages: ChatMessage[]) => {
          console.warn('on msg recalled', messages);
          const isGroupChat = messages[0].to === data.chat.group_id;
          if (isGroupChat) {
            removeMessageFromStore(messages[0].msgId.toString(), true);
          } else {
            removeMessageFromPrivateStore(messages[0].msgId.toString(), true);
          }
        },
        onMessagesReceived: (messages: ChatMessage[]) => {
          // all types of msg recivied : text, image, video etc..
          console.warn('on msg rcvd : Native101', messages);
          const isGroupChat =
            messages[0].chatType === ChatMessageChatType.GroupChat;
          const isPeerChat =
            messages[0].chatType === ChatMessageChatType.PeerChat;
          const {msgId, from, body, localTime} = messages[0];
          const chatType = body.type;
          const {file_ext, file_name, file_url, from_platform} =
            messages[0].attributes;

          //@ts-ignore

          switch (chatType) {
            case ChatMessageType.TXT:
              //@ts-ignore
              const chatContent = body.content;
              if (isGroupChat) {
                showMessageNotification(chatContent, from, false);
                addMessageToStore(Number(from), {
                  msg: chatContent.replace(/^(\n)+|(\n)+$/g, ''),
                  createdTimestamp: localTime,
                  msgId: msgId,
                  isDeleted: false,
                  type: ChatMessageType.TXT,
                });
              }
              if (isPeerChat) {
                showMessageNotification(chatContent, from, true);
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: chatContent.replace(/^(\n)+|(\n)+$/g, ''),
                    createdTimestamp: localTime,
                    msgId: msgId,
                    isDeleted: false,
                    type: ChatMessageType.TXT,
                  },
                  false,
                );
              }
              break;
            case ChatMessageType.IMAGE:
              //@ts-ignore
              const thumb =
                from_platform === 'web'
                  ? file_url + '&thumbnail=true'
                  : body.thumbnailRemotePath;
              //@ts-ignore
              const url = from_platform === 'web' ? file_url : body.remotePath;
              console.warn('url ==>', url);
              if (isGroupChat) {
                showMessageNotification(
                  file_name,
                  from,
                  false,
                  ChatMessageType.IMAGE,
                );
                addMessageToStore(Number(from), {
                  msg: '',
                  createdTimestamp: localTime,
                  msgId: msgId,
                  isDeleted: false,
                  type: ChatMessageType.IMAGE,
                  thumb: thumb,
                  url: url,
                  fileName: file_name,
                });
              }
              if (isPeerChat) {
                showMessageNotification(
                  'You got private image msg',
                  from,
                  true,
                  ChatMessageType.IMAGE,
                );
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: '',
                    createdTimestamp: localTime,
                    msgId: msgId,
                    isDeleted: false,
                    type: ChatMessageType.IMAGE,
                    thumb: thumb,
                    url: url,
                    fileName: file_name,
                  },
                  false,
                );
              }
              break;
            case ChatMessageType.FILE:
              //@ts-ignore

              console.warn('message', JSON.stringify(messages, null, 2));
              if (isGroupChat) {
                showMessageNotification(
                  file_name,
                  from,
                  false,
                  ChatMessageType.FILE,
                );
                addMessageToStore(Number(from), {
                  msg: '',
                  createdTimestamp: localTime,
                  msgId: msgId,
                  isDeleted: false,
                  type: ChatMessageType.FILE,
                  url: file_url,
                  ext: file_ext,
                  fileName: file_name,
                });
              }
              if (isPeerChat) {
                showMessageNotification(
                  file_name,
                  from,
                  true,
                  ChatMessageType.FILE,
                );
                addMessageToPrivateStore(
                  Number(from),
                  {
                    msg: '',
                    createdTimestamp: localTime,
                    msgId: msgId,
                    isDeleted: false,
                    type: ChatMessageType.FILE,
                    url: file_url,
                    ext: file_ext,
                    fileName: file_name,
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
      console.warn('chatSDK native:init', $config.CHAT_ORG_NAME);
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

  const sendChatSDKMessage = (
    option: ChatOption,
    callback: ChatMessageStatusCallback,
  ) => {
    const {type, to, msg, chatType, from, url = ''} = option;
    let file_ext = '';
    const chatMsgChatType =
      chatType === 'singleChat'
        ? ChatMessageChatType.PeerChat
        : ChatMessageChatType.GroupChat;
    let chatMsg: ChatMessage;
    switch (type) {
      case ChatMessageType.TXT:
        chatMsg = ChatMessage.createTextMessage(to, msg, chatMsgChatType);
        break;
      case ChatMessageType.IMAGE:
        chatMsg = ChatMessage.createImageMessage(to, url, chatMsgChatType);
        chatMsg.attributes = {
          file_length: option?.ext?.file_length,
          file_ext: option?.ext?.file_ext,
          file_name: option?.ext?.file_name,
          file_url: option?.ext?.file_url, // this local url , when upload util is available for native then will use it
          from_platform: 'native',
        };

        console.warn('Image msg to be sent', chatMsg);
        break;
      case ChatMessageType.FILE:
        file_ext = option?.ext?.file_ext.split('/')[1];
        chatMsg = ChatMessage.createFileMessage(to, url, chatMsgChatType, {
          displayName: option?.fileName,
        });
        chatMsg.attributes = {
          file_length: option?.ext?.file_length,
          file_ext: file_ext,
          file_name: option?.fileName,
          file_url: option?.url, // this local url , when upload util is available for native then will use it
          from_platform: 'native',
        };
        console.warn('File msg to be sent', chatMsg);
        break;
    }
    //
    chatClient.chatManager
      .sendMessage(chatMsg, callback)
      .then(() => {
        // log here if the method call succeeds.
        console.warn('send message success');
        const localFileUrl = option?.url || '';
        // add to local store of sender
        // for image and file msgs we will update on upload success of chatAttachment.native
        if (type === ChatMessageType.TXT) {
          const messageData = {
            msg: option.msg.replace(/^(\n)+|(\n)+$/g, ''),
            createdTimestamp: timeNow(),
            msgId: chatMsg.msgId,
            isDeleted: false,
            type: option.type,
            thumb: localFileUrl,
            url: localFileUrl,
            ext: file_ext,
            fileName: option?.fileName,
          };

          // this is local user messages
          if (option.chatType === 'singleChat') {
            addMessageToPrivateStore(Number(option.to), messageData, true);
          } else {
            addMessageToStore(Number(option.from), messageData);
          }
        }
      })
      .catch(reason => {
        //log here if the method call fails.
        console.warn('send message fail.', reason);
      });
  };

  const downloadAttachment = (fileName: string, fileUrl: string) => {
    console.warn(fileName);
    RNFetchBlob.fs
      .writeFile(fileUrl, 'utf8')
      .then(() => {
        Share.open({url: `file://${fileUrl}`})
          .then(res => {
            console.warn('File shared successfully:', res);
          })
          .catch(error => {
            console.error('Error sharing file:', error);
          });
      })
      .catch(error => {
        console.error('Error downloading content:', error);
      });
  };

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

  const deleteAttachment = (msgId, recallFromUser, chatType) => {
    const chatMsgChatType =
      chatType === 'singleChat'
        ? ChatMessageChatType.PeerChat
        : ChatMessageChatType.GroupChat;

    chatClient.chatManager
      .recallMessage(msgId)
      .then(() => {
        console.warn('recall message success');
      })
      .catch(reason => {
        console.warn('recall message fail.', reason);
      });
  };

  return (
    <chatConfigureContext.Provider
      value={{
        open,
        setOpen,
        deleteChatUser,
        sendChatSDKMessage,
        downloadAttachment,
        deleteAttachment,
      }}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
