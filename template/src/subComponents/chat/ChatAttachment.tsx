import React from 'react';
import {StyleSheet} from 'react-native';
import {useChatUIControls} from '../../components/chat-ui/useChatUIControls';
import IconButton from '../../../src/atoms/IconButton';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const onPress = () => {};
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
        iconContainerStyle: {
          padding: 4,
        },
        iconSize: 24,
        name: 'chat_attachment',
        tintColor: $config.SECONDARY_ACTION_COLOR,
      }}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({});
