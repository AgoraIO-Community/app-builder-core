import React, {useContext, useEffect} from 'react';
import {PropsContext} from '../../../agora-rn-uikit';
import VideoCallScreen from '../video-call/VideoCallScreen';
import {isWeb} from '../../utils/common';
import isSDK from '../../utils/isSDK';
import {useLocation} from '../../components/Router';
import {getParamFromURL} from '../../utils/common';
import {useUserPreference} from '../../components/useUserPreference';
import WhiteboardConfigure from '../../components/whiteboard/WhiteboardConfigure';

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

  if ($config.ENABLE_WHITEBOARD && (isWeb() || isSDK())) {
    return (
      <WhiteboardConfigure>
        {rtcProps?.recordingBot ? (
          <WhiteboardConfigure>
            <VideoCallScreenWithRecordingBot />
          </WhiteboardConfigure>
        ) : (
          <VideoCallScreen />
        )}
      </WhiteboardConfigure>
    );
  } else if (rtcProps?.recordingBot) {
    return <VideoCallScreenWithRecordingBot />;
  }
  return <VideoCallScreen />;
};

export default VideoCallScreenWrapper;
