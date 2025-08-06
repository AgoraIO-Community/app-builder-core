import React, {useEffect} from 'react';
import {useRoomInfo, useRtc} from 'customization-api';
import {VideoCallProps} from '../VideoCall';

const VideoCallStateSetup: React.FC<VideoCallProps> = ({
  setMainRtcEngine,
  setMainChannelDetails,
}) => {
  const {RtcEngineUnsafe} = useRtc();
  const {data: roomInfo} = useRoomInfo();

  // Listen for engine changes and notify orchestrator
  useEffect(() => {
    if ($config.ENABLE_BREAKOUT_ROOM && RtcEngineUnsafe && setMainRtcEngine) {
      console.log(
        'supriya [VideoCallStateSetup] Engine ready, storing in state',
      );
      setMainRtcEngine(RtcEngineUnsafe);
    }
  }, [RtcEngineUnsafe, setMainRtcEngine]);

  // Listen for channel details and notify orchestrator
  useEffect(() => {
    if (
      $config.ENABLE_BREAKOUT_ROOM &&
      roomInfo?.channel &&
      setMainChannelDetails
    ) {
      console.log(
        'supriya [VideoCallStateSetup] Channel details ready, storing in state',
      );
      setMainChannelDetails({
        channel: roomInfo.channel || '',
        token: roomInfo.token || '',
        uid: roomInfo.uid || 0,
        screenShareToken: roomInfo.screenShareToken,
        screenShareUid: roomInfo.screenShareUid,
        rtmToken: roomInfo.rtmToken,
      });
    }
  }, [roomInfo, setMainChannelDetails]);

  // This component only handles effects, renders nothing
  return null;
};

export default VideoCallStateSetup;
