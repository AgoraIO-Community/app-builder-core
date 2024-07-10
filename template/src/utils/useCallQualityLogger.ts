import {useLocalUid, useRtc} from 'customization-api';
import {useEffect} from 'react';
import {isAndroid, isIOS} from './common';
import {LogSource, logger} from '../logger/AppBuilderLogger';

export const useCallQualityLogger = () => {
  const {RtcEngineUnsafe} = useRtc();
  const localUid = useLocalUid();

  const checkIfDataIsValid = data => {
    if (data && Object.keys(data)?.length) {
      const values = Object.values(data);
      const isAllZero = values.every(item => item === 0);
      if (isAllZero) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const logCallQuality = () => {
    if (!isAndroid() && !isIOS()) {
      //@ts-ignore
      const videoStats = RtcEngineUnsafe?.getAllRemoteVideoStats();
      if (checkIfDataIsValid(videoStats)) {
        logger.log(LogSource.AgoraSDK, 'API', 'getRemoteVideoStats', {
          localUid,
          videoStats,
        });
      }
      //@ts-ignore
      const audioStats = RtcEngineUnsafe?.getAllRemoteAudioStats();
      if (checkIfDataIsValid(audioStats)) {
        logger.log(LogSource.AgoraSDK, 'API', 'getRemoteAudioStats', {
          localUid,
          audioStats,
        });
      }
      //@ts-ignore
      const localVideoStats = RtcEngineUnsafe?.getLocalVideoStats();
      if (checkIfDataIsValid(localVideoStats)) {
        logger.log(LogSource.AgoraSDK, 'API', 'getLocalVideoStats', {
          localUid,
          localVideoStats,
        });
      }

      //@ts-ignore
      const localAudioStats = RtcEngineUnsafe?.getLocalAudioStats();
      if (checkIfDataIsValid(localAudioStats)) {
        logger.log(LogSource.AgoraSDK, 'API', 'getLocalAudioStats', {
          localUid,
          localAudioStats,
        });
      }
    }
  };

  useEffect(() => {
    /**
     * Log audio/video quality details each 30 sec
     */
    let interval = null;
    interval = setInterval(logCallQuality, 1000 * 30);

    return () => {
      interval && clearInterval(interval);
    };
  }, []);
};
