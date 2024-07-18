import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import React, {SetStateAction} from 'react';
import Popup from '../../atoms/Popup';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';
import {timeAgo} from '../../../src/utils';
import IconButton from '../../atoms/IconButton';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import {
  SDKChatType,
  useChatMessages,
} from '../../components/chat-messages/useChatMessages';
import Clipboard from '../../subComponents/Clipboard';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import {IconsInterface} from '../../atoms/CustomIcon';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import InlinePopup from '../../atoms/InlinePopup';
import {calculatePosition, trimText} from '../../utils/common';
import {useString} from '../../utils/useString';
import {
  chatMessageDeleteConfirmBtnText,
  chatPublicMessageDeletePopupText,
  chatPrivateMessageDeletePopupText,
} from '../../language/default-labels/videoCallScreenLabels';
import {cancelText} from '../../language/default-labels/commonLabels';
import {useContent} from 'customization-api';

interface ImagePopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  fileName: string;
  timestamp: string;
  senderName: string;
  msgId: string;
  isLocal: boolean;
}

const ImagePopup = (props: ImagePopupProps) => {
  const {
    modalVisible,
    setModalVisible,
    imageUrl,
    fileName,
    timestamp,
    senderName,
    msgId,
    isLocal,
  } = props;
  const [isLoading, setIsLoading] = React.useState(true);
  const [showDeleteMessageModal, setShowDeleteMessageModal] =
    React.useState(false);
  const {privateChatUser} = useChatUIControls();
  const {
    data: {isHost, chat},
  } = useRoomInfo();
  const {downloadAttachment, deleteAttachment} = useChatConfigure();
  const {removeMessageFromPrivateStore, removeMessageFromStore} =
    useChatMessages();

  const groupID = chat.group_id;
  const chatType = privateChatUser
    ? SDKChatType.SINGLE_CHAT
    : SDKChatType.GROUP_CHAT;
  const recallFromUser = privateChatUser ? privateChatUser : groupID;
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const btnRef = React.useRef<View>(null);
  const {defaultContent} = useContent();

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

  React.useEffect(() => {
    //getting btnRef x,y
    if (!isLoading) {
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
  }, [isLoading]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const CloseIcon = () => {
    return (
      <View>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={{
            backgroundColor: $config.ICON_BG_COLOR,
            borderRadius: 20,
          }}
          iconProps={{
            iconType: 'plain',
            iconSize: 24,
            iconContainerStyle: {
              padding: 0,
            },
            name: 'close',
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        />
      </View>
    );
  };

  const Loader = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          size="large"
          color={$config.PRIMARY_ACTION_BRAND_COLOR}
        />
      </View>
    );
  };

  const ControlsMenu = () => {
    const menuItems = [
      {
        icon: 'delete',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        iconSize: 24,
        callback: () => {
          if (isLocal) {
            setShowDeleteMessageModal(true);
          } else {
            if (chatType === SDKChatType.SINGLE_CHAT) {
              removeMessageFromPrivateStore(msgId, isLocal);
            }
            if (chatType === SDKChatType.GROUP_CHAT) {
              removeMessageFromStore(msgId, isLocal);
            }
          }
        },
      },
      {
        icon: 'download',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        iconSize: 24,
        callback: () => {
          downloadAttachment(fileName, imageUrl);
        },
      },
      {
        icon: 'close',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        iconSize: 20,
        callback: () => {
          setModalVisible(false);
        },
      },
    ];
    return !isLoading ? (
      <View style={styles.controlsContainer}>
        {menuItems.map((obj, index) => (
          <View key={obj.icon} ref={obj.icon === 'delete' ? btnRef : null}>
            <IconButton
              hoverEffect={false}
              hoverEffectStyle={{
                backgroundColor:
                  $config.ICON_BG_COLOR + hexadecimalTransparency['50%'],
              }}
              iconProps={{
                iconType: 'plain',
                iconContainerStyle: {
                  backgroundColor: 'transparent',
                  paddingHorizontal: 8,
                  borderRightWidth: index === menuItems.length - 1 ? 0 : 1,
                  borderRightColor:
                    $config.SECONDARY_ACTION_COLOR +
                    hexadecimalTransparency['20%'],
                },
                iconSize: obj.iconSize,
                name: obj.icon as keyof IconsInterface,
                tintColor: obj.iconColor,
              }}
              onPress={obj.callback}
            />
          </View>
        ))}
      </View>
    ) : (
      <></>
    );
  };

  // const HeaderComponent = () => {
  //   return (
  //     <View style={styles.headerContainer}>
  //       <View style={styles.header}>
  //         <UserAvatar
  //           name={senderName}
  //           containerStyle={styles.avatarContainerStyle}
  //           textStyle={styles.avatarTextStyle}
  //         />
  //         <View>
  //           <Text
  //             style={styles.nameText}
  //             numberOfLines={1}
  //             ellipsizeMode={'tail'}>
  //             {senderName}
  //           </Text>
  //           <View style={styles.subTextContainer}>
  //             <Text style={styles.subText} ellipsizeMode={'tail'}>
  //               {timeAgo(parseInt(timestamp))} - {fileName}
  //             </Text>
  //           </View>
  //         </View>
  //       </View>
  //       <CloseIcon />
  //     </View>
  //   );
  // };
  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}
      bodyContainerStyle={styles.bodyContainer}
      // headerComponent={<HeaderComponent />}
    >
      {isLoading ? <Loader /> : null}
      <Image
        source={{uri: imageUrl}}
        style={styles.image}
        onLoad={handleImageLoad}
      />
      {isLocal ? (
        <InlinePopup
          actionMenuVisible={showDeleteMessageModal && isPosCalculated}
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
            setModalVisible(false);
          }}
        />
      ) : (
        <></>
      )}
      <ControlsMenu />
    </Popup>
  );
};

/* 

*/

export default ImagePopup;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 12,
    width: '100%',
    maxWidth: 1376,
    marginHorizontal: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 16,
  },

  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  spinnerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bodyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtnContainer: {
    position: 'absolute',
    top: -24,
    right: -24,
  },
  avatarContainerStyle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  avatarTextStyle: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '400',
    color: $config.CARD_LAYER_1_COLOR,
  },
  nameText: {
    fontWeight: '700',
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 20,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
  subText: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 16,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
  },
  subTextContainer: {
    flexDirection: 'row',
  },
  controlsContainer: {
    backgroundColor:
      $config.CARD_LAYER_2_COLOR + hexadecimalTransparency['50%'],
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    right: 16,
    top: 12,
    borderRadius: 4,
    paddingVertical: 8,
    zIndex: 1,
    elevation: 1,
  },
});
