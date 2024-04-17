import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconButton from '../../../src/atoms/IconButton';
import DocumentPicker from 'react-native-document-picker';
import {useRoomInfo} from 'customization-api';
import Toast from '../../../react-native-toast-message';
import {
  useChatUIControls,
  UploadStatus,
} from '../../components/chat-ui/useChatUIControls';
import {useChatConfigure} from '../../components/chat/chatConfigure.native';
import {ChatMessageType} from '../../components/chat/useSDKChatMessages';
import {ChatError, ChatMessage} from 'react-native-agora-chat';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const {privateChatUser, setUploadStatus} = useChatUIControls();
  const {sendChatSDKMessage} = useChatConfigure();
  const {data} = useRoomInfo();

  const fileAllowedTypes = {
    zip: true,
    txt: true,
    doc: true,
    pdf: true,
  };

  const imageAllowedTypes = {
    jpg: true,
    jpeg: true,
    gif: true,
    png: true,
    bmp: true,
  };

  const onPress = async () => {
    console.warn('attachment open');
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.plainText,
          DocumentPicker.types.zip,
        ],
        presentationStyle: 'fullScreen',
        copyTo: 'documentDirectory',
      });

      //todo check for mime type of file above
      const uploadedFileType = result[0].type;
      const isImageUploaded = uploadedFileType.indexOf('image/') !== -1;
      const isFileUploaded = !isImageUploaded;
      const groupID = data.chat.group_id;

      console.warn('file info => ', result[0]);
      let filePath =
        Platform.OS === 'ios'
          ? result[0].fileCopyUri?.replace('file://', '')
          : result[0].fileCopyUri;
      console.warn('file path sending', filePath);
      // replace %20 with space otherwise giving file not found
      if (filePath?.includes('%20')) {
        filePath = filePath?.replace(/%20/g, ' ');
      }

      if (isImageUploaded || isFileUploaded) {
        const option = {
          type: isImageUploaded ? ChatMessageType.IMAGE : ChatMessageType.FILE,
          url: filePath,
          to: privateChatUser ? privateChatUser.toString() : groupID,
          chatType: privateChatUser ? 'singleChat' : 'groupChat',
          from: data.uid.toString(),
          fileName: result[0].name,
          ext: {
            file_length: result[0].size,
            file_ext: uploadedFileType,
          },
        };
        const onProgress = (localMsgId: string, progress: number) => {
          // always gives 100 , its in WIP for agoar-chat-native-sdk
          console.warn('upload in progress', progress);
          setUploadStatus(UploadStatus.IN_PROGRESS);
        };
        const onError = (localMsgId: string, error: ChatError) => {
          console.warn('upload on error', error);
          setUploadStatus(UploadStatus.FAILURE);
        };
        const onSuccess = (message: ChatMessage) => {
          console.warn('upload on success', message);
          setUploadStatus(UploadStatus.SUCCESS);
        };
        sendChatSDKMessage(option, {onProgress, onError, onSuccess});
      } else {
        Toast.show({
          leadingIconName: 'chat_attachment_unknown',
          type: 'info',
          text1: `Attachment Upload Error`,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          text2: `${uploadedFileType} is not supported `,
        });
      }

      // const allowedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', '.zip', '.txt', '.doc', '.pdf'];
      // if (!allowedFormats.some(format => result[0].type === format || result[0].name.endsWith(format))) {
      //   Toast.show({
      //     leadingIconName: 'alert',
      //     type: 'error',
      //     text2: 'Inavlid upload format',
      //     text1: 'Upload Failed',
      //     visibilityTime: 3000,
      //   });
      // }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error(err);
      }
    }
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
          name: 'chat_attachment',
          tintColor: $config.SECONDARY_ACTION_COLOR,
        }}
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({});
