import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import ThemeConfig from '../../../src/theme';
import {
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';

const ChatUploadStatus = () => {
  const {uploadStatus} = useChatUIControls();
  let text = '';
  switch (uploadStatus) {
    case UploadStatus.IN_PROGRESS:
      text = 'Uploading... Please wait';
      break;
    case UploadStatus.FAILURE:
      text = `Something went wrong while sharing.Let'as try again`;
      break;
  }
  return (
    <View style={styles.chatStatusContainer}>
      <Text style={styles.chatStatusText}>{text}</Text>
    </View>
  );
};

export default ChatUploadStatus;

const styles = StyleSheet.create({
  chatStatusContainer: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: $config.SEMANTIC_NEUTRAL + hexadecimalTransparency['15%'],
  },
  chatStatusText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    lineHeight: 14.5,
    fontStyle: 'italic',
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    textAlign: 'center',
  },
});
