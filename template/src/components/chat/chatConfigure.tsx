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
import {err} from 'react-native-svg/lib/typescript/xml';

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
        // disable Chat SDK logs
        AgoraChat.logger.disableAll();
        const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
        // Initializes the Web client.
        newConn = new AgoraChat.connection({
          appKey: CHAT_APP_KEY,
        });
        // Logs into Agora Chat.
        const result = await newConn.open({
          user: data?.uid?.toString(),
          agoraToken: data.chat.user_token,
        });
        logger.log(
          LogSource.Internals,
          'CHAT',
          `Logged in User ${data.uid} to Agora Chat Server`,
        );

        //  event listener for messages
        newConn.addEventHandler('connection&message', {
          // app is connected to chat server
          onConnected: () => {
            logger.log(
              LogSource.Internals,
              'CHAT',
              `User  ${data.uid} connected to Agora Chat Server`,
            );
          },

          onFileMessage: message => {
            if (message?.ext?.channel !== data?.channel) {
              return;
            }
            logger.debug(
              LogSource.Internals,
              'CHAT',
              `Received File Message`,
              message,
            );
            const fileUrl =
              message.ext?.from_platform === 'native'
                ? message.url
                : message.ext.file_url;

            const fromUser = message?.from;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                false,
                message.type,
              );

              addMessageToStore(Number(fromUser), {
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
                fromUser,
                true,
                message.type,
              );
              addMessageToPrivateStore(
                Number(fromUser),
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
            if (message?.ext?.channel !== data?.channel) {
              return;
            }
            logger.debug(
              LogSource.Internals,
              'CHAT',
              `Received Img Message`,
              message,
            );
            const fileUrl =
              message.ext?.from_platform === 'native'
                ? message.url
                : message.ext.file_url;

            const fromUser = message?.from;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                false,
                message.type,
              );
              addMessageToStore(Number(fromUser), {
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
                fromUser,
                true,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(fromUser),
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
            if (message?.ext?.channel !== data?.channel) {
              return;
            }
            logger.debug(
              LogSource.Internals,
              'CHAT',
              `Received Text Message`,
              message,
            );

            const fromUser = message?.from;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              // show to notifcation- group msg received
              showMessageNotification(
                message.msg,
                fromUser,
                false,
                message.type,
              );
              addMessageToStore(Number(fromUser), {
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
                fromUser,
                true,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(fromUser),
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
            logger.log(LogSource.Internals, 'CHAT', 'ChatSDK Token expired');
          },
          onError: error => {
            logger.error(LogSource.Internals, 'CHAT', 'ChatSDK Error', error);
          },
        });
        connRef.current = newConn;
      } catch (error) {
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
      logger.log(
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
      //add channel name so to prevent cross channel message mixup when same user joins two diff channels
      // this is filtered on msgRecived event
      option.ext = {...option?.ext, channel: data?.channel};
      //@ts-ignore
      const msg = AgoraChat.message.create(option);
      connRef.current
        .send(msg)
        .then(res => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            'Succesfully sent chat message',
            option,
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
            addMessageToPrivateStore(Number(option?.to), messageData, true);
          } else {
            addMessageToStore(Number(option?.from), messageData);
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
    return; //  worker will handle this
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
        setUploadStatus(UploadStatus.IN_PROGRESS);
      },
      onFileUploadComplete: (data: any) => {
        const url = `${data.uri}/${data.entities[0].uuid}?em-redirect=true&share-secret=${data.entities[0]['share-secret']}`;
        //TODO: handle for multiple uploads
        setUploadedFiles(prev => {
          return [{...prev[0], file_url: url}];
        });
        setUploadStatus(UploadStatus.SUCCESS);
      },
      onFileUploadError: (error: any) => {
        logger.error(
          LogSource.Internals,
          'CHAT',
          'Attachment upload failed',
          error,
        );
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
          logger.debug(
            LogSource.Internals,
            'CHAT',
            'Chat Message Reacalled Success',
            res,
          );
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
