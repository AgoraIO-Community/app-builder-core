import {useCallback} from 'react';
import {useV2V, disconnectV2VUser} from './useVoice2Voice';
import {useLocalUid, useRtc, useRoomInfo} from 'customization-api';

export const useV2VDisconnect = () => {
  const {
    isV2VActive,
    setIsV2VActive,
    setIsV2VON,
    setV2vAPIError,
  } = useV2V();
  
  const localUid = useLocalUid();
  const {RtcEngineUnsafe} = useRtc();
  const {
    data: {channel},
  } = useRoomInfo();

  const handleV2VDisconnect = useCallback(async (): Promise<boolean> => {
   
    
    try {
      const success = await disconnectV2VUser(channel, localUid);
      
      if (success) {
        // Update all relevant states on successful disconnect
        setIsV2VActive(false);
        setIsV2VON(false);
        //@ts-ignore
        if (RtcEngineUnsafe.setV2VActive) {
          //@ts-ignore
          RtcEngineUnsafe.setV2VActive(false);
        }
        return true;
      } else {
        // Show error using V2V error handler
        setV2vAPIError('Unable to stop translation, please try again');
        return false;
      }
    } catch (error) {
      setV2vAPIError('Unable to stop translation, please try again');
      return false;
    }
  }, [
    isV2VActive,
    channel,
    localUid,
    setIsV2VActive,
    setIsV2VON,
    setV2vAPIError,
    RtcEngineUnsafe,
  ]);

  return {
    handleV2VDisconnect,
    isV2VActive,
  };
};