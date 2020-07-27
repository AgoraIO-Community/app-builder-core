import React from 'react';
import {View, Text} from 'react-native';
import styles from '../components/styles';

const ChatBubble = (props) => {
  let {type} = props;
  return (
    <View>
      {!type ? (
        <View style={type ? styles.chatSenderViewLocal : styles.chatSenderView}>
          <Text style={styles.chatSenderText}>Ekaansh</Text>
          <Text style={styles.whiteText}>12:47 pm</Text>
        </View>
      ) : (
        <></>
      )}
      <View style={type ? styles.chatBubbleLocal : styles.chatBubble}>
        <Text style={type ? styles.whiteText : styles.blackText}>
          Sample message goes here. Sample message goes here.
        </Text>
      </View>
    </View>
  );
};

export default ChatBubble;
