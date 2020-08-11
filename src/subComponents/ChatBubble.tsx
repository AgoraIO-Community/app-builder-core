import React from 'react';
import {View, Text} from 'react-native';
import styles from '../components/styles';
import {channelMessage} from '../components/ChatContext';

const ChatBubble = (props: channelMessage) => {
  let {type, msg, ts, uid} = props;
  let time = new Date(ts).getHours() + ':' + new Date(ts).getMinutes();
  return (
    <View>
      {!type ? (
        <View style={type ? styles.chatSenderViewLocal : styles.chatSenderView}>
          <Text style={styles.chatSenderText}>{uid}</Text>
          <Text style={styles.blackText}>{time}</Text>
        </View>
      ) : (
        <></>
      )}
      <View style={type ? styles.chatBubbleLocal : styles.chatBubble}>
        <Text style={type ? styles.whiteText : styles.blackText}>
          {msg.slice(1)}
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;
