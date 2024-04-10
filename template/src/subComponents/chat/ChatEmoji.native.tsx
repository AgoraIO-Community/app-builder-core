import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';

export interface ChatEmojiButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatEmojiButton = (props: ChatEmojiButtonProps) => {
  const {setShowEmojiPicker} = useChatUIControls();
  const onPress = () => {
    setShowEmojiPicker(prev => !prev);
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <View>
    <IconButton
      hoverEffect={true}
      hoverEffectStyle={{
        backgroundColor: $config.ICON_BG_COLOR,
        borderRadius: 24,
      }}
      iconProps={{
        iconType: 'plain',
        iconContainerStyle: {
          padding: 4,
        },
        iconSize: 24,
        name: 'chat_emoji',
        tintColor: $config.SECONDARY_ACTION_COLOR,
      }}
      onPress={onPress}
      />
      </View>
    
  );
};
export const ChatEmojiPicker = () => {
  return  <View style={styles.emojiContainer} testID={'emoji-container'}><Text style={{color:'white'}}> Native Emoji Picker</Text></View>
};

const styles = StyleSheet.create({
  emojiContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
  },
});
