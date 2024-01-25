import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';

const css = `
.chatEmojiPicker h2 {
  font-size:16px;
  color:${$config.SECONDARY_ACTION_COLOR};
  font-family:'Source Sans Pro'
}
.chatEmojiPicker  .epr-skin-tones {
  visibility:hidden
}

`;

export const ChatEmojiPicker: React.FC = () => {
  const {setMessage, showEmojiPicker, setShowEmojiPicker} = useChatUIControls();

  const handleEmojiClick = (emojiObject: {emoji: string; names: string[]}) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  return (
    <View style={styles.emojiContainer} testID={'emoji-container'}>
      <style type="text/css">{css}</style>
      <EmojiPicker
        style={styles.emojiPicker}
        onEmojiClick={handleEmojiClick}
        theme={
          $config.INPUT_FIELD_BACKGROUND_COLOR === '#FFFFFF'
            ? Theme.LIGHT
            : Theme.DARK
        }
        suggestedEmojisMode={SuggestionMode.RECENT}
        className="chatEmojiPicker"
        lazyLoadEmojis={true}
      />
      <View
        style={{
          width: 30,
          height: 30,
          position: 'absolute',
          top: 20,
          right: 8,
        }}>
        <IconButton
          hoverEffect={false}
          hoverEffectStyle={{
            backgroundColor: $config.ICON_BG_COLOR,
            borderRadius: 20,
          }}
          iconProps={{
            iconType: 'plain',
            iconContainerStyle: {
              padding: 5,
            },
            iconSize: 20,
            name: 'close',
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setShowEmojiPicker(false);
          }}
        />
      </View>
    </View>
  );
};

export const ChatEmojiButton: React.FC = () => {
  const {setMessage, showEmojiPicker, setShowEmojiPicker} = useChatUIControls();
  const handleEmojiButtonClick = () => {
    setShowEmojiPicker(true);
  };
  return (
    <TouchableOpacity onPress={handleEmojiButtonClick}>
      <Text style={{fontSize: 20}}>😀</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
  },
  emojiPicker: {
    width: '100%',

    border: 0,
  },
});

export default ChatEmojiButton;
