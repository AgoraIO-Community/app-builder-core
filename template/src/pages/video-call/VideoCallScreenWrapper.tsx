import React, {useContext, useEffect} from 'react';
import {PropsContext} from '../../../agora-rn-uikit';
import VideoCallScreen from '../video-call/VideoCallScreen';
import {isWebInternal} from '../../utils/common';
import {useLocation} from '../../components/Router';
import {getParamFromURL} from '../../utils/common';
import {useUserPreference} from '../../components/useUserPreference';
import WhiteboardConfigure from '../../components/whiteboard/WhiteboardConfigure';
import ChatConfigure from '../../components/chat/chatConfigure';

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

  const videoComponent = rtcProps?.recordingBot ? (
    <VideoCallScreenWithRecordingBot />
  ) : (
    <VideoCallScreen />
  );

  if ($config.CHAT && $config.ENABLE_WHITEBOARD) {
    configComponent = (
      <ChatConfigure>
        <WhiteboardConfigure>{videoComponent}</WhiteboardConfigure>
      </ChatConfigure>
    );
  } else if ($config.CHAT) {
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
