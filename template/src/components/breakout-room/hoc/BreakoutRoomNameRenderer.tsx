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

import React from 'react';
import {useLocation} from '../../Router';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {useLocalUid} from '../../../../agora-rn-uikit';

export interface BreakoutRoomInfo {
  isInBreakoutMode: boolean;
  breakoutRoomName: string;
}

interface BreakoutRoomNameRendererProps {
  children: (breakoutRoomInfo: BreakoutRoomInfo) => React.ReactNode;
}

const BreakoutRoomNameRenderer: React.FC<BreakoutRoomNameRendererProps> = ({
  children,
}) => {
  const location = useLocation();
  const localUid = useLocalUid();
  const {breakoutGroups = []} = useBreakoutRoom();

  let breakoutRoomName = '';
  let isInBreakoutMode = false;
  let currentRoom = null;

  try {
    const searchParams = new URLSearchParams(location.search);
    isInBreakoutMode = searchParams.get('breakout') === 'true';

    if (isInBreakoutMode) {
      currentRoom = breakoutGroups?.find(
        group =>
          group.participants?.hosts?.includes(localUid) ||
          group.participants?.attendees?.includes(localUid),
      );

      if (currentRoom?.name) {
        breakoutRoomName = currentRoom.name;
      }
    }
  } catch (error) {
    // Safely handle cases where breakout context is not available
    console.log('BreakoutRoomNameRenderer: Breakout context not available');
  }

  const breakoutRoomInfo: BreakoutRoomInfo = {
    isInBreakoutMode,
    breakoutRoomName,
  };

  return <>{children(breakoutRoomInfo)}</>;
};

export default BreakoutRoomNameRenderer;
