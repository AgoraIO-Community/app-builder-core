/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useEffect} from 'react';
import events from '../../../rtm-events-api';
import {BreakoutRoomEventNames} from './constants';

interface Props {
  children: React.ReactNode;
}
const BreakoutRoomEventsConfigure: React.FC<Props> = ({children}) => {
  useEffect(() => {
    events.on(BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT, data => {
      console.log('supriya BREAKOUT_ROOM_ANNOUNCEMENT data: ', data);
      //  Toast.show({
      //         leadingIconName: 'video-off',
      //         type: 'info',
      //         // text1: `${
      //         //   defaultContentRef.current.defaultContent[sender].name || 'The host'
      //         // } muted you.`,
      //         text1:
      //         visibilityTime: 3000,
      //         primaryBtn: null,
      //         secondaryBtn: null,
      //         leadingIcon: null,
      //       });
    });
    events.on(BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER, data => {
      console.log('supriya BREAKOUT_ROOM_MAKE_PRESENTER data: ', data);
    });

    return () => {
      events.off(BreakoutRoomEventNames.BREAKOUT_ROOM_ANNOUNCEMENT);
      events.off(BreakoutRoomEventNames.BREAKOUT_ROOM_MAKE_PRESENTER);
    };
  }, []);

  return <>{children}</>;
};

export default BreakoutRoomEventsConfigure;
