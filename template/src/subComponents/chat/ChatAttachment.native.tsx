import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconButton from '../../../src/atoms/IconButton';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps)  => {

  const onPress = () => {
    console.warn("attachment open")
  };
  return props?.render ? (
    props.render(onPress)
  ) :(

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
          name: 'chat_attachment',
          tintColor: $config.SECONDARY_ACTION_COLOR,
        }}
        onPress={onPress}
      />
    </View>
  )
};

const styles = StyleSheet.create({});
