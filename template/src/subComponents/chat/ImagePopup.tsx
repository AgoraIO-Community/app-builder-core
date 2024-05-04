import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, {SetStateAction} from 'react';
import Popup from '../../atoms/Popup';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';
import {timeAgo} from '../../../src/utils';
import IconButton from '../../atoms/IconButton';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import {useChatMessages} from '../../components/chat-messages/useChatMessages';
import Clipboard from '../../subComponents/Clipboard';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import {IconsInterface} from '../../atoms/CustomIcon';

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
    const {downloadAttachment, deleteAttachment} = useChatConfigure();
    const {removeMessageFromPrivateStore, removeMessageFromStore} =
      useChatMessages();
    const {privateChatUser} = useChatUIControls();
    const {
      data: {isHost, chat},
    } = useRoomInfo();

    const menuItems = [
      {
        icon: 'download',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        iconSize: 20,
        callback: () => {
          downloadAttachment(fileName, imageUrl);
        },
      },
      {
        icon: 'clipboard',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        iconSize: 20,
        callback: () => {
          Clipboard.setString(imageUrl);
        },
      },
      {
        icon: 'delete',
        iconColor: $config.SEMANTIC_ERROR,
        iconSize: 24,
        callback: () => {
          const groupID = chat.group_id;
          const chatType = privateChatUser ? 'singleChat' : 'groupChat';
          const recallFromUser = privateChatUser ? privateChatUser : groupID;

          setModalVisible(false);

          if (chatType === 'singleChat') {
            removeMessageFromPrivateStore(msgId, isLocal);
          }
          if (chatType === 'groupChat') {
            removeMessageFromStore(msgId, isLocal);
          }
          if (isLocal) {
            deleteAttachment(msgId, recallFromUser.toString(), chatType);
          }
        },
      },
    ];
    return !isLoading ? (
      <View style={styles.controlsContainer}>
        {menuItems.map(obj => (
          <View>
            <IconButton
              key={obj.icon}
              hoverEffect={true}
              hoverEffectStyle={{
                backgroundColor: $config.ICON_BG_COLOR,
              }}
              iconProps={{
                iconType: 'plain',
                iconContainerStyle: {
                  backgroundColor: 'transparent',
                  borderRadius: obj.iconSize,
                  padding: 8,
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

  const HeaderComponent = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <UserAvatar
            name={senderName}
            containerStyle={styles.avatarContainerStyle}
            textStyle={styles.avatarTextStyle}
          />
          <View>
            <Text
              style={styles.nameText}
              numberOfLines={1}
              ellipsizeMode={'tail'}>
              {senderName}
            </Text>
            <View style={styles.subTextContainer}>
              <Text style={styles.subText} ellipsizeMode={'tail'}>
                {timeAgo(parseInt(timestamp))} - {fileName}
              </Text>
            </View>
          </View>
        </View>
        <CloseIcon />
      </View>
    );
  };
  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}
      bodyContainerStyle={styles.bodyContainer}
      headerComponent={<HeaderComponent />}>
      {isLoading ? <Loader /> : null}
      <Image
        source={{uri: imageUrl}}
        style={styles.image}
        onLoad={handleImageLoad}
      />
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
    maxWidth: 800,
    width: '100%',
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
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
    elevation: 1,
  },
});
