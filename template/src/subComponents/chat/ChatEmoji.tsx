import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {MoreMessageOptions} from './ChatQuickActionsMenu';
import {useChatConfigure} from '../../../src/components/chat/chatConfigure';

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

.reactionPicker.epr-dark-theme, .reactionPicker.epr-light-theme {
  --epr-emoji-size: 25px;
}
.reactionPicker .epr-emoji-category-label {
  font-size:14px
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
  const handleEmojiClose = () => {
    setShowEmojiPicker(false);
  };
  return (
    <View style={styles.emojiContainer} testID={'emoji-container'}>
      <CustomEmojiPicker
        handleEmojiClick={handleEmojiClick}
        handleEmojiClose={handleEmojiClose}
      />
    </View>
  );
};

const CustomEmojiPicker = ({
  handleEmojiClick,
  isReactionPicker = false,
  handleEmojiClose,
  containerStyle = {},
}) => {
  return (
    <View style={[{width: '100%'}, containerStyle]}>
      <style type="text/css">{css}</style>
      <EmojiPicker
        style={{...styles.emojiPicker}}
        onEmojiClick={handleEmojiClick}
        theme={
          $config.INPUT_FIELD_BACKGROUND_COLOR === '#FFFFFF'
            ? Theme.LIGHT
            : Theme.DARK
        }
        suggestedEmojisMode={SuggestionMode.RECENT}
        className={`chatEmojiPicker ${
          isReactionPicker ? 'reactionPicker' : ''
        }`}
        lazyLoadEmojis={true}
        previewConfig={{showPreview: false}}
        height={370}
        autoFocusSearch={false}
        emojiStyle={EmojiStyle.NATIVE}
      />
      {/* Close btn for emoji picker */}
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
            handleEmojiClose();
            // setShowEmojiPicker(false);
          }}
        />
      </View>
    </View>
  );
};

export const ReactionPicker = props => {
  const {setMessage, showEmojiPicker, setShowEmojiPicker} = useChatUIControls();
  const {addReaction} = useChatConfigure();
  const {messageId, isLocal, userId, type, message} = props;

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

  const CustomReactioPicker = ({isLocal}) => {
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
    const handleCustomReactionClick = (emojiObject: {
      emoji: string;
      names: string[];
    }) => {
      addReaction(messageId, emojiObject.emoji);
      setIsEmojiPickerOpen(false);
    };

    return (
      <>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={{
            backgroundColor: $config.ICON_BG_COLOR,
            borderRadius: 24,
          }}
          iconProps={{
            iconType: 'plain',
            base64: false,
            iconContainerStyle: {
              padding: 0,
            },
            iconSize: 20,
            name: 'add_reaction',
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setIsEmojiPickerOpen(true);
          }}
        />
        {isEmojiPickerOpen && (
          <CustomEmojiPicker
            containerStyle={[
              styles.customEmojiPickerContainer,
              isLocal ? {right: 0} : {left: 0},
            ]}
            isReactionPicker={true}
            handleEmojiClick={handleCustomReactionClick}
            handleEmojiClose={() => {
              setIsEmojiPickerOpen(false);
            }}
          />
        )}
      </>
    );
  };

  const handleReactionClick = emoji => {
    console.log('on reaction', emoji);
    addReaction(messageId, emoji);
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
            <Text style={{fontSize: 14}}>{emojiObject.emoji}</Text>
          </TouchableOpacity>
          {index === reactions.length - 1 && (
            <>
              <CustomReactioPicker isLocal={isLocal} />
              <MoreMessageOptions
                userId={userId}
                isLocal={isLocal}
                messageId={messageId}
                type={type}
                message={message}
              />
            </>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export interface ChatEmojiButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatEmojiButton = (props: ChatEmojiButtonProps) => {
  const {setShowEmojiPicker, uploadedFiles} = useChatUIControls();
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
  reactionsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: '100%',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
    borderRadius: 8,
    boxShadow: `0px 4px 10px 0px ${$config.SECONDARY_ACTION_COLOR} + hexadecimalTransparency['35%'] `,
    gap: 8,
    zIndex: 1,
  },
  emojiPicker: {
    width: '100%',
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
    marginBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  emojiWrapper: {
    width: 16,
    height: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  customEmojiPickerContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 350,
  },
});

export default ChatEmojiButton;
