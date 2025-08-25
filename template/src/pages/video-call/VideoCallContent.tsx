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

import React, {useState, useEffect, useRef} from 'react';
import {useParams} from '../../components/Router';
import events from '../../rtm-events-api';
import {BreakoutChannelJoinEventPayload} from '../../components/breakout-room/state/types';
import {CallbacksInterface, RtcPropsInterface} from 'agora-rn-uikit';
import VideoCall from '../VideoCall';
import BreakoutVideoCallContent from './BreakoutVideoCallContent';
import {BreakoutRoomEventNames} from '../../components/breakout-room/events/constants';
import BreakoutRoomTransition from '../../components/breakout-room/ui/BreakoutRoomTransition';

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
  const breakoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isInBreakoutMode, setIsInBreakoutMode] = useState(false);
  // Breakout channel details (populated by RTM events)
  const [breakoutChannelDetails, setBreakoutChannelDetails] =
    useState<BreakoutChannelDetails | null>(null);

  // Listen for breakout room join events
  useEffect(() => {
    const handleBreakoutJoin = (evtData: any) => {
      try {
        // Clear any existing timeout
        if (breakoutTimeoutRef.current) {
          clearTimeout(breakoutTimeoutRef.current);
        }
        // Process the event payload
        const {payload} = evtData;
        const data: BreakoutChannelJoinEventPayload = JSON.parse(payload);
        console.log('supriya Breakout room join event received', data);
        if (data?.data?.act === 'CHAN_JOIN') {
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
          // Set breakout state active
          setIsInBreakoutMode(true);
          setBreakoutChannelDetails(null);
          // Add state after a delay to show transitioning screen
          breakoutTimeoutRef.current = setTimeout(() => {
            setBreakoutChannelDetails(prev => ({
              ...prev,
              ...breakoutDetails,
            }));
            breakoutTimeoutRef.current = null;
          }, 800);
        }
      } catch (error) {
        console.error(' supriya Failed to process breakout join event');
      }
    };

    // Register breakout join event listener
    events.on(
      BreakoutRoomEventNames.BREAKOUT_ROOM_JOIN_DETAILS,
      handleBreakoutJoin,
    );

    return () => {
      // Cleanup event listener
      events.off(
        BreakoutRoomEventNames.BREAKOUT_ROOM_JOIN_DETAILS,
        handleBreakoutJoin,
      );
    };
  }, [phrase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (breakoutTimeoutRef.current) {
        clearTimeout(breakoutTimeoutRef.current);
      }
    };
  }, []);
  // Debug logging
  useEffect(() => {
    console.log('supriya Component mode changed breakout', {
      isBreakoutMode: isInBreakoutMode,
      hasBreakoutDetails: !!breakoutChannelDetails,
      breakoutChannelDetails: breakoutChannelDetails,
    });
  }, [isInBreakoutMode, phrase, breakoutChannelDetails]);

  // Conditional rendering based on URL params
  return (
    <>
      {isInBreakoutMode ? (
        breakoutChannelDetails?.channel ? (
          // Breakout Room Mode - Fresh component instance
          <BreakoutVideoCallContent
            key={`breakout-${breakoutChannelDetails.channel}`}
            breakoutChannelDetails={breakoutChannelDetails}
            setIsInBreakoutMode={setIsInBreakoutMode}
            {...props}
          />
        ) : (
          <BreakoutRoomTransition
            onTimeout={() => {
              setIsInBreakoutMode(false);
              setBreakoutChannelDetails(null);
            }}
          />
        )
      ) : (
        // Main Room Mode - Fresh component instance
        <VideoCall key={`main-${phrase}`} {...props} />
      )}
    </>
  );
};

export default VideoCallContent;
