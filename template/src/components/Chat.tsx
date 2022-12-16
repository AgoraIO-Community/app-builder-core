/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ChatContainer from '../subComponents/ChatContainer';
import ChatInput from '../subComponents/ChatInput';
import ChatParticipants from '../subComponents/chat/ChatParticipants';
import ColorContext from './ColorContext';
import {useChatNotification} from './chat-notification/useChatNotification';
import {useString} from '../utils/useString';
import {isIOS, isValidReactComponent, isWebInternal} from '../utils/common';
import {useChatUIControl} from './chat-ui/useChatUIControl';
import {useCustomization} from 'customization-implementation';
import {UidType} from '../../agora-rn-uikit';
import {ChatBubbleProps} from './ChatContext';
import {
  ChatTextInputProps,
  ChatSendButtonProps,
} from '../subComponents/ChatInput';
import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import IconButton from '../atoms/IconButton';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import SidePanelHeader from '../subComponents/SidePanelHeader';
import CommonStyles from './CommonStyles';

export interface ChatProps {
  chatBubble?: React.ComponentType<ChatBubbleProps>;
  chatInput?: React.ComponentType<ChatTextInputProps>;
  chatSendButton?: React.ComponentType<ChatSendButtonProps>;
  handleClose?: () => void;
}

const Chat = (props?: ChatProps) => {
  // commented for v1 release
  // const groupChatLabel = useString('groupChatLabel')();
  // const privateChatLabel = useString('privateChatLabel')();
  const chatLabel = 'Chat';
  const groupChatLabel = 'Group';
  const privateChatLabel = 'Private';
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isSmall = dim[0] < 700;
  const {setSidePanel} = useSidePanel();

  const {
    groupActive,
    setGroupActive,
    privateActive,
    setPrivateActive,
    setSelectedChatUserId: setSelectedUser,
  } = useChatUIControl();

  console.log('debugging ');

  const {
    unreadGroupMessageCount,
    setUnreadGroupMessageCount,
    unreadPrivateMessageCount,
    setUnreadPrivateMessageCount,
    setUnreadIndividualMessageCount,
    unreadIndividualMessageCount,
  } = useChatNotification();

  const {primaryColor} = useContext(ColorContext);

  React.useEffect(() => {
    return () => {
      // reset both the active tabs
      setGroupActive(false);
      setPrivateActive(false);
      setSelectedUser(0);
    };
  }, []);

  const selectGroup = () => {
    setPrivateActive(false);
    setGroupActive(true);
    setUnreadGroupMessageCount(0);
    setSelectedUser(0);
  };
  const selectPrivate = () => {
    setGroupActive(false);
    setSelectedUser(0);
    setPrivateActive(false);
  };
  const selectUser = (userUID: UidType) => {
    setSelectedUser(userUID);
    setPrivateActive(true);
    setUnreadIndividualMessageCount((prevState) => {
      return {
        ...prevState,
        [userUID]: 0,
      };
    });
    setUnreadPrivateMessageCount(
      unreadPrivateMessageCount - (unreadIndividualMessageCount[userUID] || 0),
    );
  };

  const {ChatAfterView, ChatBeforeView} = useCustomization((data) => {
    let components: {
      ChatAfterView: React.ComponentType;
      ChatBeforeView: React.ComponentType;
    } = {
      ChatAfterView: React.Fragment,
      ChatBeforeView: React.Fragment,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      // commented for v1 release
      // if (
      //   data?.components?.videoCall?.chat &&
      //   typeof data?.components?.videoCall?.chat === 'object'
      // ) {
      //   if (
      //     data?.components?.videoCall?.chat?.after &&
      //     isValidReactComponent(data?.components?.videoCall?.chat?.after)
      //   ) {
      //     components.ChatAfterView = data?.components?.videoCall?.chat?.after;
      //   }
      //   if (
      //     data?.components?.videoCall?.chat?.before &&
      //     isValidReactComponent(data?.components?.videoCall?.chat?.before)
      //   ) {
      //     components.ChatBeforeView = data?.components?.videoCall?.chat?.before;
      //   }
      // }
    }
    return components;
  });

  return (
    <>
      <View
        style={
          isWebInternal()
            ? !isSmall
              ? CommonStyles.sidePanelContainerWeb
              : style.chatViewNative
            : style.chatViewNative
        }>
        {/**
         * In Native device we are setting absolute view. so placed ChatBeforeView and ChatAfterView inside the main view
         */}
        <ChatBeforeView />
        <SidePanelHeader
          isChat={true}
          leadingIconName={privateActive ? 'back-btn' : null}
          leadingIconOnPress={
            privateActive
              ? () => {
                  setPrivateActive(false);
                }
              : () => {}
          }
          centerComponent={
            <View style={style.buttonHolder}>
              <TouchableOpacity
                onPress={selectGroup}
                style={groupActive ? [style.groupActive] : [style.group]}>
                {unreadGroupMessageCount !== 0 ? (
                  <View style={style.chatNotification} />
                ) : null}
                <Text
                  style={groupActive ? style.groupTextActive : style.groupText}>
                  {groupChatLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={selectPrivate}
                style={!groupActive ? [style.privateActive] : [style.private]}>
                {unreadPrivateMessageCount !== 0 ? (
                  <View style={style.chatNotification} />
                ) : null}
                <Text
                  style={
                    !groupActive ? style.groupTextActive : style.groupText
                  }>
                  {privateChatLabel}
                </Text>
              </TouchableOpacity>
            </View>
          }
          trailingIconName="close-rounded"
          trailingIconOnPress={() => {
            if (!isSmall) {
              setSidePanel(SidePanelType.None);
            } else {
              props?.handleClose();
            }
          }}
        />
        {groupActive ? (
          <>
            <ChatContainer {...props} />
            <View style={style.chatInputContainer}>
              <ChatInput {...props} />
            </View>
          </>
        ) : (
          <>
            {!privateActive ? (
              <ChatParticipants selectUser={selectUser} />
            ) : (
              <>
                <ChatContainer {...props} />
                <View>
                  <View style={style.chatInputContainer}>
                    <ChatInput {...props} />
                  </View>
                </View>
              </>
            )}
          </>
        )}
        <ChatAfterView />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  buttonHolder: {
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['20%'],
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
  groupActive: {
    margin: 2,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 11,
  },
  group: {
    padding: 2,
  },
  privateActive: {
    margin: 2,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 11,
  },
  private: {
    padding: 2,
  },
  groupTextActive: {
    paddingHorizontal: 23,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
  },
  groupText: {
    paddingHorizontal: 23,
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
    right: 5,
    top: 4,
  },
});

export default Chat;
