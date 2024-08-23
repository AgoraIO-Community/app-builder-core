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
  ChatOption,
  SDKChatType,
  useChatMessages,
} from '../chat-messages/useChatMessages';
import {timeNow} from '../../rtm/utils';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import {PlatformColor} from 'react-native/types';

interface ChatMessageAttributes {
  file_ext?: string;
  file_name?: string;
  file_url?: string;
  from_platform?: string;
  file_type?: string;
  files?: Array<{
    file_length: number;
    file_ext: string;
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  channel?: string;
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
        logger.log(
          LogSource.Internals,
          'CHAT',
          `Logged out User ${localUid} from Agora Chat Server`,
        );
      } catch (error) {
        console.warn('logout failed');
        logger.log(
          LogSource.Internals,
          'CHAT',
          `Failed Logging  out User ${localUid} from Agora Chat Server`,
        );
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
          const fromUser = from;
          const {channel} = messages[0].attributes as ChatMessageAttributes;

          // prevent cross channel msgs
          if (channel !== data.channel) {
            return;
          }

          const {files, from_platform, file_name, file_type, file_ext} =
            messages[0].attributes as ChatMessageAttributes;

          const normalizedFiles =
            typeof files === 'string' ? JSON.parse(files) : files;

          switch (chatType) {
            case ChatMessageType.TXT:
              //@ts-ignore
              const chatContent = body.content;
              if (isGroupChat) {
                showMessageNotification(chatContent, fromUser, false);
                addMessageToStore(Number(fromUser), {
                  msg: chatContent.replace(/^(\n)+|(\n)+$/g, ''),
                  createdTimestamp: localTime,
                  msgId: msgId,
                  isDeleted: false,
                  type: ChatMessageType.TXT,
                });
              }
              if (isPeerChat) {
                showMessageNotification(chatContent, fromUser, true);
                addMessageToPrivateStore(
                  Number(fromUser),
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
            case ChatMessageType.FILE:
              // All multiple attachments from web will be received here.
              if (from_platform === 'web') {
                normalizedFiles.forEach(file => {
                  const thumbImg =
                    from_platform === 'web'
                      ? file.file_url + '&thumbnail=true'
                      : (body as {thumbnailRemotePath?: string})
                          .thumbnailRemotePath;
                  const messageData = {
                    msg: '',
                    createdTimestamp: localTime,
                    msgId: msgId,
                    isDeleted: false,
                    type: ChatMessageType.FILE,
                    fileName: file.file_name,
                    fileType: file.file_type,
                    url: file.file_url,
                    ext: file.file_ext,
                    thumb: thumbImg,
                  };
                  console.warn(
                    'message file',
                    JSON.stringify(messageData, null, 2),
                  );

                  if (isGroupChat) {
                    showMessageNotification(
                      file.file_name,
                      fromUser,
                      false,
                      file.file_type as ChatMessageType,
                    );
                    addMessageToStore(Number(fromUser), messageData);
                  }
                  if (isPeerChat) {
                    showMessageNotification(
                      file.file_name,
                      fromUser,
                      true,
                      file.file_type as ChatMessageType,
                    );
                    addMessageToPrivateStore(
                      Number(fromUser),
                      messageData,
                      false,
                    );
                  }
                });
              }

              // single attachment from native will be received here.
              if (from_platform === 'native') {
                const thumbImg =
                  (body as {thumbnailRemotePath?: string})
                    ?.thumbnailRemotePath + '?thumbnail=true';
                const fileUrl = (body as {remotePath?: string})?.remotePath;
                const messageData = {
                  msg: '',
                  createdTimestamp: localTime,
                  msgId: msgId,
                  isDeleted: false,
                  type: ChatMessageType.FILE,
                  fileName: file_name,
                  fileType: file_type,
                  url: fileUrl,
                  ext: file_ext,
                  thumb: thumbImg,
                };
                if (isGroupChat) {
                  showMessageNotification(
                    file_name,
                    fromUser,
                    false,
                    file_type as ChatMessageType,
                  );
                  addMessageToStore(Number(fromUser), messageData);
                }
                if (isPeerChat) {
                  showMessageNotification(
                    file_name,
                    fromUser,
                    true,
                    file_type as ChatMessageType,
                  );
                  addMessageToPrivateStore(
                    Number(fromUser),
                    messageData,
                    false,
                  );
                }
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
          await chatClient.loginWithAgoraToken(localUid, agoraToken);
          console.warn('chat sdk: login success');
          logger.log(
            LogSource.Internals,
            'CHAT',
            `Logged in Native User ${localUid} to Agora Chat Server`,
          );
          setupMessageListener();
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
              logger.log(
                LogSource.Internals,
                'CHAT',
                `Native User ${localUid} to connected to Agora Chat Server`,
              );
            },
            onDisconnected() {
              console.warn('onDisconnected:');
            },
          };
          chatClient.addConnectionListener(listener);
        } catch (error) {
          console.warn(
            'chat sdk: login failed ',
            JSON.stringify(error, null, 2),
          );
          logger.error(
            LogSource.Internals,
            'CHAT',
            `Failed Logging Native User ${localUid} from Agora Chat Server`,
            error,
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
      chatType === SDKChatType.SINGLE_CHAT
        ? ChatMessageChatType.PeerChat
        : ChatMessageChatType.GroupChat;
    let chatMsg: ChatMessage;
    switch (type) {
      case ChatMessageType.TXT:
        chatMsg = ChatMessage.createTextMessage(to, msg, chatMsgChatType);
        chatMsg.attributes = {
          channel: data.channel,
        };
        break;
      case ChatMessageType.IMAGE:
        chatMsg = ChatMessage.createImageMessage(to, url, chatMsgChatType);
        chatMsg.attributes = {
          file_length: option?.ext?.files[0].file_length,
          file_ext: option?.ext?.files[0].file_ext,
          file_name: option?.ext?.files[0].file_name,
          file_url: option?.ext?.files[0].file_url, // this local url , when upload util is available for native then will use it
          file_type: option?.ext?.files[0].file_type, // this local url , when upload util is available for native then will use it
          from_platform: 'native',
          channel: data.channel,
        };

        console.warn('Image msg to be sent', chatMsg);
        break;
      case ChatMessageType.FILE:
        file_ext = option?.ext.files[0].file_ext.split('/')[1];
        chatMsg = ChatMessage.createFileMessage(to, url, chatMsgChatType, {
          displayName: option?.ext?.files[0].file_name,
        });
        console.warn('option', option);
        chatMsg.attributes = {
          file_length: option?.ext?.files[0].file_length,
          file_ext: option?.ext?.files[0].file_ext,
          file_name: option?.ext?.files[0].file_name,
          file_url: option?.ext?.files[0].file_url, // this local url , when upload util is available for native then will use it
          file_type: option?.ext?.files[0].file_type,
          from_platform: 'native',
          channel: data.channel,
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
        // add to local store of sender
        // for image and file msgs we will update on upload success of chatAttachment.native
        if (type === ChatMessageType.TXT) {
          const messageData = {
            msg: option.msg.replace(/^(\n)+|(\n)+$/g, ''),
            createdTimestamp: timeNow(),
            msgId: chatMsg.msgId,
            isDeleted: false,
            type: option.type,
          };

          // this is local user messages
          if (option.chatType === SDKChatType.SINGLE_CHAT) {
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
    console.warn('fileUrl', fileName);
    const source = fileUrl;
    const {dirs} = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true,
      appendExt: fileName.split('.')[1],
      path: `${dirs.DocumentDir}/${fileName}`,
    })
      .fetch('GET', source)
      .then(res => {
        const filePath = res.path();
        // Share the downloaded file
        Share.open({
          url: `file://${filePath}`,
          title: 'Share File',
          filename: fileName, // Set the filename for sharing
        })
          .then(() => {
            console.log('File shared successfully');
          })
          .catch(error => {
            console.error('Error sharing file:', error);
          });
      })
      .catch(err => console.log('BLOB ERROR -> ', err));
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

  const deleteAttachment = (msgId: string) => {
    chatClient.chatManager
      .recallMessage(msgId)
      .then(() => {
        console.warn('recall message success');
      })
      .catch(err => {
        logger.debug(
          LogSource.Internals,
          'CHAT',
          'Chat Message Reacalled Failed',
          err,
        );
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
