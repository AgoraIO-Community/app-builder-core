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

import React, {useState, useEffect, useContext, useCallback} from 'react';
import {IRtcEngine} from 'react-native-agora';
import VideoCall from '../pages/VideoCall';
import BreakoutRoomVideoCall from './BreakoutRoomVideoCall';
import {useParams, useHistory, useLocation} from '../components/Router';
import events from '../rtm-events-api';
import {EventNames} from '../rtm-events';
import {BreakoutChannelJoinEventPayload} from '../components/breakout-room/state/types';

export interface VideoRoomOrchestratorState {
  rtcEngine: IRtcEngine | null;
  channelDetails: {
    channel: string;
    uid: number | string;
    token: string;
    screenShareUid: number | string;
    screenShareToken: string;
    rtmToken: string;
  };
}

const VideoCallRoomOrchestrator: React.FC = () => {
  const {phrase} = useParams<{phrase: string}>();
  const history = useHistory();
  const location = useLocation();

  // Parse query parameters from location.search
  const searchParams = new URLSearchParams(location.search);
  const callActive = searchParams.get('call') === 'true';
  const isBreakoutRoomActive = searchParams.get('breakout') === 'true';

  // Main room state
  const [mainRoomState, setMainRoomState] =
    useState<VideoRoomOrchestratorState>({
      rtcEngine: null,
      channelDetails: {
        channel: null,
        uid: null,
        token: null,
        screenShareUid: null,
        screenShareToken: null,
        rtmToken: null,
      },
    });

  // Breakout room state
  const [breakoutRoomState, setBreakoutRoomState] =
    useState<VideoRoomOrchestratorState>({
      rtcEngine: null,
      channelDetails: {
        channel: null,
        uid: null,
        token: null,
        screenShareUid: null,
        screenShareToken: null,
        rtmToken: null,
      },
    });

  useEffect(() => {
    const handleBreakoutJoin = evtData => {
      const {payload, sender, ts, source} = evtData;
      const data: BreakoutChannelJoinEventPayload = JSON.parse(payload);
      console.log(
        'supriya [VideoCallRoomOrchestrator] onBreakoutRoomJoinDetailsReceived data: ',
        data,
      );
      const {channel_name, mainUser, screenShare, chat} = data.data.data;

      try {
        setBreakoutRoomState(prev => ({
          ...prev,
          channelDetails: {
            channel: channel_name,
            token: mainUser.rtc,
            uid: mainUser?.uid || 0,
            screenShareToken: screenShare.rtc,
            screenShareUid: screenShare.uid,
            rtmToken: mainUser.rtm,
          },
        }));
        // Navigate to breakout roo
        history.push(`/${phrase}?call=true&breakout=true`);
      } catch (error) {
        console.log(
          ' handleBreakoutJoin [VideoCallRoomOrchestrator]  error: ',
          error,
        );
      }
    };
    events.on(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);
    return () => {
      events.off(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);
    };
  }, [history, phrase]);

  // // RTM listeners for breakout events
  // useEffect(() => {
  //   const handleBreakoutLeave = () => {
  //     console.log(
  //       `[VideoCallRoomOrchestrator] Leaving breakout room, returning to main`,
  //     );

  //     // Return to main room
  //     history.push(`/${phrase}?call=true`);
  //   };

  //   // TODO: Implement RTM event listeners
  //   // RTMManager.on('BREAKOUT_JOIN', handleBreakoutJoin);
  //   // RTMManager.on('BREAKOUT_LEAVE', handleBreakoutLeave);

  //   // For now, we'll expose these functions globally for testing
  //   if (typeof window !== 'undefined') {
  //     (window as any).joinBreakoutRoom = handleBreakoutJoin;
  //     (window as any).leaveBreakoutRoom = handleBreakoutLeave;
  //   }

  //   return () => {
  //     // RTMManager.off('BREAKOUT_JOIN', handleBreakoutJoin);
  //     // RTMManager.off('BREAKOUT_LEAVE', handleBreakoutLeave);

  //     if (typeof window !== 'undefined') {
  //       delete (window as any).joinBreakoutRoom;
  //       delete (window as any).leaveBreakoutRoom;
  //     }
  //   };
  // }, [phrase, history, roomInfo]);

  // Helper functions to update RTC engines
  const setMainRtcEngine = useCallback((engine: IRtcEngine) => {
    console.log('supriya [VideoCallRoomOrchestrator] Setting main RTC engine');
    setMainRoomState(prev => ({
      ...prev,
      rtcEngine: engine,
    }));
  }, []);

  const setMainChannelDetails = useCallback(
    (channelDetails: VideoRoomOrchestratorState['channelDetails']) => {
      console.log(
        'supriya [VideoCallRoomOrchestrator] Setting main RTC engine',
      );
      setMainRoomState(prev => ({
        ...prev,
        channelDetails: {...channelDetails},
      }));
    },
    [],
  );

  const setBreakoutRtcEngine = useCallback((engine: IRtcEngine) => {
    console.log('[VideoCallRoomOrchestrator] Setting breakout RTC engine');
    setBreakoutRoomState(prev => ({
      ...prev,
      rtcEngine: engine,
    }));
  }, []);

  // // Handle return to main room
  // const handleReturnToMain = () => {
  //   console.log('[VideoCallRoomOrchestrator] Returning to main room');
  //   history.push(`/${phrase}?call=true`);
  // };

  console.log('[VideoCallRoomOrchestrator] Rendering:', {
    isBreakoutRoom: isBreakoutRoomActive,
    callActive,
    phrase,
    mainChannel: {...mainRoomState},
    breakoutChannel: {...breakoutRoomState},
  });

  return (
    <>
      {isBreakoutRoomActive && breakoutRoomState?.channelDetails?.channel ? (
        <BreakoutRoomVideoCall
          setBreakoutRtcEngine={setBreakoutRtcEngine}
          storedBreakoutChannelDetails={breakoutRoomState.channelDetails}
        />
      ) : (
        <VideoCall
          setMainRtcEngine={setMainRtcEngine}
          setMainChannelDetails={setMainChannelDetails}
        />
      )}
    </>
  );
};

export default VideoCallRoomOrchestrator;
