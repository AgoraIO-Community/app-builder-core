import {
  individualUnreadMessageCount,
  useChatNotification,
} from '../components/chat-notification/useChatNotification';
import {
  ChatOption,
  MessageStatusCallback,
  messageStoreInterface,
  useChatMessages,
  SDKChatType,
} from '../components/chat-messages/useChatMessages';
import {useChatConfigure} from '../components/chat/chatConfigure';
import {isWeb} from '../utils/common';
import type {UidType} from '../../agora-rn-uikit';

export interface messageInterface {
  groupMessages: messageStoreInterface[];
  privateMessages: {
    [key: string]: messageStoreInterface[];
  };
  sendMessage: (
    option: ChatOption,
    messageStatusCallback?: MessageStatusCallback,
  ) => void;
  // editMessage: (msgId: string, msg: string, toUid?: number) => void;
  deleteMessage: (msgId: string, to?: string, chatType?: SDKChatType) => void;
  groupUnreadCount: number;
  individualUnreadCount: individualUnreadMessageCount;
  setGroupUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  setIndividualUnreadCount: React.Dispatch<
    React.SetStateAction<individualUnreadMessageCount>
  >;

  removeMessageFromStore: (msgId: string, isMsgRecalled: boolean) => void;
  removeMessageFromPrivateStore: (
    msgId: string,
    isMsgRecalled: boolean,
  ) => void;
}

/**
 * The Messages app state governs the chat messages.
 */
export const useMessages: () => messageInterface = () => {
  const {
    messageStore: groupMessages,
    privateMessageStore: privateMessages,
    removeMessageFromPrivateStore,
    removeMessageFromStore,
  } = useChatMessages();
  const {sendChatSDKMessage, deleteAttachment} = useChatConfigure();
  const {
    setUnreadIndividualMessageCount: setIndividualUnreadCount,
    setUnreadGroupMessageCount: setGroupUnreadCount,
    unreadGroupMessageCount: groupUnreadCount,
    unreadIndividualMessageCount: individualUnreadCount,
  } = useChatNotification();

  const sendMessageWrapper = (
    option: ChatOption,
    messageStatusCallback?: MessageStatusCallback,
  ) => {
    if (isWeb()) {
      sendChatSDKMessage(option);
    } else {
      sendChatSDKMessage(option, messageStatusCallback);
    }
  };

  const deleteMessageWrapper = (
    msgId: string,
    to?: string,
    chatType?: SDKChatType,
  ) => {
    if (isWeb()) {
      deleteAttachment(msgId, to, chatType);
    } else {
      deleteAttachment(msgId);
    }
  };

  return {
    groupMessages,
    privateMessages,
    sendMessage: sendMessageWrapper,
    //editMessage,
    deleteMessage: deleteMessageWrapper,
    groupUnreadCount,
    individualUnreadCount,
    setGroupUnreadCount,
    setIndividualUnreadCount,
    removeMessageFromStore,
    removeMessageFromPrivateStore,
  };
};
