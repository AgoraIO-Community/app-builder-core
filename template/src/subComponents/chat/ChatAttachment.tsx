import React from 'react';
import {StyleSheet} from 'react-native';
import IconButton from '../../../src/atoms/IconButton';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from 'customization-api';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Toast from '../../../react-native-toast-message';
import {
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {ChatMessageType} from '../../components/chat/useSDKChatMessages';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const {data} = useRoomInfo();
  const {sendChatSDKMessage} = useChatConfigure();
  const {privateChatUser, setUploadStatus} = useChatUIControls();

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    const file = AgoraChat.utils.getFileUrl(e.target);
    const groupID = data.chat.group_id;
    const uploadedFileType = file.filetype.toLowerCase();
    const isImageUploaded = uploadedFileType in imageAllowedTypes;
    const isFileUploaded = uploadedFileType in fileAllowedTypes;

    if (isImageUploaded || isFileUploaded) {
      // check size    selectedFile.size
      // cehck type    selectedFile.type
      const option = {
        type: isImageUploaded ? ChatMessageType.IMAGE : ChatMessageType.FILE,
        from: data.uid.toString(),
        to: privateChatUser ? privateChatUser.toString() : groupID,
        file: file,
        chatType: privateChatUser ? 'singleChat' : 'groupChat',
        ext: {
          file_length: file.data.size,
          file_ext: uploadedFileType,
        },
        // Occurs when the image file fails to be uploaded.
        onFileUploadError: function () {
          setUploadStatus(UploadStatus.FAILURE);
          console.log('onFileUploadError');
        },
        // Reports the progress of uploading the image file.
        onFileUploadProgress: function (e: ProgressEvent) {
          setUploadStatus(UploadStatus.IN_PROGRESS);
          console.log(e);
        },
        // Occurs when the image file is successfully uploaded.
        onFileUploadComplete: function (e) {
          setUploadStatus(UploadStatus.SUCCESS);
          console.log('onFileUploadComplete');
          // update local store
        },
      };
      sendChatSDKMessage(option);
    } else {
      Toast.show({
        leadingIconName: 'chat_attachment_unknown',
        type: 'info',
        text1: `Attachment Upload Error`,
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        text2: `${file.filetype} is not supported `,
      });
    }
  };
  const onPress = () => {
    fileInputRef.current.click();
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <input
        type="file"
        accept="image/jpeg, image/png, image/gif, image/bmp, .zip, .txt, .doc, .pdf"
        onChange={handleFileUpload}
        style={{display: 'none'}}
        id={`file-input-`}
        ref={fileInputRef}
      />
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
    </>
  );
};

const styles = StyleSheet.create({});
