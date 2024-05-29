import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import IconButton from '../../../src/atoms/IconButton';
import DocumentPicker from 'react-native-document-picker';
import {useRoomInfo} from 'customization-api';
import Toast from '../../../react-native-toast-message';
import {
  useChatUIControls,
  UploadStatus,
  MAX_UPLOAD_SIZE,
} from '../../components/chat-ui/useChatUIControls';
import {useChatConfigure} from '../../components/chat/chatConfigure.native';
import {
  ChatMessageType,
  SDKChatType,
  useChatMessages,
} from '../../components/chat-messages/useChatMessages';
import {
  ChatError,
  ChatMessage,
  ChatMessageChatType,
} from 'react-native-agora-chat';
import {isAndroid} from '../../utils/common';

import {
  chatUploadErrorToastHeading,
  chatUploadErrorFileSizeToastHeading,
  chatUploadErrorFileSizeToastSubHeading,
  chatUploadErrorFileTypeToastSubHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../utils/useString';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

interface ExtendedChatMessage extends ChatMessage {
  body: {
    localPath?: string;
    remotePath?: string;
    type: ChatMessageType;
  };
  attributes: {
    file_ext?: string;
    file_name?: string;
  };
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const {privateChatUser, setUploadStatus} = useChatUIControls();
  const {sendChatSDKMessage} = useChatConfigure();
  const {data} = useRoomInfo();

  const {addMessageToPrivateStore, addMessageToStore} = useChatMessages();

  const toastHeadingType = useString(chatUploadErrorToastHeading)();
  const toastHeadingSize = useString(chatUploadErrorFileSizeToastHeading)();
  const errorSubHeadingSize = useString(chatUploadErrorFileSizeToastSubHeading);
  const errorSubHeadingType = useString(chatUploadErrorFileTypeToastSubHeading);

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
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.csv,
        ],
        presentationStyle: 'fullScreen',
        copyTo: 'documentDirectory',
      });

      if (result[0].size > MAX_UPLOAD_SIZE * 1024 * 1024) {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: toastHeadingSize,
          text2: errorSubHeadingSize(MAX_UPLOAD_SIZE.toString()),
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
        });
        return;
      }

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
          chatType: privateChatUser
            ? SDKChatType.SINGLE_CHAT
            : SDKChatType.GROUP_CHAT,
          from: data.uid.toString(),
          fileName: result[0].name,
          ext: {
            file_length: result[0].size,
            file_ext: uploadedFileType.split('/')[1],
            file_name: result[0].name,
            file_url: filePath,
            from_platform: 'native',
          },
        };
        console.warn('chatOPtion', option);
        const onProgress = (localMsgId: string, progress: number) => {
          // always gives 100 , its in WIP for agoar-chat-native-sdk
          console.warn('upload in progress', progress);
          setUploadStatus(UploadStatus.IN_PROGRESS);
        };
        const onError = (localMsgId: string, error: ChatError) => {
          console.warn('upload on error', error);
          setUploadStatus(UploadStatus.FAILURE);
        };
        const onSuccess = (message: ExtendedChatMessage) => {
          console.warn('upload on success', message);
          const messageData = {
            msg: '',
            createdTimestamp: message.localTime,
            msgId: message.msgId,
            isDeleted: false,
            type: message.body.type,
            thumb: isAndroid()
              ? 'file://' + message.body?.localPath
              : message.body?.localPath,
            url: message.body?.remotePath,
            ext: message.attributes?.file_ext,
            fileName: message.attributes?.file_name,
          };
          console.warn('message data', messageData);

          // this is local user messages
          if (message.chatType === ChatMessageChatType.PeerChat) {
            addMessageToPrivateStore(Number(message.to), messageData, true);
          } else {
            addMessageToStore(Number(message.from), messageData);
          }

          setUploadStatus(UploadStatus.SUCCESS);
        };
        sendChatSDKMessage(option, {onProgress, onError, onSuccess});
      } else {
        Toast.show({
          leadingIconName: 'chat_attachment_unknown',
          type: 'info',
          text1: toastHeadingType,
          text2: errorSubHeadingType(uploadedFileType),
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
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
