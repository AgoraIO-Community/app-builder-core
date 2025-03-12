import React, {useContext, useRef, useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import {AgentContext} from '../AgentControls/AgentContext';
import {
  ChatBubble,
  ChatMessageType,
  ImageIcon,
  useLocalUid,
} from 'customization-api';
import hexadecimalTransparency from '../../../utils/hexadecimalTransparency';

// ChatItem Component
const ChatItemBubble = ({item}: {item: any}) => {
  const localUid = useLocalUid();
  return (
    <ChatBubble
      key={`${item.turn_id}-${item.uid}`}
      msgId={`${item.turn_id}-${item.uid}`}
      isLocal={localUid === item.uid}
      message={item.text ? item.text : item?.metadata?.text}
      createdTimestamp={item._time}
      uid={item.uid}
      isDeleted={false}
      isSameUser={false}
      type={ChatMessageType.TXT} //TODO: for images for vision modality
      agent_text_status={item.status}
      remoteUIConfig={{
        username: 'AI Agent',
        bubbleStyleLayer1: {
          backgroundColor: 'transparent',
          paddingLeft: 4,
          paddingRight: 0,
          paddingTop: 2,
          marginTop: 0,
        },
        bubbleStyleLayer2: {},
      }}
      disableReactions={true}
    />
  );
};

// Main Chat Component
const ChatScreen = () => {
  const {chatHistory} = useContext(AgentContext);
  const scrollViewRef = useRef<ScrollView>(null);
  const isAutoScrollEnabledRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Check if the user is at the bottom
  const getIsAtBottom = (event: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 10
    );
  };

  // Handle user scrolling
  const handleScroll = (event: any) => {
    if (getIsAtBottom(event)) {
      isAutoScrollEnabledRef.current = true;
      setShowScrollButton(false);
    } else {
      isAutoScrollEnabledRef.current = false;
      setShowScrollButton(true);
    }
  };

  // Auto-scroll when chat history updates
  useEffect(() => {
    if (chatHistory.length > 0 && isAutoScrollEnabledRef.current) {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }
  }, [chatHistory]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false, listener: handleScroll},
        )}
        scrollEventThrottle={200}>
        {chatHistory.map(item => {
          return <ChatItemBubble item={item} />;
        })}
      </ScrollView>
      {/* Scroll Down Button */}
      {showScrollButton && (
        <TouchableOpacity
          style={styles.scrollDownButton}
          onPress={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
            isAutoScrollEnabledRef.current = true;
          }}>
          <ImageIcon
            iconType="plain"
            name="down-arrow"
            tintColor={$config.SECONDARY_ACTION_COLOR}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  chatBubble: {
    maxWidth: '70%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  selfBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
    border: '1px solid blue',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
    border: '1px solid green',
  },
  chatText: {
    fontSize: 14,
    color: '#fff',
  },
  scrollDownButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
    padding: 8,
    borderRadius: 25,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
