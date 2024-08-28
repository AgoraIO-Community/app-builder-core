import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import ThemeConfig from '../../../src/theme';
import {
  MAX_FILES_UPLOAD,
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {
  chatUploadStatusFailure,
  chatUploadStatusInProgress,
  chatUploadMaxLimit,
} from '../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../utils/useString';

const ChatUploadStatus = () => {
  const {uploadedFiles} = useChatUIControls();
  const inProgressText = useString(chatUploadStatusInProgress)();
  const failureText = useString(chatUploadStatusFailure)();
  const maxUploadText = useString(chatUploadMaxLimit)();

  const lastFileStatus =
    uploadedFiles.length > 0
      ? uploadedFiles[uploadedFiles.length - 1].upload_status
      : null;

  const isMaxFilesUploaded = uploadedFiles.length >= MAX_FILES_UPLOAD;

  let text = '';
  switch (lastFileStatus) {
    case UploadStatus.IN_PROGRESS:
      text = inProgressText;
      break;
    case UploadStatus.FAILURE:
      text = failureText;
      break;
  }

  if (isMaxFilesUploaded) {
    text = maxUploadText;
  }

  return text.length > 0 ? (
    <View
      style={[
        styles.chatStatusContainer,
        lastFileStatus === UploadStatus.FAILURE && {
          backgroundColor:
            $config.SEMANTIC_ERROR + hexadecimalTransparency['40%'],
        },
        isMaxFilesUploaded && {
          backgroundColor:
            $config.SEMANTIC_WARNING + hexadecimalTransparency['40%'],
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
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['40%'],
    borderBottomWidth: 0,
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
