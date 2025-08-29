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
import React, {useState, useEffect, useCallback} from 'react';
import VideoCall from '../pages/VideoCall';
import BreakoutRoomVideoCall from './BreakoutRoomVideoCall';
import {RTMCoreProvider} from '../rtm/RTMCoreProvider';
import {useParams, useHistory, useLocation} from '../components/Router';
import events from '../rtm-events-api';
import {EventNames} from '../rtm-events';
import {BreakoutChannelJoinEventPayload} from '../components/breakout-room/state/types';

export interface VideoRoomOrchestratorState {
  channel: string;
  uid: number | string;
  token: string;
  screenShareUid: number | string;
  screenShareToken: string;
  rtmToken: string;
}

const VideoCallRoomOrchestrator: React.FC = () => {
  const {phrase} = useParams<{phrase: string}>();
  const history = useHistory();
  const location = useLocation();

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const isBreakoutRoomActive = searchParams.get('breakout') === 'true';
  const breakoutChannelName = searchParams.get('channelName');

  // Main room state
  const [mainRoomState, setMainRoomState] =
    useState<VideoRoomOrchestratorState>({
      channel: phrase, // Use phrase as main channel
      uid: null,
      token: null,
      screenShareUid: null,
      screenShareToken: null,
      rtmToken: null,
    });

  // Breakout room state
  const [breakoutRoomState, setBreakoutRoomState] =
    useState<VideoRoomOrchestratorState>({
      channel: breakoutChannelName || null,
      uid: null,
      token: null,
      screenShareUid: null,
      screenShareToken: null,
      rtmToken: null,
    });

  // Listen for breakout room join events
  useEffect(() => {
    const handleBreakoutJoin = (evtData: any) => {
      const {payload} = evtData;
      const data: BreakoutChannelJoinEventPayload = JSON.parse(payload);
      console.log('[VideoCallRoomOrchestrator] Breakout join data:', data);

      const {channel_name, mainUser, screenShare} = data.data.data;

      try {
        // Update breakout room state
        setBreakoutRoomState({
          channel: channel_name,
          token: mainUser.rtc,
          uid: mainUser?.uid,
          screenShareToken: screenShare.rtc,
          screenShareUid: screenShare.uid,
          rtmToken: mainUser.rtm,
        });

        // Navigate to breakout room with proper URL
        history.push(`/${phrase}?breakout=true&channelName=${channel_name}`);
      } catch (error) {
        console.error(
          '[VideoCallRoomOrchestrator] Breakout join error:',
          error,
        );
      }
    };

    events.on(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);

    return () => {
      events.off(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);
    };
  }, [history, phrase]);

  // Handle leaving breakout room
  const handleLeaveBreakout = useCallback(() => {
    console.log('[VideoCallRoomOrchestrator] Leaving breakout room');

    // Clear breakout state
    setBreakoutRoomState({
      channel: null,
      uid: null,
      token: null,
      screenShareUid: null,
      screenShareToken: null,
      rtmToken: null,
    });

    // Return to main room
    history.push(`/${phrase}`);
  }, [history, phrase]);

  // Update main room details
  const setMainChannelDetails = useCallback(
    (channelInfo: VideoRoomOrchestratorState) => {
      console.log('[VideoCallRoomOrchestrator] Setting main channel details');
      setMainRoomState(prev => ({
        ...prev,
        ...channelInfo,
      }));
    },
    [],
  );

  console.log('[VideoCallRoomOrchestrator] Rendering:', {
    isBreakoutRoomActive,
    phrase,
    mainChannel: mainRoomState,
    breakoutChannel: breakoutRoomState,
  });

  return (
    <RTMCoreProvider userInfo={userInfo}>
      {isBreakoutRoomActive && breakoutRoomState?.channel ? (
        <BreakoutRoomVideoCall
          breakoutChannelDetails={breakoutRoomState}
          mainChannelDetails={mainRoomState}
          onLeaveBreakout={handleLeaveBreakout}
        />
      ) : (
        <VideoCall setMainChannelDetails={setMainChannelDetails} />
      )}
    </RTMCoreProvider>
  );
};

export default VideoCallRoomOrchestrator;
