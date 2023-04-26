import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext} from 'react';
import SidePanelHeader, {
  SidePanelStyles,
} from '../../subComponents/SidePanelHeader';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ThemeConfig from '../../theme';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {useSidePanel} from '../../utils/useSidePanel';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {
  ChatType,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {numFormatter} from '../../utils';
import ChatContext from '../../components/ChatContext';

export const SettingsHeader = (props) => {
  const {setSidePanel} = useSidePanel();
  const settingsLabel = 'Settings';
  return (
    <SidePanelHeader
      centerComponent={
        <Text style={SidePanelStyles.heading}>{settingsLabel}</Text>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        props.handleClose && props.handleClose();
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

export const PeopleHeader = () => {
  const {onlineUsersCount} = useContext(ChatContext);
  const participantsLabel = `People (${numFormatter(onlineUsersCount)})`;
  const {setSidePanel} = useSidePanel();
  return (
    <SidePanelHeader
      centerComponent={
        <Text style={SidePanelStyles.heading}>{participantsLabel}</Text>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

export const ChatHeader = () => {
  const {
    unreadGroupMessageCount,
    setUnreadGroupMessageCount,
    unreadPrivateMessageCount,
    setUnreadPrivateMessageCount,
    setUnreadIndividualMessageCount,
    unreadIndividualMessageCount,
  } = useChatNotification();

  const {setSidePanel} = useSidePanel();
  const groupChatLabel = 'Group';
  const privateChatLabel = 'Private';

  const {chatType, setChatType, setPrivateChatUser} = useChatUIControls();

  const selectGroup = () => {
    setChatType(ChatType.Group);
    //move this logic into ChatContainer
    //setUnreadGroupMessageCount(0);
    setPrivateChatUser(0);
  };
  const selectPrivate = () => {
    setPrivateChatUser(0);
    setChatType(ChatType.MemberList);
  };
  const isPrivateActive = chatType === ChatType.Private;
  const isGroupActive = chatType === ChatType.Group;
  return (
    <SidePanelHeader
      isChat={true}
      leadingIconName={isPrivateActive ? 'back-btn' : null}
      leadingIconOnPress={
        isPrivateActive
          ? () => {
              setPrivateChatUser(0);
              setChatType(ChatType.MemberList);
            }
          : () => {}
      }
      centerComponent={
        <View style={styles.buttonHolder}>
          <TouchableOpacity
            onPress={selectGroup}
            style={
              isGroupActive ? styles.activeContainer : styles.nonActiveContainer
            }>
            {unreadGroupMessageCount !== 0 ? (
              <View style={styles.chatNotification} />
            ) : null}
            <Text
              style={isGroupActive ? styles.activeText : styles.nonActiveText}>
              {groupChatLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={selectPrivate}
            style={
              !isGroupActive
                ? [styles.activeContainer]
                : [styles.nonActiveContainer]
            }>
            {unreadPrivateMessageCount !== 0 ? (
              <View style={styles.chatNotification} />
            ) : null}
            <Text
              style={!isGroupActive ? styles.activeText : styles.nonActiveText}>
              {privateChatLabel}
            </Text>
          </TouchableOpacity>
        </View>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

const styles = StyleSheet.create({
  buttonHolder: {
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['30%'],
    borderRadius: 12,
    flexDirection: 'row',
  },
  chatViewNative: {
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    bottom: 0,
  },
  chatInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContainer: {
    margin: 2,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 11,
    alignSelf: 'center',
  },
  nonActiveContainer: {
    alignSelf: 'center',
  },
  activeText: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
  },
  nonActiveText: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    color: $config.FONT_COLOR,
  },
  chatNotification: {
    width: 8,
    height: 8,
    backgroundColor: $config.SEMANTIC_ERROR,
    borderRadius: 30,
    position: 'absolute',
    right: 8,
    top: 4,
  },
});
