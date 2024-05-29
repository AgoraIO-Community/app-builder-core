import React from 'react';
import {StyleSheet} from 'react-native';
import IconButton from '../../../src/atoms/IconButton';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from 'customization-api';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Toast from '../../../react-native-toast-message';
import {
  File,
  MAX_UPLOAD_SIZE,
  UploadStatus,
  useChatUIControls,
} from '../../components/chat-ui/useChatUIControls';
import {ChatMessageType} from '../../components/chat-messages/useChatMessages';
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

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const {data} = useRoomInfo();
  const {privateChatUser, setUploadStatus, setUploadedFiles, uploadStatus} =
    useChatUIControls();
  const {uploadAttachment} = useChatConfigure();
  const toastHeadingType = useString(chatUploadErrorToastHeading)();
  const toastHeadingSize = useString(chatUploadErrorFileSizeToastHeading)();
  const errorSubHeadingSize = useString(chatUploadErrorFileSizeToastSubHeading);
  const errorSubHeadingType = useString(chatUploadErrorFileTypeToastSubHeading);

  const fileAllowedTypes = {
    zip: true,
    txt: true,
    doc: true,
    pdf: true,
    docx: true,
    ppt: true,
    pptx: true,
    xls: true,
    xlsx: true,
    csv: true,
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
    const uploadedFileType = file.filetype.toLowerCase();
    const isImageUploaded = uploadedFileType in imageAllowedTypes;
    const isFileUploaded = uploadedFileType in fileAllowedTypes;

    if (file.data.size > MAX_UPLOAD_SIZE * 1024 * 1024) {
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
    if (!(isImageUploaded || isFileUploaded)) {
      // Toast.show({
      //   leadingIconName: 'chat_attachment_unknown',
      //   type: 'info',
      //   text1: toastHeadingType,
      //   text2: errorSubHeadingType(file.filetype),
      //   visibilityTime: 3000,
      //   primaryBtn: null,
      //   secondaryBtn: null,
      // });

      return;
    }

    if (!selectedFile) return;

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
  };
  const onPress = () => {
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };
  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <input
        type="file"
        accept="image/jpeg, image/png, image/gif, image/bmp, .zip, .txt, .doc, .pdf, .docx, .ppt, .pptx, .xls, .xlsx, .csv"
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
        disabled={uploadStatus === UploadStatus.IN_PROGRESS ? true : false}
        iconProps={{
          iconType: 'plain',
          iconContainerStyle: {
            padding: 4,
          },
          iconSize: 24,
          name: 'chat_attachment',
          tintColor:
            uploadStatus === UploadStatus.IN_PROGRESS
              ? $config.SEMANTIC_NEUTRAL
              : $config.SECONDARY_ACTION_COLOR,
        }}
        onPress={onPress}
      />
    </>
  );
};

const styles = StyleSheet.create({});
