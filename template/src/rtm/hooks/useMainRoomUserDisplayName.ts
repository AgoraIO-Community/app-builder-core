/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import {videoRoomUserFallbackText} from '../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../utils/useString';
import {UidType} from '../../../agora-rn-uikit';
import {useRTMGlobalState} from '../RTMGlobalStateProvider';
import {useContent} from 'customization-api';
/**
 * Hook to get user display names with fallback to main room RTM users
 * This ensures users in breakout rooms can see names of users in other rooms
 */
export const useMainRoomUserDisplayName = () => {
  const {mainRoomRTMUsers} = useRTMGlobalState();
  const {defaultContent} = useContent();
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();

  return (uid: UidType): string => {
    // Priority: Local defaultContent → Global mainRoomRTMUsers → UID fallback
    return (
      defaultContent?.[uid]?.name ||
      mainRoomRTMUsers?.[uid]?.name ||
      remoteUserDefaultLabel
    );
  };
};
