import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';
import {useChatConfigure} from '../../../src/components/chat/chatConfigure';
import {MoreMessageOptions} from './ChatQuickActionsMenu';
import {hexadecimalTransparency} from 'customization-api';
import EmojiPicker, {type EmojiType} from 'rn-emoji-keyboard';

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
          tintColor: $config.SEMANTIC_NEUTRAL,
        }}
        onPress={onPress}
      />
    </View>
  );
};

export const ChatEmojiPicker = ({
  isEmojiPickerOpen,
  setIsEmojiPickerOpen,
  onEmojiSelect,
}) => {
  const handleEmojiClick = ({emoji}) => {
    onEmojiSelect(emoji);
  };
  return (
    <View style={styles.emojiContainer} testID={'emoji-container'}>
      <EmojiPicker
        onEmojiSelected={handleEmojiClick}
        open={isEmojiPickerOpen}
        categoryPosition="top" // floating' | 'top' | 'bottom'
        onClose={() => setIsEmojiPickerOpen(false)}
        theme={{
          backdrop:
            $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['60%'], // need design input
          knob: $config.SECONDARY_ACTION_COLOR,
          container: $config.CARD_LAYER_3_COLOR,
          header: $config.FONT_COLOR,
          category: {
            icon: $config.SECONDARY_ACTION_COLOR,
            iconActive: $config.SECONDARY_ACTION_COLOR, // need design input
            container: $config.CARD_LAYER_2_COLOR,
            containerActive: $config.PRIMARY_ACTION_BRAND_COLOR, // need design input
          },
        }}
      />
    </View>
  );
};

export const ReactionPicker = props => {
  const {setMessage, showEmojiPicker, setShowEmojiPicker} = useChatUIControls();
  const {addReaction} = useChatConfigure();
  const {messageId, isLocal, userId, type, message, setIsHovered} = props;

  //	Controls the reactions to display in the reactions picker. Takes unified emoji ids
  const reactions = [
    {emoji: '❤️', unified: '2665-fe0f'},
    {emoji: '👍', unified: '1f44d'},
    {emoji: '🎉', unified: '1f389'},
    {
      emoji: '🤣',
      unified: '1f923',
    },
  ];

  const handleReactionClick = emoji => {
    addReaction(messageId, emoji);
    setIsHovered(false);
  };

  return (
    <View
      style={[styles.reactionsContainer, isLocal ? {right: 0} : {left: 0}]}
      testID={'reaction-container'}>
      {reactions.map((emojiObject, index) => (
        <React.Fragment key={emojiObject.unified}>
          <TouchableOpacity
            style={styles.emojiWrapper}
            onPress={() => handleReactionClick(emojiObject.emoji)}>
            <Text style={{fontSize: 16}}>{emojiObject.emoji}</Text>
          </TouchableOpacity>
          {index === reactions.length - 1 && (
            <>
              <CustomReactionPicker
                isLocal={isLocal}
                messageId={messageId}
                setIsHovered={setIsHovered}
              />

              <MoreMessageOptions
                userId={userId}
                isLocal={isLocal}
                messageId={messageId}
                type={type}
                message={message}
                setIsHovered={setIsHovered}
              />
            </>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export const CustomReactionPicker = ({isLocal, setIsHovered, messageId}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
  const {addReaction} = useChatConfigure();
  const handleCustomReactionClick = (emoji: string) => {
    addReaction(messageId, emoji);
    setIsHovered(false);
  };

  return (
    <View>
      <IconButton
        hoverEffect={false}
        hoverEffectStyle={{
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 24,
        }}
        iconProps={{
          iconType: 'plain',
          base64: false,
          iconContainerStyle: {
            padding: 2,
            marginHorizontal: 4,
          },
          iconSize: 20,
          name: 'add_reaction',
          tintColor:
            $config.SECONDARY_ACTION_COLOR + hexadecimalTransparency['75%'],
        }}
        onPress={() => {
          setIsEmojiPickerOpen(true);
        }}
      />
      {isEmojiPickerOpen ? (
        <ChatEmojiPicker
          isEmojiPickerOpen={isEmojiPickerOpen}
          setIsEmojiPickerOpen={setIsEmojiPickerOpen}
          onEmojiSelect={handleCustomReactionClick}
        />
      ) : (
        <></>
      )}
      {/* {isEmojiPickerOpen && (
        <CustomEmojiPicker
          containerStyle={[
            styles.customEmojiPickerContainer,
            isLocal ? {right: 0} : {left: 0},
          ]}
          isReactionPicker={true}
          handleEmojiClick={handleCustomReactionClick}
          handleEmojiClose={() => {
            setIsEmojiPickerOpen(false);
            setIsHovered(false);
          }}
        />
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  emojiContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
  },
  emojiWrapper: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: '100%',
    padding: 4,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
    borderRadius: 4,
    zIndex: 1,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  customEmojiPickerContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 350,
  },
});
