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
import React, {useContext, useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  useWindowDimensions,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ChatBubble from './ChatBubble';
import ChatContext, {ChatBubbleProps} from '../components/ChatContext';
import {BtnTemplate} from '../../agora-rn-uikit';
import TextWithTooltip from './TextWithTooltip';
import {useFpe} from 'fpe-api';
import {isValidReactComponent, isWeb} from '../utils/common';
import {useString} from '../utils/useString';
import {useChatUIControl} from '../components/chat-ui/useChatUIControl';

/**
 * Chat container is the component which renders all the chat messages
 * It retrieves all the messages from the appropriate stores (Message store an provate message store)
 * and maps it to a ChatBubble
 */
const ChatContainer = (props: any) => {
  const {userList} = useContext(ChatContext);
  const {height, width} = useWindowDimensions();
  const {selectPrivate} = props;
  const {privateActive, selectedChatUserId: selectedUserID} =
    useChatUIControl();
  const {messageStore, localUid, privateMessageStore} = useContext(ChatContext);
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const scrollViewRef = useRef<ScrollView>(null);

  const {ChatBubbleComponent, ChatBubbleAfterView, ChatBubbleBeforeView} =
    useFpe((data) => {
      let components: {
        ChatBubbleComponent: React.ComponentType<ChatBubbleProps>;
        ChatBubbleBeforeView: React.ComponentType;
        ChatBubbleAfterView: React.ComponentType;
      } = {
        ChatBubbleAfterView: React.Fragment,
        ChatBubbleBeforeView: React.Fragment,
        ChatBubbleComponent: ChatBubble,
      };
      if (
        data?.components?.videoCall &&
        typeof data?.components?.videoCall === 'object'
      ) {
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

          if (
            data?.components?.videoCall?.chat?.chatInput &&
            typeof data?.components?.videoCall?.chat?.chatInput === 'object'
          ) {
            if (
              data?.components?.videoCall?.chat?.chatInput?.after &&
              isValidReactComponent(
                data?.components?.videoCall?.chat?.chatInput?.after,
              )
            ) {
              components.ChatBubbleAfterView =
                data?.components?.videoCall?.chat?.chatInput?.after;
            }
            if (
              data?.components?.videoCall?.chat?.chatInput?.before &&
              isValidReactComponent(
                data?.components?.videoCall?.chat?.chatInput?.before,
              )
            ) {
              components.ChatBubbleBeforeView =
                data?.components?.videoCall?.chat?.chatInput?.before;
            }
          }
        }
      }
      return components;
    });

  const userOfflineLabel = useString('userOfflineLabel');
  return (
    <View style={style.containerView}>
      {privateActive && (
        <View style={style.row}>
          <View style={style.backButton}>
            <BtnTemplate
              style={[style.backIcon]}
              onPress={() => {
                selectPrivate();
              }}
              name={'backBtn'}
            />
          </View>
          <View style={{flex: 1}}>
            <TextWithTooltip
              style={[
                style.name,
                {
                  flexShrink: 1,
                  fontSize: RFValue(16, height > width ? height : width),
                },
              ]}
              value={
                userList[selectedUserID]
                  ? userList[selectedUserID]?.name + ' '
                  : remoteUserDefaultLabel + ' '
              }
            />
          </View>
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }}>
        {!privateActive ? (
          messageStore.map((message: any) => (
            <>
              <ChatBubbleBeforeView />
              <ChatBubbleComponent
                isLocal={localUid === message.uid}
                message={message.msg}
                timestamp={message.ts}
                uid={message.uid}
                key={message.ts}
              />
              <ChatBubbleAfterView />
            </>
          ))
        ) : privateMessageStore[selectedUserID] ? (
          privateMessageStore[selectedUserID].map((message: any) => (
            <>
              <ChatBubbleBeforeView />
              <ChatBubbleComponent
                isLocal={localUid === message.uid}
                message={message.msg}
                timestamp={message.ts}
                uid={message.uid}
                key={message.ts}
              />
              <ChatBubbleAfterView />
            </>
          ))
        ) : (
          <></>
        )}
        {userList[selectedUserID]?.offline && (
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
  row: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'baseline',
    paddingVertical: 10,
    ...Platform.select({
      android: {
        height: 40,
      },
      ios: {
        height: 40,
      },
    }),
  },
  backButton: {
    marginHorizontal: 10,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  name: {
    fontWeight: isWeb ? '500' : '700',
    color: $config.PRIMARY_FONT_COLOR,
    textAlign: 'left',
    marginRight: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
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
