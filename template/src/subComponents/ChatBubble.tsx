import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ChatContext, {channelMessage} from '../components/ChatContext';
import ColorContext from '../components/ColorContext';

const ChatBubble = (props: channelMessage) => {
  const {userList} = useContext(ChatContext);
  const {primaryColor} = useContext(ColorContext);
  let {isLocal, msg, ts, uid} = props;
  let time = new Date(ts).getHours() + ':' + new Date(ts).getMinutes();
  return (
    <View>
      <View style={isLocal ? style.chatSenderViewLocal : style.chatSenderView}>
        <Text style={isLocal ? style.timestampTextLocal : style.timestampText}>
          {userList[uid] ? userList[uid].name : 'User'} | {time + ' '}
        </Text>
      </View>
      <View
        style={
          isLocal
            ? [style.chatBubbleLocal, {backgroundColor: primaryColor}]
            : style.chatBubble
        }>
        <Text
          style={isLocal ? style.whiteText : style.blackText}
          selectable={true}>
          {msg.slice(1) + ' '}
        </Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
  },
  chatSenderViewLocal: {
    flex: 2,
    marginVertical: 2,
    flexDirection: 'row',
    marginRight: 15,
    // marginLeft: 30,
    justifyContent: 'flex-end',
  },
  chatSenderView: {
    flex: 2,
    marginVertical: 2,
    flexDirection: 'row',
    marginRight: 30,
    marginLeft: 15,
  },
  timestampText: {
    color: $config.tertiaryFontColor,
    fontWeight: '500',
    fontSize: 12,
    flex: 1,
    // textAlign: 'right',
  },
  timestampTextLocal: {
    color: $config.tertiaryFontColor,
    fontWeight: '500',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
  chatBubble: {
    backgroundColor: $config.primaryFontColor + '80',
    flex: 1,
    // width: 'max-content',
    maxWidth: '80%',
    alignSelf: 'flex-start',
    display: 'flex',
    marginVertical: 5,
    padding: 8,
    marginRight: 30,
    marginLeft: 15,
    borderRadius: 10,
  },
  chatBubbleLocal: {
    backgroundColor: $config.primaryColor,
    maxWidth: '80%',
    flex: 1,
    display: 'flex',
    alignSelf: 'flex-end',
    marginVertical: 5,
    padding: 8,
    marginRight: 15,
    marginLeft: 30,
    borderRadius: 10,
  },
  whiteText: {
    color: $config.secondaryFontColor,
    fontWeight: '500',
  },
  blackText: {
    color: $config.primaryFontColor,
    fontWeight: '500',
  },
});

export default ChatBubble;
