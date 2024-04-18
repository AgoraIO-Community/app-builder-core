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
  return text.length > 0 ? (
    <View
      style={[
        styles.chatStatusContainer,
        uploadStatus === UploadStatus.FAILURE && {
          backgroundColor:
            $config.SEMANTIC_ERROR + hexadecimalTransparency['40%'],
        },
      ]}>
      <Text style={styles.chatStatusText}>{text}</Text>
    </View>
  ) : null;
};

export default ChatUploadStatus;

const styles = StyleSheet.create({
  chatStatusContainer: {
    flexGrow: 1,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: $config.SEMANTIC_NEUTRAL + hexadecimalTransparency['15%'],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
