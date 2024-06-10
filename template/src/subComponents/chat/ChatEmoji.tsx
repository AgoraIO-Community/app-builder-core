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
.chatEmojiPicker .epr-emoji-category-label {
  font-size:16px;
  color:${$config.SECONDARY_ACTION_COLOR};
  font-family:'Source Sans Pro';
  font-weight:600;
}
.chatEmojiPicker.epr-dark-theme{
  --epr-emoji-size: 32px;
  --epr-emoji-gap:4px;
  --epr-emoji-padding:4px;
  --epr-header-padding:12px;
  --epr-horizontal-padding:12px;
  --epr-category-label-height:24px;
  --epr-search-input-border-radius:4px;
  --epr-search-bar-inner-padding:8px;
  --epr-search-input-text-color:${$config.FONT_COLOR}

}
.chatEmojiPicker.epr-light-theme{
  --epr-emoji-size: 32px;
  --epr-emoji-gap:4px;
   --epr-emoji-padding:4px;
   --epr-header-padding:12px;
   --epr-horizontal-padding:12px;
   --epr-category-label-height:24px;
   --epr-search-input-border-radius:4px;
   --epr-search-bar-inner-padding:8px;
   --epr-search-input-text-color:${$config.FONT_COLOR}
}
.chatEmojiPicker .epr-category-nav {
  padding-top:0 !important
}
.chatEmojiPicker .epr-skin-tones {
  visibility:hidden
}

.chatEmojiPicker .epr-search-container input:focus {
border:1px solid ${$config.PRIMARY_ACTION_BRAND_COLOR}
}

.chatEmojiPicker .epr-icn-search {
  left:8px
}

.chatEmojiPicker .epr-icn-clear-search {
  visibility:hidden
}
.chatEmojiPicker .epr-search-container input {
  font-family:'Source Sans Pro' !important;
  font-size:14px;
  font-weight:400
}

`;

export const ChatEmojiPicker: React.FC = () => {
  const {setMessage, showEmojiPicker, setShowEmojiPicker} = useChatUIControls();

  const handleEmojiClick = (emojiObject: {emoji: string; names: string[]}) => {
    setMessage(prev =>
      prev ? prev + '  ' + emojiObject.emoji : emojiObject.emoji,
    );
    // setShowEmojiPicker(false);
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
        previewConfig={{showPreview: false}}
        height={370}
        autoFocusSearch={false}
        emojiStyle={EmojiStyle.NATIVE}
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
    <IconButton
      hoverEffect={true}
      hoverEffectStyle={{
        backgroundColor: $config.ICON_BG_COLOR,
        borderRadius: 24,
      }}
      iconProps={{
        iconType: 'plain',
        base64: false,
        hoverBase64: true,
        iconContainerStyle: {
          padding: 4,
        },
        iconSize: 24,
        name: 'chat_emoji',
        hoverIconName: 'chat_emoji_fill',
        tintColor: $config.SECONDARY_ACTION_COLOR,
      }}
      onPress={onPress}
    />
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
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
    marginBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default ChatEmojiButton;
