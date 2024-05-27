import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';
//import data from 'emoji-mart-native/data/google.json';
import {Picker} from 'emoji-mart-native';

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
  const {setShowEmojiPicker, setMessage} = useChatUIControls();
  const handleEmojiClick = emoji => {
    setMessage(prev => prev + ' ' + emoji.native);
  };
  return (
    <View style={styles.emojiContainer} testID={'emoji-container'}>
      <Picker
        //data={data}
        // autoFocus={true}
        native={true}
        emojiSize={28}
        perLine={9}
        onPressClose={() => setShowEmojiPicker(false)}
        showSkinTones={false}
        color={$config.PRIMARY_ACTION_BRAND_COLOR}
        theme={
          $config.INPUT_FIELD_BACKGROUND_COLOR === '#FFFFFF' ? 'light' : 'dark'
        }
        showCloseButton={true}
        onSelect={handleEmojiClick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emojiContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
  },
});
