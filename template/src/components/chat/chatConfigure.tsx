import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';

import {useContent} from 'customization-api';
import {useSDKChatMessages} from './useSDKChatMessages';
import {timeNow} from '../../rtm/utils';
import StorageContext from '../StorageContext';

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

export interface FileObj {
  url: string;
  filename: string;
  filetype: string;
  data: File;
}
export enum ChatMessageType {
  Img = 'img',
  Txt = 'txt',
  File = 'file',
}

interface ChatOption {
  chatType: string;
  type: ChatMessageType;
  from: string;
  to: string;
  msg?: string;
  file?: object;
  ext?: {file_length: number};
  onFileUploadError?: () => void;
  onFileUploadProgress?: (e: ProgressEvent) => void;
  onFileUploadComplete?: (e: any) => void;
}
interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendChatSDKMessage: (option: ChatOption) => void;
  sendGroupChatSDKMessage: (option: ChatOption) => void;
  deleteChatUser: () => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    sendChatSDKMessage: () => {},
    sendGroupChatSDKMessage: () => {},
    deleteChatUser: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const defaultContentRef = React.useRef(defaultContent);
  const {addMessageToPrivateStore, showMessageNotification, addMessageToStore} =
    useSDKChatMessages();
  const {store} = React.useContext(StorageContext);

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    const initializeChatSDK = async () => {
      try {
        const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
        // Initializes the Web client.
        const newConn = new AgoraChat.connection({
          appKey: CHAT_APP_KEY,
        });

        const createGroup = () => {
          const groupOption = {
            data: {
              groupname: 'Group',
              desc: 'Public Chat users',
              members: [], // start with local user
              public: true,
              approval: false,
              allowinvites: false,
              inviteNeedConfirm: false,
              maxusers: 100, // max 100 in free plan https://docs.agora.io/en/agora-chat/reference/pricing-plan-details?platform=web#group
            },
          };
          newConn
            .createGroup(groupOption)
            .then(res => {
              console.log(
                'ChatSDK : group created',
                JSON.stringify(res, null, 2),
              );
            })
            .catch(err => {
              console.log(
                'ChatSDK : error in created group',
                JSON.stringify(err, null, 2),
              );
            });
        };

        // Logs into Agora Chat.
        newConn.open({
          user: data.uid.toString(),
          // pwd: data.chatUserPwd,
          agoraToken: data.chat.user_token,
          success: e => {
            console.log('%cChatSDK: User is logged in', 'color: blue');
          },
          error: e => {
            console.log('%cChatSDK: User login failed', 'color: red');
          },
        });

        // create a chat group (Group for public chats), this should be only once ,if exists then user should only join not creatr grp

        //  event listener for messages
        newConn.addEventHandler('connection&message', {
          // app is connected to chat server
          onConnected: () => {
            console.log('%cChatSDK: connected to chat server', 'color: blue');
            // group will be created at server for a channel
            //createGroup();
          },

          onFileMessage: message => {
            debugger;
          },
          onImageMessage: message => {
            if (message.chatType === 'groupChat') {
              showMessageNotification(
                'You got group image msg',
                message.from,
                false,
              );
              addMessageToStore(Number(message.from), {
                msg: '',
                createdTimestamp: message.time,
                msgId: message.id,
                isDeleted: false,
                type: ChatMessageType.Img,
                thumb: message.thumb,
                url: message.url,
              });
            }
            if (message.chatType === 'singleChat') {
              // show to notifcation- privat msg received
              showMessageNotification(
                'You got private image msg',
                message.from,
                true,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(message.from),
                {
                  msg: '',
                  createdTimestamp: message.time,
                  msgId: message.id,
                  isDeleted: false,
                  type: ChatMessageType.Img,
                  thumb: message.thumb,
                  url: message.url,
                },
                false,
              );
            }
          },
          // text message is recieved
          onTextMessage: message => {
            console.log(
              '%cChatSDK: received msg: %s. from: %s',
              'color: blue',
              JSON.stringify(message, null, 2),
              defaultContentRef.current[message.from]?.name,
            );

            if (message.chatType === 'groupChat') {
              // show to notifcation- group msg received
              showMessageNotification(message.msg, message.from, false);
              addMessageToStore(Number(message.from), {
                msg: message.msg,
                createdTimestamp: message.time,
                msgId: message.id,
                isDeleted: false,
                type: ChatMessageType.Txt,
              });
            }

            if (message.chatType === 'singleChat') {
              // show to notifcation- privat msg received
              showMessageNotification(message.msg, message.from, true);
              // this is remote user messages
              addMessageToPrivateStore(
                Number(message.from),
                {
                  msg: message.msg,
                  createdTimestamp: message.time,
                  msgId: message.id,
                  isDeleted: false,
                  type: ChatMessageType.Txt,
                },
                false,
              );
            }
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

  const sendChatSDKMessage = (option: ChatOption) => {
    if (connRef.current) {
      //TODO thumb and url of actual image uploaded available in file upload complete
      const localFileUrl = option?.file?.url || '';
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
          // update local messagre store
          // debugger;
          const messageData = {
            msg: option.msg,
            createdTimestamp: timeNow(),
            msgId: msg.id,
            isDeleted: false,
            type: option.type,
            thumb: localFileUrl,
            url: localFileUrl,
          };
          // this is local user messages
          addMessageToPrivateStore(Number(option.to), messageData, true);
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

  const sendGroupChatSDKMessage = (option: ChatOption) => {
    if (connRef.current) {
      //TODO thumb and url of actual image uploaded available in file upload complete
      const localFileUrl = option?.file?.url || '';
      //@ts-ignore
      const msg = AgoraChat.message.create(option);
      connRef.current
        .send(msg)
        .then(res => {
          console.log(
            '%cChatSDK: Send Group msg success: %s',
            'color: blue',
            JSON.stringify(res, null, 2),
          );
          // update local messagre store
          const messageData = {
            msg: option.msg,
            createdTimestamp: timeNow(),
            msgId: msg.id,
            isDeleted: false,
            type: option.type,
            thumb: localFileUrl,
            url: localFileUrl,
          };
          // this is group msg
          addMessageToStore(Number(option.from), messageData);
        })
        .catch(error => {
          console.log(
            '%cChatSDK: Send Group msg fail: %s',
            'color: blue',
            error,
          );
        });
    }
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

  return (
    <chatConfigureContext.Provider
      value={{
        open,
        setOpen,
        sendChatSDKMessage,
        sendGroupChatSDKMessage,
        deleteChatUser,
      }}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
