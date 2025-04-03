import React, {useContext, useEffect} from 'react';
import {PropsContext} from '../../../agora-rn-uikit';
import VideoCallScreen from '../video-call/VideoCallScreen';
import {isWebInternal} from '../../utils/common';
import {useLocation} from '../../components/Router';
import {getParamFromURL} from '../../utils/common';
import {useUserPreference} from '../../components/useUserPreference';
import WhiteboardConfigure from '../../components/whiteboard/WhiteboardConfigure';
import ChatConfigure from '../../components/chat/chatConfigure';
import {useControlPermissionMatrix} from '../../components/controls/useControlPermissionMatrix';
import {useContent, useEndCall} from 'customization-api';

const VideoCallScreenWithRecordingBot: React.FC = () => {
  const location = useLocation();
  const {setDisplayName} = useUserPreference();

  const recordingBotName = getParamFromURL(location?.search, 'user_name');

  useEffect(() => {
    setDisplayName(recordingBotName);
  }, []);
  return <VideoCallScreen />;
};

const VideoCallScreenWrapper: React.FC = () => {
  const {rtcProps} = useContext(PropsContext);
  let configComponent: React.ReactNode;

  const {isUserBaned} = useContent();
  const endCall = useEndCall();

  useEffect(() => {
    if (isUserBaned) {
      endCall();
    }
  }, [isUserBaned]);

  const videoComponent = rtcProps?.recordingBot ? (
    <VideoCallScreenWithRecordingBot />
  ) : (
    <VideoCallScreen />
  );

  const canAccessChat = useControlPermissionMatrix('chatControl');
  if (canAccessChat && $config.ENABLE_WHITEBOARD) {
    configComponent = (
      <ChatConfigure>
        <WhiteboardConfigure>{videoComponent}</WhiteboardConfigure>
      </ChatConfigure>
    );
  } else if (canAccessChat) {
    configComponent = <ChatConfigure>{videoComponent}</ChatConfigure>;
  } else if ($config.ENABLE_WHITEBOARD) {
    configComponent = (
      <WhiteboardConfigure>{videoComponent}</WhiteboardConfigure>
    );
  } else {
    configComponent = videoComponent;
  }
  return <>{configComponent}</>;
};

export default VideoCallScreenWrapper;
