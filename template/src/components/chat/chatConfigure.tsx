import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useLocalUid} from '../../../agora-rn-uikit';

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
  ChatType,
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
  addReaction: (messageId: string, reaction: string) => void;
  removeReaction: (messageId: string, reaction: string) => void;
  pinMessage: (messageId: string) => void;
  unPinMessage: (messageId: string) => void;
  leaveGroupChat: (groupId: string) => Promise<any>;
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
    addReaction: () => {},
    removeReaction: () => {},
    pinMessage: () => {},
    unPinMessage: () => {},
    leaveGroupChat: async () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const connRef = React.useRef(null);
  const {defaultContent} = useContent();
  const {
    privateChatUser,
    setUploadStatus,
    setUploadedFiles,
    uploadedFiles,
    setPinMsgId,
    setPinnedByUser,
    setChatConnectionStatus,
    chatType,
    currentGroupChatId,
  } = useChatUIControls();
  const localUid = useLocalUid();
  const defaultContentRef = React.useRef(defaultContent);
  const {
    addMessageToPrivateStore,
    showMessageNotification,
    addMessageToStore,
    addMessageToBreakoutStore,
    removeMessageFromPrivateStore,
    removeMessageFromStore,
    addReactionToStore,
    addReactionToPrivateStore,
    addReactionToBreakoutStore,
  } = useChatMessages();
  const {store} = React.useContext(StorageContext);

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  let newConn = null;
  const chatConnectedRef = React.useRef(false);

  useEffect(() => {
    const initializeChatSDK = async () => {
      try {
        // disable Chat SDK logs
        AgoraChat.logger.disableAll();
        const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
        // Initializes the Web client.
        newConn = new AgoraChat.connection({
          appKey: CHAT_APP_KEY,
          isFixedDeviceId: false,
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
            setChatConnectionStatus('connected');
            chatConnectedRef.current = true;
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
            const msgId = message.id;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                message.to === data.chat.group_id
                  ? ChatType.Group
                  : ChatType.BreakoutGroupChat,
                message.type,
              );

              const messageData = {
                msg: message?.ext?.msg,
                createdTimestamp: message.time,
                msgId,
                isDeleted: false,
                type: ChatMessageType.FILE,
                url: fileUrl,
                ext: message.ext.file_ext,
                fileName: message.ext.file_name,
                replyToMsgId: message.ext?.replyToMsgId,
              };

              if (message.to === data.chat.group_id) {
                // This is a public main room file message
                addMessageToStore(Number(fromUser), messageData);
              } else {
                // This is a breakout room file message
                addMessageToBreakoutStore(Number(fromUser), messageData);
              }
            }
            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                ChatType.Private,
                message.type,
              );
              addMessageToPrivateStore(
                Number(fromUser),
                {
                  msg: message?.ext?.msg,
                  createdTimestamp: message.time,
                  msgId,
                  isDeleted: false,
                  type: ChatMessageType.FILE,
                  url: fileUrl,
                  ext: message.ext.file_ext,
                  fileName: message.ext.file_name,
                  replyToMsgId: message.ext?.replyToMsgId,
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
            const msgId = message.id;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                message.to === data.chat.group_id
                  ? ChatType.Group
                  : ChatType.BreakoutGroupChat,
                message.type,
              );
              const messageData = {
                msg: message?.ext?.msg,
                createdTimestamp: message.time,
                msgId,
                isDeleted: false,
                type: ChatMessageType.IMAGE,
                thumb: fileUrl + '&thumbnail=true',
                url: fileUrl,
                fileName: message.ext?.file_name,
                replyToMsgId: message.ext?.replyToMsgId,
              };

              if (message.to === data.chat.group_id) {
                // This is a main room image message
                addMessageToStore(Number(fromUser), messageData);
              } else {
                // This is a breakout room image message
                addMessageToBreakoutStore(Number(fromUser), messageData);
              }
            }
            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              // show to notifcation- privat msg received
              showMessageNotification(
                message.ext.file_name,
                fromUser,
                ChatType.Private,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(fromUser),
                {
                  msg: message?.ext?.msg,
                  createdTimestamp: message.time,
                  msgId,
                  isDeleted: false,
                  type: ChatMessageType.IMAGE,
                  thumb: fileUrl + '&thumbnail=true',
                  url: fileUrl,
                  fileName: message.ext?.file_name,
                  replyToMsgId: message.ext?.replyToMsgId,
                },
                false,
              );
            }
          },
          // Text message is recieved, update receiver side ui
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
            const msgId = message.id;

            if (message.chatType === SDKChatType.GROUP_CHAT) {
              // show to notifcation- group msg received
              showMessageNotification(
                message.msg,
                fromUser,
                message.to === data.chat.group_id
                  ? ChatType.Group
                  : ChatType.BreakoutGroupChat,
                message.type,
              );

              const messageData = {
                msg: message.msg.replace(/^(\n)+|(\n)+$/g, ''),
                createdTimestamp: message.time,
                msgId,
                isDeleted: false,
                type: ChatMessageType.TXT,
                replyToMsgId: message.ext?.replyToMsgId,
                isAnnouncementText: message.ext?.isAnnouncementText || false,
              };

              if (message.to === data.chat.group_id) {
                // This is a main room message
                addMessageToStore(Number(fromUser), messageData);
              } else {
                // This is a breakout room message (any group ID that's not the main room)
                addMessageToBreakoutStore(Number(fromUser), messageData);
              }
            }

            if (message.chatType === SDKChatType.SINGLE_CHAT) {
              // show to notifcation- privat msg received
              showMessageNotification(
                message.msg,
                fromUser,
                ChatType.Private,
                message.type,
              );
              // this is remote user messages
              addMessageToPrivateStore(
                Number(fromUser),
                {
                  msg: message.msg.replace(/^(\n)+|(\n)+$/g, ''),
                  createdTimestamp: message.time,
                  msgId,
                  isDeleted: false,
                  type: ChatMessageType.TXT,
                  replyToMsgId: message.ext?.replyToMsgId,
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
          // to reciev pin message event
          onMessagePinEvent: options => {
            const {messageId, operation, operatorId} = options;
            operation === 'pin' ? setPinMsgId(messageId) : setPinMsgId('');
            setPinnedByUser(operatorId);
          },
          onError: error => {
            logger.error(LogSource.Internals, 'CHAT', 'ChatSDK Error', error);
          },
        });

        newConn.addEventHandler('REACTION', {
          onReactionChange: reactionMsg => {
            const {chatType, messageId, to, reactions, from} = reactionMsg;
            if (chatType === SDKChatType.GROUP_CHAT) {
              // Check if this is main room or breakout room reaction
              if (to === data.chat.group_id) {
                // Main room reaction
                addReactionToStore(messageId, reactions);
              } else {
                // Breakout room reaction
                addReactionToBreakoutStore(messageId, reactions);
              }
            }
            if (chatType === SDKChatType.SINGLE_CHAT) {
              const uid = localUid === Number(from) ? to : from;
              addReactionToPrivateStore(uid, messageId, reactions);
            }

            console.log(reactionMsg);
          },
        });
        connRef.current = newConn;
        console.log('supriya-chatdetails connRef created: ', connRef);
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'CHAT',
          'Initialization Error Chat SDK',
          error,
        );
      }
    };

    // On Connected event not recived from Agora Chat SDK
    setTimeout(() => {
      if (!chatConnectedRef.current) {
        setChatConnectionStatus('failed');
        logger.error(
          LogSource.Internals,
          'CHAT',
          `Chat connection timed out for user ${data.uid}. No onConnected received.`,
        );
      }
    }, 15000);
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
    console.log('supriya-chatdetails sendChatSDKMessage option', option);
    if (connRef.current) {
      console.log('supriya-chatdetails connRef: ', connRef);
      //TODO thumb and url of actual image uploaded available in file upload complete
      //add channel name so to prevent cross channel message mixup when same user joins two diff channels
      // this is filtered on msgRecived event
      console.log(
        'supriya-chatdetails connRef: ',
        option,
        option.ext,
        data?.channel,
      );
      option.ext = {...option?.ext, channel: data?.channel};
      //@ts-ignore
      const msg = AgoraChat.message.create(option);
      console.log('supriya-chatdetails msg: ', msg);
      connRef.current
        .send(msg)
        .then(res => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            'Succesfully sent chat message',
            option,
          );

          const messageData = {
            msg:
              option?.msg?.replace(/^(\n)+|(\n)+$/g, '') ||
              option?.ext?.msg?.replace(/^(\n)+|(\n)+$/g, ''),
            createdTimestamp: timeNow(),
            msgId: res?.serverMsgId,
            isDeleted: false,
            type: option.type,
            thumb: option?.ext?.file_url + '&thumbnail=true',
            url: option?.ext?.file_url,
            ext: option?.ext?.file_ext,
            fileName: option?.ext?.file_name,
            replyToMsgId: option?.ext?.replyToMsgId,
            isAnnouncementText: option?.ext?.isAnnouncementText,
          };
          console.log(
            'supriya-chatdetails messageData after send: ',
            messageData,
          );
          console.log(
            'supriya-chatdetails messageData after send option ext: ',
            option?.ext,
          );

          // update local user message store
          if (option.chatType === SDKChatType.SINGLE_CHAT) {
            addMessageToPrivateStore(Number(option?.to), messageData, true);
          } else if (option.to === data.chat.group_id) {
            // Regular group chat messages (main room)
            addMessageToStore(Number(option?.from), messageData);
          } else {
            // This is a breakout room message (different group ID than main room)
            addMessageToBreakoutStore(Number(option?.from), messageData);
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

  const uploadAttachment = async uploadFiles => {
    const {file_obj} = uploadFiles;
    const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;

    return new Promise((resolve, reject) => {
      const uploadObj = {
        onFileUploadProgress: (data: ProgressEvent) => {
          setUploadedFiles(prev => {
            const updatedFiles = [...prev];
            updatedFiles[updatedFiles.length - 1] = {
              ...updatedFiles[updatedFiles.length - 1],
              upload_status: UploadStatus.IN_PROGRESS,
            };
            return updatedFiles;
          });
        },
        onFileUploadComplete: (data: any) => {
          const url = `${data.uri}/${data.entities[0].uuid}?em-redirect=true&share-secret=${data.entities[0]['share-secret']}`;

          setUploadedFiles(prev => {
            const updatedFiles = [...prev];
            updatedFiles[updatedFiles.length - 1] = {
              ...updatedFiles[updatedFiles.length - 1],
              file_url: url,
              upload_status: UploadStatus.SUCCESS,
            };
            return updatedFiles;
          });
          resolve(url);
        },
        onFileUploadError: (error: any) => {
          logger.error(
            LogSource.Internals,
            'CHAT',
            'Attachment upload failed',
            error,
          );
          //setUploadStatus(UploadStatus.FAILURE);
          setUploadedFiles(prev => {
            const updatedFiles = [...prev];
            updatedFiles[updatedFiles.length - 1] = {
              ...updatedFiles[updatedFiles.length - 1],
              upload_status: UploadStatus.FAILURE,
            };
            return updatedFiles;
          });
          reject(error);
        },
        onFileUploadCanceled: () => {
          //setUploadStatus(UploadStatus.NOT_STARTED);
        },
        accessToken: data?.chat?.user_token,
        appKey: CHAT_APP_KEY,
        file: file_obj,
        apiUrl: $config.CHAT_URL,
      };

      AgoraChat.utils.uploadFile(uploadObj);
    });
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

  const addReaction = (messageId: string, reaction: string) => {
    if (connRef.current) {
      connRef.current
        .addReaction({messageId, reaction})
        .then(res => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Chat Reaction Added to mid ${messageId}`,
            res,
          );
        })
        .catch(err => {
          if (err.type === 1101) {
            // If user already added reaction then remove it
            removeReaction(messageId, reaction);
          } else {
            logger.debug(
              LogSource.Internals,
              'CHAT',
              `Chat Reaction Addition Failed for mid ${messageId} - ${err?.message}`,
              err,
            );
          }
        });
    }
  };

  const removeReaction = (messageId: string, reaction: string) => {
    if (connRef.current) {
      connRef.current
        .deleteReaction({messageId, reaction})
        .then(res => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Chat Reaction Removed to mid ${messageId}`,
            res,
          );
        })
        .catch(err => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Chat Reaction Removal Failed for mid ${messageId}`,
            err,
          );
        });
    }
  };

  const pinMessage = (messageId: string) => {
    if (connRef.current) {
      // Use breakout room group ID if in breakout room, otherwise use main room group ID
      const conversationId =
        chatType === ChatType.BreakoutGroupChat && currentGroupChatId
          ? currentGroupChatId
          : data.chat.group_id;

      connRef.current
        .pinMessage({
          conversationId,
          conversationType: SDKChatType.GROUP_CHAT,
          messageId,
        })
        .then(res => {
          setPinMsgId(messageId);
          setPinnedByUser(localUid);
          //
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Successfully Pinned message with id ${messageId}`,
            res,
          );
        })
        .catch(err => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Failed to Pin Message with id ${messageId}`,
            err,
          );
        });
    }
  };

  const unPinMessage = (messageId: string) => {
    if (connRef.current) {
      // Use breakout room group ID if in breakout room, otherwise use main room group ID
      const conversationId =
        chatType === ChatType.BreakoutGroupChat && currentGroupChatId
          ? currentGroupChatId
          : data.chat.group_id;

      connRef.current
        .unpinMessage({
          conversationId,
          conversationType: SDKChatType.GROUP_CHAT,
          messageId,
        })
        .then(res => {
          setPinMsgId('');
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Successfully Unpinned message with id ${messageId}`,
            res,
          );
        })
        .catch(err => {
          logger.debug(
            LogSource.Internals,
            'CHAT',
            `Failed to Unpin Message with id ${messageId}`,
            err,
          );
        });
    }
  };

  const blockGroupMember = () => {};

  const unBlockGroupMember = () => {};

  // const createGroupChat = async (groupId: string, groupName: string) => {
  //   console.log(
  //     'supriya-chatdetails createGroupChat groupId: ',
  //     groupId,
  //     groupName,
  //   );
  //   try {
  //     // const myresponse = await connRef.current.getPublicGroups();
  //     // console.log(
  //     //   'supriya-chatdetails current public groups result: ',
  //     //   myresponse,
  //     // );
  //     // return;
  //     const result = await connRef.current.createGroup({
  //       data: {
  //         groupname: groupName,
  //         desc: `Breakout room chat for ${groupName}`,
  //         members: [],
  //         public: false,
  //         approval: false,
  //         allowinvites: true,
  //         inviteNeedConfirm: false,
  //         maxusers: 200, // Adding required maxusers parameter
  //       },
  //     });
  //     console.log('supriya-chatdetails result create group: ', result);
  //     logger.log(
  //       LogSource.Internals,
  //       'CHAT',
  //       `Created breakout group chat: ${groupId}`,
  //       result,
  //     );
  //     return result;
  //   } catch (error) {
  //     // Check if group already exists
  //     if (
  //       error.error_description?.includes('already exists') ||
  //       error.error_description?.includes('duplicate')
  //     ) {
  //       logger.log(
  //         LogSource.Internals,
  //         'CHAT',
  //         `Breakout group chat already exists: ${groupId}`,
  //       );
  //       return {success: true, alreadyExists: true};
  //     }

  //     logger.error(
  //       LogSource.Internals,
  //       'CHAT',
  //       `Failed to create breakout group chat: ${groupId}`,
  //       error,
  //     );
  //     throw error;
  //   }
  // };

  // const joinGroupChat = async (groupId: string) => {
  //   try {
  //     const result = await connRef.current.joinGroup({
  //       groupId: groupId,
  //     });
  //     logger.log(
  //       LogSource.Internals,
  //       'CHAT',
  //       `Joined breakout group chat: ${groupId}`,
  //       result,
  //     );
  //     return result;
  //   } catch (error) {
  //     // Check if user is already in the group
  //     if (
  //       error.error === 'forbidden_op' &&
  //       error.error_description?.includes('already in group')
  //     ) {
  //       logger.log(
  //         LogSource.Internals,
  //         'CHAT',
  //         `User already in breakout group chat: ${groupId}`,
  //       );
  //       return {success: true, alreadyMember: true};
  //     }

  //     logger.error(
  //       LogSource.Internals,
  //       'CHAT',
  //       `Failed to join breakout group chat: ${groupId}`,
  //       error,
  //     );
  //     throw error;
  //   }
  // };

  const leaveGroupChat = async (groupId: string) => {
    try {
      const result = await connRef.current.leaveGroup({
        groupId: groupId,
      });
      logger.log(
        LogSource.Internals,
        'CHAT',
        `Left breakout group chat: ${groupId}`,
        result,
      );
      return result;
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'CHAT',
        `Failed to leave breakout group chat: ${groupId}`,
        error,
      );
      throw error;
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
        addReaction,
        removeReaction,
        pinMessage,
        unPinMessage,
        leaveGroupChat,
      }}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;
