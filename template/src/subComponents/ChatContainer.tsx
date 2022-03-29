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
import ChatContext from '../components/ChatContext';
import {BtnTemplate} from '../../agora-rn-uikit';
import TextWithTooltip from './TextWithTooltip';

/**
 * Chat container is the component which renders all the chat messages
 * It retrieves all the messages from the appropriate stores (Message store an provate message store)
 * and maps it to a ChatBubble
 */
const ChatContainer = (props: any) => {
  const {userList} = useContext(ChatContext);
  const {height, width} = useWindowDimensions();
  const {selectedUserID, privateActive, setPrivateActive, selectedUsername} =
    props;
  const {messageStore, localUid, privateMessageStore} = useContext(ChatContext);

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={style.containerView}>
      {privateActive && (
        <View style={style.row}>
          <View style={style.backButton}>
            <BtnTemplate
              style={[style.backIcon]}
              onPress={() => setPrivateActive(false)}
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
              value={selectedUsername}
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
          messageStore.map((message: any) => {
            return (
              <ChatBubble
                isLocal={localUid === message.uid}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
                key={message.ts}
              />
            );
          })
        ) : privateMessageStore[selectedUserID] ? (
          privateMessageStore[selectedUserID].map((message: any) => {
            return (
              <ChatBubble
                isLocal={localUid === message.uid}
                msg={message.msg}
                ts={message.ts}
                uid={message.uid}
                key={message.ts}
              />
            );
          })
        ) : (
          <></>
        )}
        {userList[selectedUserID]?.offline && (
          <View style={style.infoTextView}>
            <Text style={style.infoText}>User is offline</Text>
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
    fontWeight: Platform.OS === 'web' ? '500' : '700',
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
