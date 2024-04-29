import React from 'react';
import {StyleSheet} from 'react-native';
import IconButton from '../../../src/atoms/IconButton';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from 'customization-api';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Toast from '../../../react-native-toast-message';
import {
  File,
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {ChatMessageType} from '../../components/chat-messages/useChatMessages';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const {data} = useRoomInfo();
  const {privateChatUser, setUploadStatus, setUploadedFiles} =
    useChatUIControls();
  const {uploadAttachment} = useChatConfigure();

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
    const fromUid = data.uid.toString();
    const chatType = privateChatUser ? 'singleChat' : 'groupChat';
    const toUid = privateChatUser ? privateChatUser.toString() : groupID;
    const uploadedFileType = file.filetype.toLowerCase();
    const isImageUploaded = uploadedFileType in imageAllowedTypes;
    const isFileUploaded = uploadedFileType in fileAllowedTypes;

    if (!selectedFile) return;

    const CHAT_APP_KEY = `${$config.CHAT_ORG_NAME}#${$config.CHAT_APP_NAME}`;
    const uploadedFile: File = {
      file_name: file.filename,
      file_ext: uploadedFileType,
      file_url: '',
      file_length: 0,
      file_type: isImageUploaded ? ChatMessageType.IMAGE : ChatMessageType.FILE,
      file_obj: file,
    };
    // currently supporting only 1 upload
    // setUploadedFiles(prev => [...prev, uploadedFile]);
    setUploadedFiles(prev => [uploadedFile]);

    uploadAttachment(uploadedFile);

    if (!(isImageUploaded || isFileUploaded)) {
      {
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
