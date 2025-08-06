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

import React, {useState, useEffect} from 'react';
import {useParams, useLocation, useHistory} from '../../components/Router';
import events from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {BreakoutChannelJoinEventPayload} from '../../components/breakout-room/state/types';
import {CallbacksInterface, RtcPropsInterface} from 'agora-rn-uikit';
import VideoCall from '../VideoCall';
import BreakoutVideoCallContent from './BreakoutVideoCallContent';

export interface BreakoutChannelDetails {
  channel: string;
  uid: number | string;
  token: string;
  screenShareUid: number | string;
  screenShareToken: string;
  rtmToken: string;
}

export interface VideoCallContentProps {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  rtcProps: RtcPropsInterface;
  setRtcProps: React.Dispatch<React.SetStateAction<Partial<RtcPropsInterface>>>;
  callbacks: CallbacksInterface;
  styleProps: any;
}

const VideoCallContent: React.FC<VideoCallContentProps> = props => {
  const {phrase} = useParams<{phrase: string}>();
  const location = useLocation();
  const history = useHistory();

  // Parse URL to determine current mode
  const searchParams = new URLSearchParams(location.search);
  const isBreakoutMode = searchParams.get('breakout') === 'true';

  // Breakout channel details (populated by RTM events)
  const [breakoutChannelDetails, setBreakoutChannelDetails] =
    useState<BreakoutChannelDetails | null>(null);

  // Listen for breakout room join events
  useEffect(() => {
    const handleBreakoutJoin = (evtData: any) => {
      try {
        const {payload} = evtData;
        const data: BreakoutChannelJoinEventPayload = JSON.parse(payload);
        console.log('supriya Breakout room join event received', data);
        const {channel_name, mainUser, screenShare, chat} = data.data.data;
        // Extract breakout channel details
        const breakoutDetails: BreakoutChannelDetails = {
          channel: channel_name,
          token: mainUser.rtc,
          uid: mainUser?.uid || 0,
          screenShareToken: screenShare.rtc,
          screenShareUid: screenShare.uid,
          rtmToken: mainUser.rtm,
        };

        setBreakoutChannelDetails(prev => ({
          ...prev,
          ...breakoutDetails,
        }));

        // Navigate to breakout room
        console.log(`supriya Navigating to breakout room: ${channel_name}`);

        history.push(`/${phrase}?breakout=true`);
      } catch (error) {
        console.error(' supriya Failed to process breakout join event');
      }
    };

    // Register breakout join event listener
    events.on(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);

    return () => {
      // Cleanup event listener
      events.off(EventNames.BREAKOUT_ROOM_JOIN_DETAILS, handleBreakoutJoin);
    };
  }, [history, phrase]);

  // Handle leaving breakout room
  const handleLeaveBreakout = () => {
    console.log('supriya Leaving breakout room, returning to main room');
    // Clear breakout channel details
    // setBreakoutChannelDetails(null);
    // // Navigate back to main room
    // history.push(`/${phrase}`);
  };

  // Debug logging
  useEffect(() => {
    console.log('supriya Component mode changed breakout', {
      isBreakoutMode,
      hasBreakoutDetails: !!breakoutChannelDetails,
      breakoutChannelDetails: breakoutChannelDetails,
    });
  }, [isBreakoutMode, phrase, breakoutChannelDetails]);

  // Conditional rendering based on URL params
  return (
    <>
      {isBreakoutMode && breakoutChannelDetails?.channel ? (
        // Breakout Room Mode - Fresh component instance
        <BreakoutVideoCallContent
          key={`breakout-${breakoutChannelDetails.channel}`}
          breakoutChannelDetails={breakoutChannelDetails}
          {...props}
        />
      ) : (
        // Main Room Mode - Fresh component instance
        <VideoCall key={`main-${phrase}`} {...props} />
      )}
    </>
  );
};

export default VideoCallContent;
