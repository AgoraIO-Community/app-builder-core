import React from 'react';
import {StyleSheet} from 'react-native';
import IconButton from '../../../src/atoms/IconButton';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from 'customization-api';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Toast from '../../../react-native-toast-message';
import {
  File,
  MAX_FILES_UPLOAD,
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
import getUniqueID from '../../utils/getUniqueID';

export interface ChatAttachmentButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

export const ChatAttachmentButton = (props: ChatAttachmentButtonProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {data} = useRoomInfo();
  const {
    privateChatUser,
    setUploadStatus,
    setUploadedFiles,
    uploadStatus,
    setShowEmojiPicker,
    uploadedFiles,
  } = useChatUIControls();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowEmojiPicker(false); // This will close emoji picker on when file is uplaoded
    const files = e.target.files;

    if (files) {
      const fileArray = Array.from(files);
      let localUploadCount = uploadedFiles.length; // to track uploads
      const oversizedFileNames: string[] = []; // file names exceeding limit

      for (const file of fileArray) {
        if (localUploadCount >= MAX_FILES_UPLOAD) {
          return;
        }
        //  temporary input element as upload utils requires it
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.style.display = 'none';

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        tempInput.files = dataTransfer.files;

        const fileObj = AgoraChat.utils.getFileUrl(tempInput);

        const uploadedFileType = fileObj.filetype.toLowerCase();
        const isImageUploaded = uploadedFileType in imageAllowedTypes;
        const isFileUploaded = uploadedFileType in fileAllowedTypes;

        if (file.size > MAX_UPLOAD_SIZE * 1024 * 1024) {
          oversizedFileNames.push(file.name);
          continue;
        }
        if (!(isImageUploaded || isFileUploaded)) {
          return;
        }

        const uploadedFile: File = {
          file_id: getUniqueID(),
          file_name: file.name,
          file_ext: uploadedFileType,
          file_url: '',
          file_length: file.size,
          file_type: isImageUploaded
            ? ChatMessageType.IMAGE
            : ChatMessageType.FILE,
          file_obj: fileObj,
          upload_status: UploadStatus.IN_PROGRESS,
        };

        localUploadCount++;
        // Add the uploaded file to the state
        setUploadedFiles(prev => [...prev, uploadedFile]);

        try {
          // Start uploading the file and wait for it to complete
          await uploadAttachment(uploadedFile);
        } catch (error) {
          console.error(
            'Upload failed for file:',
            uploadedFile.file_name,
            error,
          );
          // Update the file status to FAILURE
          setUploadedFiles(prev => {
            const updatedFiles = prev.map(f =>
              f.file_id === uploadedFile.file_id
                ? {...f, upload_status: UploadStatus.FAILURE}
                : f,
            );
            return updatedFiles;
          });
        }
      }
      // Show the toast notification for oversized files, if any
      if (oversizedFileNames.length > 0) {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: toastHeadingSize,
          text2: errorSubHeadingSize(
            MAX_UPLOAD_SIZE.toString(),
            oversizedFileNames.join(', '),
          ),
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
        });
      }
    }
  };

  const onPress = () => {
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const isMaxFilesUploaded = uploadedFiles.length >= MAX_FILES_UPLOAD;
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
        multiple
      />
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={{
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 24,
        }}
        disabled={
          uploadStatus === UploadStatus.IN_PROGRESS || isMaxFilesUploaded
            ? true
            : false
        }
        iconProps={{
          iconType: 'plain',
          iconContainerStyle: {
            padding: 4,
          },
          iconSize: 24,
          name: 'chat_attachment',
          tintColor:
            uploadStatus === UploadStatus.IN_PROGRESS || isMaxFilesUploaded
              ? $config.SEMANTIC_NEUTRAL
              : $config.SECONDARY_ACTION_COLOR,
        }}
        onPress={onPress}
      />
    </>
  );
};

const styles = StyleSheet.create({});
