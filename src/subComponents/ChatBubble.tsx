import React from 'react';
import {View, Text} from 'react-native';
import styles from '../components/styles';
import {channelMessage} from '../components/ChatContext';

const ChatBubble = (props: channelMessage) => {
  let {type, msg, ts, uid} = props;
  let time = new Date(ts).getHours() + ':' + new Date(ts).getMinutes();
  return (
    <View>
      <View style={type ? styles.chatSenderViewLocal : styles.chatSenderView}>
        <Text style={{color: '#C1C1C1', fontWeight: '500', fontSize: 12}}>
          {uid} | {time}
        </Text>
      </View>
      <View style={type ? styles.chatBubbleLocal : styles.chatBubble}>
        <Text style={type ? styles.whiteText : styles.blackText}>
          {msg.slice(1)}
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;
