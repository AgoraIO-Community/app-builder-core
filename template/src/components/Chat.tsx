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
import IconButton from 'src/atoms/IconButton';

export interface ChatProps {
  chatBubble?: React.ComponentType<ChatBubbleProps>;
  chatInput?: React.ComponentType<ChatTextInputProps>;
  chatSendButton?: React.ComponentType<ChatSendButtonProps>;
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
              ? style.chatView
              : style.chatViewNative
            : style.chatViewNative
        }>
        {/**
         * In Native device we are setting absolute view. so placed ChatBeforeView and ChatAfterView inside the main view
         */}
        <ChatBeforeView />
        <View style={style.header}>
          <IconButton
            iconProps={{name: 'backBtn', tintColor: '#000000'}}
            style={{
              opacity: privateActive ? 1 : 0,
            }}
            onPress={() => {
              setPrivateActive(false);
            }}
          />
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
                style={!groupActive ? style.groupTextActive : style.groupText}>
                {privateChatLabel}
              </Text>
            </TouchableOpacity>
          </View>
          <IconButton
            iconProps={{
              name: 'closeSquare',
              tintColor: '#000000',
            }}
            onPress={() => {
              setSidePanel(SidePanelType.None);
            }}
          />
        </View>

        {groupActive ? (
          <>
            <ChatContainer {...props} />
            <View>
              <View style={style.chatInputContainer}>
                <ChatInput {...props} />
              </View>
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
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    minWidth: 160,
    flexDirection: 'row',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    alignItems: 'center',
    minHeight: 60,
  },
  chatView: {
    maxWidth: '20%',
    minWidth: 338,
    borderRadius: 12,
    marginLeft: 20,
    marginTop: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    flex: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 12,
  },
  chatViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    bottom: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
  heading: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    width: 150,
    height: '7%',
    paddingLeft: 20,
    flexDirection: 'row',
  },
  headingText: {
    flex: 1,
    paddingLeft: 5,
    marginVertical: 'auto',
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 25,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  chatInputContainer: {},
  groupActive: {
    margin: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  group: {
    padding: 2,
  },
  privateActive: {
    margin: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  private: {
    padding: 2,
  },
  groupTextActive: {
    paddingHorizontal: 23,
    paddingVertical: 10,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    color: '#099DFD',
  },
  groupText: {
    paddingHorizontal: 23,
    paddingVertical: 10,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 12,
    color: '#1A1A1A',
  },
  chatNotification: {
    width: 8,
    height: 8,
    backgroundColor: '#FF414D',
    borderRadius: 30,
    position: 'absolute',
    right: 5,
    top: 4,
  },
});

export default Chat;
