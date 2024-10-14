/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import {createHook} from 'customization-implementation';
import React, {SetStateAction, useState, useRef} from 'react';
import {UidType} from '../../../agora-rn-uikit';

export enum ChatType {
  Group,
  //todo confirm memberlist with vineeth
  MemberList,
  Private,
}

export enum UploadStatus {
  NOT_STARTED = 'notStarted',
  IN_PROGRESS = 'inProgress',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface File {
  file_id: string;
  file_length: number;
  file_ext: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_obj: object;
  upload_status: UploadStatus;
}

export interface ChatUIControlsInterface {
  chatType: ChatType;
  privateChatUser: UidType;
  inputActive?: boolean;
  setChatType: (chatType: ChatType) => void;
  setPrivateChatUser: React.Dispatch<SetStateAction<UidType>>;
  setInputActive: React.Dispatch<SetStateAction<boolean>>;
  message: string;
  setMessage: React.Dispatch<SetStateAction<string>>;
  inputHeight: number;
  setInputHeight: React.Dispatch<SetStateAction<number>>;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<SetStateAction<boolean>>;
  uploadStatus: UploadStatus; // for mobile, where only one attchment per message sent
  setUploadStatus: React.Dispatch<SetStateAction<UploadStatus>>;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<SetStateAction<File[]>>;
  _resetTextareaHeight: () => void;
  _handleHeightChange: () => void;
  chatInputRef: any;
}

const ChatUIControlsContext = React.createContext<ChatUIControlsInterface>({
  chatType: ChatType.Group,
  privateChatUser: 0,
  message: '',
  setChatType: () => {},
  setPrivateChatUser: () => {},
  setMessage: () => {},
  inputActive: false,
  inputHeight: 0,
  setInputHeight: () => {},
  setInputActive: () => {},
  showEmojiPicker: false,
  setShowEmojiPicker: () => {},
  uploadStatus: UploadStatus.NOT_STARTED,
  setUploadStatus: () => {},
  uploadedFiles: [],
  setUploadedFiles: () => {},
  _resetTextareaHeight: () => {},
  _handleHeightChange: () => {},
  chatInputRef: null,
});

interface ChatUIControlsProviderProps {
  children: React.ReactNode;
}

// export const MIN_HEIGHT = 43;
// export const MAX_HEIGHT = 97;
// export const LINE_HEIGHT = 20;

export const MIN_HEIGHT = 48;
export const MAX_HEIGHT = 92;
export const LINE_HEIGHT = 17;
export const INITIAL_LINE_HEIGHT = 22;
export const MAX_UPLOAD_SIZE = 10; //MB
export const MAX_TEXT_MESSAGE_SIZE = 5; //KB
export const MAX_FILES_UPLOAD = 5;

const ChatUIControlsProvider = (props: ChatUIControlsProviderProps) => {
  const [chatType, setChatType] = useState<ChatType>(ChatType.Group);
  const [inputActive, setInputActive] = useState(false);
  const [privateChatUser, setPrivateChatUser] = useState<UidType>(0);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    UploadStatus.NOT_STARTED,
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const chatInputRef = useRef(null);

  const _resetTextareaHeight = () => {
    if (chatInputRef?.current) {
      chatInputRef.current.style.height = `${MIN_HEIGHT}px`;
      chatInputRef.current.style.overflow = 'hidden';
      chatInputRef.current.style.lineHeight = `${INITIAL_LINE_HEIGHT}px`;
    }
  };

  const _handleHeightChange = () => {
    if (!chatInputRef.current) {
      return;
    }
    chatInputRef.current.style.height = 0;
    if (chatInputRef.current.scrollHeight <= MIN_HEIGHT) {
      chatInputRef.current.style.lineHeight = `${INITIAL_LINE_HEIGHT}px`;
    } else {
      chatInputRef.current.style.lineHeight = `${LINE_HEIGHT}px`;
    }
    const DIV_HEIGHT = chatInputRef.current.scrollHeight;
    chatInputRef.current.style.height = `${
      DIV_HEIGHT < MIN_HEIGHT ? MIN_HEIGHT : DIV_HEIGHT
    }px`;
    chatInputRef.current.style.overflow = 'hidden';
    // Handle scroll when content increase the div height
    if (DIV_HEIGHT > MAX_HEIGHT) {
      chatInputRef.current.style.overflow = 'auto';
    }
  };

  return (
    <ChatUIControlsContext.Provider
      value={{
        chatType,
        setChatType,
        privateChatUser,
        setPrivateChatUser,
        message,
        setMessage,
        inputHeight,
        setInputHeight,
        inputActive,
        setInputActive,
        showEmojiPicker,
        setShowEmojiPicker,
        uploadStatus,
        setUploadStatus,
        uploadedFiles,
        setUploadedFiles,
        chatInputRef,
        _resetTextareaHeight,
        _handleHeightChange,
      }}>
      {props.children}
    </ChatUIControlsContext.Provider>
  );
};

/**
 * The ChatUIControl app state governs the chat ui.
 */
const useChatUIControls = createHook(ChatUIControlsContext);

export {ChatUIControlsProvider, useChatUIControls};
