import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';
import {calculatePosition, isMobileUA, trimText} from '../../utils/common';
import IconButton from '../../atoms/IconButton';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Clipboard from '../../subComponents/Clipboard';
import {useString} from '../../utils/useString';
import {
  chatActionMenuCopyLinkText,
  chatActionMenuDownloadText,
  chatActionMenuDeleteText,
  chatMessageDeleteConfirmBtnText,
  chatPublicMessageDeletePopupText,
  chatPrivateMessageDeletePopupText,
} from '../../language/default-labels/videoCallScreenLabels';
import {
  SDKChatType,
  useChatMessages,
} from '../../components/chat-messages/useChatMessages';
import InlinePopup from '../../../src/atoms/InlinePopup';
import {
  cancelText,
  copiedToClipboardText,
} from '../../language/default-labels/commonLabels';
import Toast from '../../../react-native-toast-message';
import {useContent, UidType} from 'customization-api';
import {
  ChatType,
  useChatUIControls,
} from '../../../src/components/chat-ui/useChatUIControls';

interface MoreMenuProps {
  setActionMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
interface ChatActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
  fileName: string;
  fileUrl: string;
  msgId: string;
  privateChatUser: number;
  isLocal: boolean;
  userId?: UidType;
}

export const ChatActionMenu = (props: ChatActionMenuProps) => {
  const {
    actionMenuVisible,
    setActionMenuVisible,
    btnRef,
    fileName,
    fileUrl,
    msgId,
    privateChatUser,
    isLocal,
    userId,
  } = props;

  const {setChatType, setPrivateChatUser} = useChatUIControls();

  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const [showDeleteMessageModal, setShowDeleteMessageModal] =
    React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const {downloadAttachment, deleteAttachment} = useChatConfigure();
  const {removeMessageFromPrivateStore, removeMessageFromStore} =
    useChatMessages();
  const {defaultContent} = useContent();

  const {
    data: {isHost, chat},
  } = useRoomInfo();

  const groupID = chat.group_id;
  const chatType = privateChatUser
    ? SDKChatType.SINGLE_CHAT
    : SDKChatType.GROUP_CHAT;
  const recallFromUser = privateChatUser ? privateChatUser : groupID;
  const cancelTxt = useString(cancelText)();
  const cancelLabel =
    cancelTxt.charAt(0).toUpperCase() + cancelTxt.slice(1).toLowerCase();
  const confirmLabel = useString(chatMessageDeleteConfirmBtnText)();
  let message = '';
  if (chatType === SDKChatType.GROUP_CHAT) {
    message = useString(chatPublicMessageDeletePopupText)();
  }
  if (chatType === SDKChatType.SINGLE_CHAT) {
    message = useString(chatPrivateMessageDeletePopupText)(
      trimText(defaultContent[recallFromUser]?.name),
    );
  }
  const copiedToClipboardTextLabel = useString(copiedToClipboardText)();

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

  actionMenuitems.push({
    icon: 'download',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: useString(chatActionMenuDownloadText)(),
    onPress: () => {
      downloadAttachment(fileName, fileUrl);
      setActionMenuVisible(false);
    },
  });

  actionMenuitems.push({
    icon: 'clipboard_outlined',
    onHoverIcon: 'clipboard',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: useString(chatActionMenuCopyLinkText)(),
    onPress: () => {
      Clipboard.setString(fileUrl);
      setActionMenuVisible(false);
      // Toast.show({
      //   leadingIconName: 'tick-fill',
      //   type: 'success',
      //   text1: copiedToClipboardTextLabel,
      //   visibilityTime: 3000,
      //   primaryBtn: null,
      //   secondaryBtn: null,
      // });
    },
  });
  actionMenuitems.push({
    icon: 'delete',
    iconColor: $config.SEMANTIC_ERROR,
    textColor: $config.SEMANTIC_ERROR,
    iconSize: 24,
    title: useString(chatActionMenuDeleteText)(),
    onPress: () => {
      if (isLocal) {
        // confirm dialog : user is deleting for all
        setShowDeleteMessageModal(true);
        //deleteAttachment(msgId, recallFromUser.toString(), chatType);
      } else {
        if (chatType === SDKChatType.SINGLE_CHAT) {
          removeMessageFromPrivateStore(msgId, isLocal);
        }
        if (chatType === SDKChatType.GROUP_CHAT) {
          removeMessageFromStore(msgId, isLocal);
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
            deleteAttachment(msgId, recallFromUser.toString(), chatType);
            if (chatType === SDKChatType.SINGLE_CHAT) {
              removeMessageFromPrivateStore(msgId, isLocal);
            }
            if (chatType === SDKChatType.GROUP_CHAT) {
              removeMessageFromStore(msgId, isLocal);
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

export const MoreMenu = React.forwardRef<View, MoreMenuProps>((props, ref) => {
  const {setActionMenuVisible} = props;
  const isMobile = isMobileUA();
  return (
    <View ref={ref} collapsable={false}>
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={{
          backgroundColor:
            $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
          borderRadius: 18,
        }}
        iconProps={{
          iconType: 'plain',
          name: 'more-menu',
          iconSize: 18,
          tintColor: $config.SECONDARY_ACTION_COLOR,
          iconContainerStyle: {
            padding: 4,
            borderRadius: 18,
          },
        }}
        onPress={() => {
          setActionMenuVisible(true);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({});
