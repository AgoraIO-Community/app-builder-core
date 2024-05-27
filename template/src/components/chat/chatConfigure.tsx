import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';

import {UidType, useContent} from 'customization-api';
import {
  ChatMessageType,
  ChatOption,
  SDKChatType,
  useChatMessages,
} from '../chat-messages/useChatMessages';
import {timeNow} from '../../rtm/utils';
import StorageContext from '../StorageContext';
import {
  File,
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

export interface FileObj {
  url: string;
  filename: string;
  filetype: string;
  data: File;
}

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendChatSDKMessage: (option: ChatOption, messageStatusCallback?: any) => void;
  deleteChatUser: () => void;
  downloadAttachment: (fileName: string, fileUrl: string) => void;
  uploadAttachment: (fileObj: object) => void;
  deleteAttachment: (
    msgId: string,
    recallFromUser?: string,
    chatType?: SDKChatType,
  ) => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    sendChatSDKMessage: () => {},
    deleteChatUser: () => {},
    downloadAttachment: () => {},
    uploadAttachment: () => {},
    deleteAttachment: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const {privateChatUser, setUploadStatus, setUploadedFiles, uploadedFiles} =
    useChatUIControls();
  const defaultContentRef = React.useRef(defaultContent);
  const {
    addMessageToPrivateStore,
    showMessageNotification,
    addMessageToStore,
    removeMessageFromPrivateStore,
    removeMessageFromStore,
  } = useChatMessages();
  const {store} = React.useContext(StorageContext);

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  let newConn = null;

  useEffect(() => {
    const initializeChatSDK = async () => {
      try {
        const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
        // Initializes the Web client.
        newConn = new AgoraChat.connection({
          appKey: CHAT_APP_KEY,
        });
        // Logs into Agora Chat.
        const result = await newConn.open({
          user: data.uid.toString(),
          agoraToken: data.chat.user_token,
        });
        logger.debug(
          LogSource.Internals,
          'CHAT',
          `Logged in User ${data.uid} to Agora Chat Server`,
        );

        //  event listener for messages
        newConn.addEventHandler('connection&message', {
          // app is connected to chat server
          onConnected: () => {
            console.log('%cChatSDK: connected to chat server', 'color: blue');
          },

          onFileMessage: message => {
            const fileUrl =
              message.ext?.from_platform === 'native'
                ? message.url
                : message.ext.file_url;
            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                message.from,
                false,
                message.type,
              );

              addMessageToStore(Number(message.from), {
                msg: '',
                createdTimestamp: message.time,
                msgId: message.id,
                isDeleted: false,
                type: ChatMessageType.FILE,
                url: fileUrl,
                ext: message.ext.file_ext,
                fileName: message.ext.file_name,
              });
            }
            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                message.from,
                true,
                message.type,
              );
              addMessageToPrivateStore(
                Number(message.from),
                {
                  msg: '',
                  createdTimestamp: message.time,
                  msgId: message.id,
                  isDeleted: false,
                  type: ChatMessageType.FILE,
                  url: fileUrl,
                  ext: message.ext.file_ext,
                  fileName: message.ext.file_name,
                },
                false,
              );
            }
          },
          onImageMessage: message => {
            const fileUrl =
              message.ext?.from_platform === 'native'
                ? message.url
                : message.ext.file_url;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                message.from,
                false,
                message.type,
              );
              addMessageToStore(Number(message.from), {
                msg: '',
                createdTimestamp: message.time,
                msgId: message.id,
                isDeleted: false,
                type: ChatMessageType.IMAGE,
                thumb: fileUrl + '&thumbnail=true',
                url: fileUrl,
                fileName: message.ext?.file_name,
              });
            }
            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              // show to notifcation- privat msg received
              showMessageNotification(
                message.ext.file_name,
                message.from,
                true,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(message.from),
                {
                  msg: '',
                  createdTimestamp: message.time,
                  msgId: message.id,
                  isDeleted: false,
                  type: ChatMessageType.IMAGE,
                  thumb: fileUrl + '&thumbnail=true',
                  url: fileUrl,
                  fileName: message.ext?.file_name,
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

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              // show to notifcation- group msg received
              showMessageNotification(
                message.msg,
                message.from,
                false,
                message.type,
              );
              addMessageToStore(Number(message.from), {
                msg: message.msg.replace(/^(\n)+|(\n)+$/g, ''),
                createdTimestamp: message.time,
                msgId: message.id,
                isDeleted: false,
                type: ChatMessageType.TXT,
              });
            }

            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              // show to notifcation- privat msg received
              showMessageNotification(
                message.msg,
                message.from,
                true,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(message.from),
                {
                  msg: message.msg.replace(/^(\n)+|(\n)+$/g, ''),
                  createdTimestamp: message.time,
                  msgId: message.id,
                  isDeleted: false,
                  type: ChatMessageType.TXT,
                },
                false,
              );
            }
          },

          onRecallMessage: message => {
            const isGroupChat = message.to === data.chat.group_id;
            if (isGroupChat) {
              removeMessageFromStore(message.mid, true);
            } else {
              removeMessageFromPrivateStore(message.mid, true);
            }
          },
          // on token expired
          onTokenExpired: () => {
            console.log('%cChatSDK: token has expired', 'color: blue');
          },
          onError: error => {
            console.log('%cChatSDK: error', 'color: blue', error);
          },
        });
        connRef.current = newConn;
        logger.debug(LogSource.Internals, 'CHAT', 'Initialized Chat SDK');
      } catch (error) {
        console.log(
          '%cChatSDK: initialization error: %s',
          'color: red',
          JSON.stringify(error, null, 2),
        );
        logger.error(
          LogSource.Internals,
          'CHAT',
          'Initialization Error Chat SDK',
          error,
        );
      }
    };

    // initializing chat sdk
    initializeChatSDK();
    return () => {
      newConn.close();
      logger.debug(
        LogSource.Internals,
        'CHAT',
        `Logging out User ${data.uid} from Agora Chat Server`,
      );
    };
  }, []);

  const sendChatSDKMessage = (
    option: ChatOption,
    messageStatusCallback?: any,
  ) => {
    if (connRef.current) {
      //TODO thumb and url of actual image uploaded available in file upload complete
      const localFileUrl = option?.ext?.file_url || '';
      //@ts-ignore
      const msg = AgoraChat.message.create(option);
      connRef.current
        .send(msg)
        .then(res => {
          console.log(
            '%cChatSDK: Send  msg success: %s',
            'color: blue',
            JSON.stringify(res, null, 2),
          );
          // update local messagre store
          const messageData = {
            msg: option.msg.replace(/^(\n)+|(\n)+$/g, ''),
            createdTimestamp: timeNow(),
            msgId: res?.serverMsgId,
            isDeleted: false,
            type: option.type,
            thumb: option?.ext?.file_url + '&thumbnail=true',
            url: option?.ext?.file_url,
            ext: option?.ext?.file_ext,
            fileName: option?.ext?.file_name,
          };
          //todo chattype as per natue type
          // this is local user messages
          if (option.chatType === SDKChatType.SINGLE_CHAT) {
            addMessageToPrivateStore(Number(option.to), messageData, true);
          } else {
            addMessageToStore(Number(option.from), messageData);
          }
        })
        .catch(error => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            'Failed sending chat message',
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
    try {
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
      sessionStorage.removeItem('user_id');
      logger.debug(
        LogSource.Internals,
        'CHAT',
        `User ${userID} deleted from Chat Server`,
      );
      return res;
    } catch (error) {
      logger.debug(
        LogSource.Internals,
        'CHAT',
        `Failed deleting User ${userID} from Chat Server`,
        error,
      );
    }
  };

  const downloadAttachment = (fileName: string, fileUrl: string) => {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.target = '_blank';
    anchor.download = fileName;
    anchor.click();
    anchor.remove();
  };

  const uploadAttachment = uploadFiles => {
    const {file_type, file_length, file_name, file_url, file_obj, file_ext} =
      uploadFiles;
    const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
    const uploadObj = {
      onFileUploadProgress: (data: ProgressEvent) => {
        console.log('Chat-SDK: upload inprogress', data);
        setUploadStatus(UploadStatus.IN_PROGRESS);
      },
      onFileUploadComplete: (data: any) => {
        console.log('Chat-SDK: upload success', data);
        const url = `${data.uri}/${data.entities[0].uuid}?em-redirect=true&share-secret=${data.entities[0]['share-secret']}`;
        //TODO: handle for multiple uploads
        setUploadedFiles(prev => {
          return [{...prev[0], file_url: url}];
        });
        setUploadStatus(UploadStatus.SUCCESS);
      },
      onFileUploadError: (error: any) => {
        console.log('Chat-SDK: upload error', error);
        logger.error(LogSource.Internals, 'CHAT', 'Attachment upload failed');
        setUploadStatus(UploadStatus.FAILURE);
      },
      onFileUploadCanceled: () => {
        //setUploadStatus(UploadStatus.NOT_STARTED);
      },
      accessToken: data?.chat?.user_token,
      appKey: CHAT_APP_KEY,
      file: file_obj,
      apiUrl: $config.CHAT_URL,
    };

    try {
      AgoraChat.utils.uploadFile(uploadObj);
    } catch (error) {
      logger.debug(
        LogSource.Internals,
        'CHAT',
        'Attachment upload failed',
        error,
      );
      console.error(error);
    }
  };

  const deleteAttachment = (
    msgId: string,
    recallFromUser: string,
    chatType: SDKChatType,
  ) => {
    const option = {mid: msgId, to: recallFromUser, chatType};
    if (connRef.current) {
      connRef.current
        .recallMessage(option)
        .then(res => {
          console.log('recall success', res);
        })
        .catch(err => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            'Chat Message Reacalled Failed',
            err,
          );
        });
    }
  };

  return (
    <chatConfigureContext.Provider
      value={{
        open,
        setOpen,
        sendChatSDKMessage,
        deleteChatUser,
        downloadAttachment,
        uploadAttachment,
        deleteAttachment,
      }}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
