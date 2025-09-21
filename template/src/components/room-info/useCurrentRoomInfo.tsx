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

import {useLocation} from '../Router';
import {RoomInfoContextInterface, useRoomInfo} from './useRoomInfo';
import {useBreakoutRoomInfo} from './useSetBreakoutRoomInfo';

export const useCurrentRoomInfo = (): RoomInfoContextInterface => {
  const mainRoomInfo = useRoomInfo(); // Always call - keeps public API intact
  const {breakoutRoomChannelData} = useBreakoutRoomInfo(); // Always call - follows Rules of Hooks
  const location = useLocation();

  const isBreakoutMode =
    new URLSearchParams(location.search).get('breakout') === 'true';

  // Return appropriate room info based on current mode
  if (isBreakoutMode && breakoutRoomChannelData) {
    return {
      ...mainRoomInfo,
      data: breakoutRoomChannelData,
    };
  }

  return mainRoomInfo;
};
