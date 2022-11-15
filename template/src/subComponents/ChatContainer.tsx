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
import React, {useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ChatBubble from './ChatBubble';
import {ChatBubbleProps} from '../components/ChatContext';
import {useLocalUid} from '../../agora-rn-uikit';
import {ImageIcon} from '../../agora-rn-uikit';
import TextWithTooltip from './TextWithTooltip';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent, isWebInternal} from '../utils/common';
import {useString} from '../utils/useString';
import {useChatUIControl} from '../components/chat-ui/useChatUIControl';
import {useRender} from 'customization-api';
import {useChatMessages} from '../components/chat-messages/useChatMessages';

/**
 * Chat container is the component which renders all the chat messages
 * It retrieves all the messages from the appropriate stores (Message store an provate message store)
 * and maps it to a ChatBubble
 */
const ChatContainer = (props?: {
  chatBubble?: React.ComponentType<ChatBubbleProps>;
}) => {
  const {renderList} = useRender();
  const {messageStore, privateMessageStore} = useChatMessages();
  const {height, width} = useWindowDimensions();
  const {
    privateActive,
    selectedChatUserId: selectedUserID,
    setPrivateActive,
  } = useChatUIControl();
  const localUid = useLocalUid();
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const scrollViewRef = useRef<ScrollView>(null);

  const {ChatBubbleComponent} = useCustomization((data) => {
    let components: {
      ChatBubbleComponent: React.ComponentType<ChatBubbleProps>;
    } = {
      ChatBubbleComponent: ChatBubble,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      //commented for v1 release
      if (
        data?.components?.videoCall?.chat &&
        typeof data?.components?.videoCall?.chat === 'object'
      ) {
        if (
          data?.components?.videoCall?.chat?.chatBubble &&
          typeof data?.components?.videoCall?.chat?.chatBubble !== 'object' &&
          isValidReactComponent(data?.components?.videoCall?.chat?.chatBubble)
        ) {
          components.ChatBubbleComponent =
            data?.components?.videoCall?.chat?.chatBubble;
        }
      }
    } else {
      if (props?.chatBubble && isValidReactComponent(props?.chatBubble)) {
        components.ChatBubbleComponent = props?.chatBubble;
      }
    }
    return components;
  });
  //commented for v1 release
  //const userOfflineLabel = useString('userOfflineLabel')();
  const userOfflineLabel = 'User is offline';
  return (
    <View style={style.containerView}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }}>
        {!privateActive ? (
          messageStore.map((message: any, index) => (
            <>
              <ChatBubbleComponent
                isLocal={localUid === message.uid}
                isSameUser={
                  index !== 0 && messageStore[index - 1].uid === message.uid
                    ? true
                    : false
                }
                message={message.msg}
                createdTimestamp={message.createdTimestamp}
                updatedTimestamp={message.updatedTimestamp}
                uid={message.uid}
                key={message.ts}
                msgId={message.msgId}
                isDeleted={message.isDeleted}
              />
            </>
          ))
        ) : privateMessageStore[selectedUserID] ? (
          privateMessageStore[selectedUserID].map((message: any, index) => (
            <ChatBubbleComponent
              isLocal={localUid === message.uid}
              isSameUser={
                index !== 0 &&
                privateMessageStore[selectedUserID][index - 1].uid ===
                  message.uid
                  ? true
                  : false
              }
              message={message.msg}
              createdTimestamp={message.createdTimestamp}
              updatedTimestamp={message.updatedTimestamp}
              uid={message.uid}
              key={message.ts}
              msgId={message.msgId}
              isDeleted={message.isDeleted}
            />
          ))
        ) : (
          <></>
        )}
        {renderList[selectedUserID]?.offline && (
          <View style={style.infoTextView}>
            <Text style={style.infoText}>{userOfflineLabel}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  containerView: {flex: 8},
  name: {
    fontWeight: isWebInternal() ? '500' : '700',
    color: $config.PRIMARY_FONT_COLOR,
    textAlign: 'left',
    marginRight: 10,
  },
  infoTextView: {
    marginVertical: 2,
    flexDirection: 'row',
  },
  infoText: {
    color: $config.PRIMARY_FONT_COLOR + '60',
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
});

export default ChatContainer;
