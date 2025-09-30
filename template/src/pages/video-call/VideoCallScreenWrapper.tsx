import React, {useContext, useEffect} from 'react';
import {PropsContext} from '../../../agora-rn-uikit';
import VideoCallScreen from '../video-call/VideoCallScreen';
import {useLocation} from '../../components/Router';
import {getParamFromURL} from '../../utils/common';
import {useUserPreference} from '../../components/useUserPreference';
import WhiteboardConfigure from '../../components/whiteboard/WhiteboardConfigure';
import ChatConfigure from '../../components/chat/chatConfigure';
import {useControlPermissionMatrix} from '../../components/controls/useControlPermissionMatrix';
import {useBreakoutRoomInfo} from '../../components/room-info/useSetBreakoutRoomInfo';
import {BreakoutChatInitializer} from '../../components/breakout-room/chat';
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
  const {breakoutRoomChannelData} = useBreakoutRoomInfo();

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
  const isBreakoutMode = breakoutRoomChannelData?.isBreakoutMode;

  // Wrap with BreakoutChatInitializer if in breakout mode and chat is enabled
  const videoWithBreakoutChat =
    canAccessChat && isBreakoutMode ? (
      <>
        <BreakoutChatInitializer />
        {videoComponent}
      </>
    ) : (
      videoComponent
    );

  if (canAccessChat && $config.ENABLE_WHITEBOARD) {
    configComponent = (
      <ChatConfigure>
        <WhiteboardConfigure>{videoWithBreakoutChat}</WhiteboardConfigure>
      </ChatConfigure>
    );
  } else if (canAccessChat) {
    configComponent = <ChatConfigure>{videoWithBreakoutChat}</ChatConfigure>;
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
