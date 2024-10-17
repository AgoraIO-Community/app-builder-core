import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {calculatePosition, trimText} from '../../../src/utils/common';
import IconButton from '../../../src/atoms/IconButton';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {
  ChatType,
  useChatUIControls,
} from '../../../src/components/chat-ui/useChatUIControls';
import {
  SDKChatType,
  useChatMessages,
  ChatMessageType,
} from '../../components/chat-messages/useChatMessages';
import {UidType, useContent, useRoomInfo} from 'customization-api';
import InlinePopup from '../../../src/atoms/InlinePopup';
import {useString} from '../../utils/useString';
import {cancelText} from '../../language/default-labels/commonLabels';
import {
  chatActionMenuCopyLinkText,
  chatActionMenuDownloadText,
  chatActionMenuDeleteText,
  chatMessageDeleteConfirmBtnText,
  chatPublicMessageDeletePopupText,
  chatPrivateMessageDeletePopupText,
} from '../../language/default-labels/videoCallScreenLabels';
import {useChatConfigure} from '../../../src/components/chat/chatConfigure';
import Clipboard from '../../subComponents/Clipboard';

interface ChatQuickActionsMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
  userId: UidType;
  isLocal?: boolean;
  messageId?: string;
  type: ChatMessageType;
  message: string;
}

const ChatQuickActionsMenu = (props: ChatQuickActionsMenuProps) => {
  const {
    actionMenuVisible,
    setActionMenuVisible,
    btnRef,
    userId,
    isLocal,
    messageId,
    type,
    message: msg,
  } = props;
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [modalPosition, setModalPosition] = React.useState({});
  const {setChatType, setPrivateChatUser, showEmojiPicker, privateChatUser} =
    useChatUIControls();
  const {removeMessageFromPrivateStore, removeMessageFromStore} =
    useChatMessages();
  const [showDeleteMessageModal, setShowDeleteMessageModal] =
    React.useState(false);
  const {deleteAttachment} = useChatConfigure();

  const actionMenuitems: ActionMenuItem[] = [];
  const {defaultContent} = useContent();

  const {
    data: {isHost, chat},
  } = useRoomInfo();

  const groupID = chat.group_id;

  // actionMenuitems.push({
  //   icon: 'reply',
  //   iconColor: $config.SECONDARY_ACTION_COLOR,
  //   textColor: $config.FONT_COLOR,
  //   title: 'Reply',
  //   onPress: () => {
  //     setActionMenuVisible(false);
  //   },
  // });

  const cancelTxt = useString(cancelText)();
  const cancelLabel =
    cancelTxt.charAt(0).toUpperCase() + cancelTxt.slice(1).toLowerCase();
  const confirmLabel = useString(chatMessageDeleteConfirmBtnText)();
  const chatType = privateChatUser
    ? SDKChatType.SINGLE_CHAT
    : SDKChatType.GROUP_CHAT;
  const recallFromUser = privateChatUser ? privateChatUser : groupID;

  let message = '';
  if (chatType === SDKChatType.GROUP_CHAT) {
    message = useString(chatPublicMessageDeletePopupText)();
  }
  if (chatType === SDKChatType.SINGLE_CHAT) {
    message = useString(chatPrivateMessageDeletePopupText)(
      trimText(defaultContent[recallFromUser]?.name),
    );
  }

  !isLocal &&
    chatType == SDKChatType.GROUP_CHAT &&
    actionMenuitems.push({
      icon: 'reply_all',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      iconSize: 14,
      title: 'Private Reply',
      onPress: () => {
        setPrivateChatUser(userId);
        setChatType(ChatType.Private);
        setActionMenuVisible(false);
      },
    });

  type === ChatMessageType.TXT &&
    actionMenuitems.push({
      icon: 'clipboard',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Copy Message',
      onPress: () => {
        Clipboard.setString(msg);
        setActionMenuVisible(false);
      },
    });
  // actionMenuitems.push({
  //   icon: 'pin-outlined',
  //   iconColor: $config.SECONDARY_ACTION_COLOR,
  //   textColor: $config.FONT_COLOR,
  //   title: 'Pin Message',
  //   onPress: () => {
  //     setActionMenuVisible(false);
  //   },
  // });

  // actionMenuitems.push({
  //   icon: 'block_user',
  //   iconColor: $config.SEMANTIC_ERROR,
  //   textColor: $config.SEMANTIC_ERROR,
  //   title: 'Block User',
  //   onPress: () => {
  //     // block user can be done only by group owner and admins
  //     setActionMenuVisible(false);
  //   },
  // });

  actionMenuitems.push({
    icon: 'delete',
    iconColor: $config.SEMANTIC_ERROR,
    textColor: $config.SEMANTIC_ERROR,
    title: 'Delete Message',
    onPress: () => {
      if (isLocal) {
        // confirm dialog : user is deleting for all
        setShowDeleteMessageModal(true);
        //deleteAttachment(msgId, recallFromUser.toString(), chatType);
      } else {
        debugger;
        if (chatType === SDKChatType.GROUP_CHAT) {
          removeMessageFromStore(messageId, isLocal);
        }
        if (chatType === SDKChatType.SINGLE_CHAT) {
          removeMessageFromPrivateStore(messageId, isLocal);
        }
      }
      setActionMenuVisible(false);
    },
  });

  React.useEffect(() => {
    if (actionMenuVisible) {
      //getting btnRef x,y
      btnRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          localWidth: number,
          localHeight: number,
          px: number,
          py: number,
        ) => {
          const data = calculatePosition({
            px,
            py,
            localWidth,
            localHeight,
            globalHeight,
            globalWidth,
          });
          setModalPosition(data);
          setIsPosCalculated(true);
        },
      );
    }
  }, [actionMenuVisible]);
  return (
    <>
      {isLocal ? (
        <InlinePopup
          actionMenuVisible={showDeleteMessageModal}
          setActionMenuVisible={setShowDeleteMessageModal}
          modalPosition={modalPosition}
          message={message}
          cancelLabel={cancelLabel}
          cancelLabelStyle={{color: $config.SECONDARY_ACTION_COLOR}}
          confirmLabel={confirmLabel}
          confirmLabelStyle={{color: $config.SEMANTIC_ERROR}}
          onConfirmClick={() => {
            deleteAttachment(messageId, recallFromUser.toString(), chatType);
            if (chatType === SDKChatType.GROUP_CHAT) {
              removeMessageFromStore(messageId, isLocal);
            }
            if (chatType === SDKChatType.SINGLE_CHAT) {
              removeMessageFromPrivateStore(messageId, isLocal);
            }
            setShowDeleteMessageModal(false);
          }}
        />
      ) : (
        <></>
      )}
      <ActionMenu
        from={'chat'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuitems}
      />
    </>
  );
};

export const MoreMessageOptions = ({
  userId,
  isLocal,
  messageId,
  type,
  message,
}) => {
  const moreIconRef = React.useRef(null);
  const [messageOptionsMenuVisible, setMessageOptionsMenuVisible] =
    React.useState(false);
  if (type === ChatMessageType.FILE) {
    return <></>;
  }
  return (
    <>
      <ChatQuickActionsMenu
        actionMenuVisible={messageOptionsMenuVisible}
        setActionMenuVisible={setMessageOptionsMenuVisible}
        btnRef={moreIconRef}
        userId={userId}
        isLocal={isLocal}
        messageId={messageId}
        type={type}
        message={message}
      />

      <View
        ref={moreIconRef}
        collapsable={false}
        style={{
          width: 20,
          height: 20,
          padding: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
        }}>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={{
            backgroundColor:
              $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
            borderRadius: 4,
            padding: 2,
          }}
          containerStyle={{margin: 4}}
          iconProps={{
            iconType: 'plain',
            name: 'more-menu',
            iconSize: 20,
            tintColor:
              $config.SECONDARY_ACTION_COLOR + hexadecimalTransparency['75%'],
          }}
          onPress={() => {
            setMessageOptionsMenuVisible(true);
          }}
        />
      </View>
    </>
  );
};

export default ChatQuickActionsMenu;

const styles = StyleSheet.create({});
