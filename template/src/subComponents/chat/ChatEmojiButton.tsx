import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import EmojiPicker from 'emoji-picker-react';

interface ChatEmojiButtonProps {
  onEmojiClick: (emojiObject: {emoji: string; names: string[]}) => void;
}

const ChatEmojiButton: React.FC<ChatEmojiButtonProps> = ({onEmojiClick}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiButtonClick = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiClick = (emojiObject: {emoji: string; names: string[]}) => {
    onEmojiClick(emojiObject);
    setShowEmojiPicker(false);
  };

  return (
    <View style={styles.container}>
      {!showEmojiPicker && (
        <TouchableOpacity onPress={handleEmojiButtonClick}>
          <Text style={{fontSize: 20}}>😀</Text>
        </TouchableOpacity>
      )}

      {showEmojiPicker && (
        <View style={styles.emojiContainer}>
          <EmojiPicker
            style={styles.emojiPicker}
            onEmojiClick={handleEmojiClick}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiContainer: {},
  emojiPicker: {
    width: '100%',
  },
});

export default ChatEmojiButton;
