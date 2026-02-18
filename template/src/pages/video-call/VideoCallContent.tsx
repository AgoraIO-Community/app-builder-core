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

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useParams} from '../../components/Router';
import events from '../../rtm-events-api';
import {BreakoutChannelJoinEventPayload} from '../../components/breakout-room/state/types';
import VideoCall from '../VideoCall';
import BreakoutVideoCall from './BreakoutVideoCall';
import {useRtcProps} from '../../components/rtc/RtcPropsComposer';
import {BreakoutRoomEventNames} from '../../components/breakout-room/events/constants';
import BreakoutRoomTransition from '../../components/breakout-room/ui/BreakoutRoomTransition';
import Toast from '../../../react-native-toast-message';
import {useMainRoomUserDisplayName} from '../../rtm/hooks/useMainRoomUserDisplayName';
import {useRoomLifecycle} from '../../components/room-info/RoomLifecycleContext';
import {
  RoomInfoContextInterface,
  useRoomInfo,
  WaitingRoomStatus,
} from '../../components/room-info/useRoomInfo';

export interface VideoCallContentProps {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoCallContent: React.FC<VideoCallContentProps> = props => {
  const {phrase} = useParams<{phrase: string}>();
  // RTC props from composer (rtcProps auto-updates when active room switches)
  const {rtcProps} = useRtcProps();
  const {enterBreakoutRoom, exitBreakoutRoom, isInBreakoutRoom} =
    useRoomLifecycle();
  // Snapshot of main room info — used as base when constructing breakout RoomInfo.
  // Ref keeps it fresh inside the CHAN_JOIN event closure without re-subscribing.
  const mainRoomInfo = useRoomInfo();
  const mainRoomInfoRef = useRef(mainRoomInfo);
  useEffect(() => {
    mainRoomInfoRef.current = mainRoomInfo;
  }, [mainRoomInfo]);

  const breakoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mainRoomLocalUid = rtcProps.uid;
  const getDisplayName = useMainRoomUserDisplayName();

  // Breakout channel details (populated by RTM events)
  const [breakoutJoinChannelDetails, setBreakoutJoinChannelDetails] = useState<
    BreakoutChannelJoinEventPayload['data']['data'] | null
  >(null);

  // Track transition direction for better UX
  const [transitionDirection, setTransitionDirection] = useState<
    'enter' | 'exit'
  >('exit');

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
        console.log('Breakout room join event received', data);
        if (data?.data?.act === 'CHAN_JOIN') {
          const {room_name} = data.data.data;
          // Set transition flag - component will unmount/remount when entering breakout
          sessionStorage.setItem('breakout_room_transition', 'true');
          console.log('Set breakout transition flag for channel join');

          // Show transition screen immediately
          setBreakoutJoinChannelDetails(null);
          setTransitionDirection('enter');
          // After delay, populate channel details and switch room
          breakoutTimeoutRef.current = setTimeout(() => {
            const breakoutChannelData = data.data.data;
            // Switch RoomInfoManager to breakout — start from mainRoomInfo
            // snapshot and override only what the breakout join event provides
            const mainSnapshot = mainRoomInfoRef.current;
            const isHost = mainSnapshot.data?.isHost ?? false;
            const breakoutRoomInfo: RoomInfoContextInterface = {
              ...mainSnapshot,
              // Reset transient state for the new room
              isInWaitingRoom: false,
              waitingRoomStatus: WaitingRoomStatus.NOT_REQUESTED,
              isWhiteBoardOn: false,
              sttLanguage: null,
              isSTTActive: false,
              isJoinDataFetched: true,
              data: {
                ...mainSnapshot.data,
                // Override with breakout-specific data from the event
                meetingTitle: breakoutChannelData.room_name,
                channel: breakoutChannelData.channel_name,
                uid: breakoutChannelData.mainUser.uid,
                token: breakoutChannelData.mainUser.rtc,
                rtmToken: breakoutChannelData.mainUser.rtm,
                screenShareUid: breakoutChannelData.screenShare?.uid
                  ? String(breakoutChannelData.screenShare.uid)
                  : undefined,
                screenShareToken: breakoutChannelData.screenShare?.rtc,
                roomId: isHost
                  ? {
                      host: breakoutChannelData.passphrase,
                      attendee: '',
                    }
                  : {
                      host: '',
                      attendee: breakoutChannelData.passphrase,
                    },
                isSeparateHostLink: false,
                ...(breakoutChannelData.whiteboard && {
                  whiteboard: {
                    room_uuid: breakoutChannelData.whiteboard.room_uuid,
                    room_token: breakoutChannelData.whiteboard.room_token,
                  },
                }),
                ...(breakoutChannelData.chat && {
                  chat: {
                    user_token: breakoutChannelData.chat.userToken,
                    group_id: breakoutChannelData.chat.groupId,
                    is_group_owner: breakoutChannelData.chat.isGroupOwner,
                  },
                }),
              },
            };
            enterBreakoutRoom(breakoutRoomInfo);
            setBreakoutJoinChannelDetails(prev => ({
              ...prev,
              ...breakoutChannelData,
            }));
            breakoutTimeoutRef.current = null;
          }, 800);
          let joinMessage = '';
          const sourceUid = data?.data?.srcuid;
          const senderName = getDisplayName(sourceUid);
          if (sourceUid === mainRoomLocalUid) {
            joinMessage = `You have joined room "${room_name}".`;
          } else {
            joinMessage = `Host: ${senderName} has moved you to room "${room_name}".`;
          }
          toastTimeoutRef.current = setTimeout(() => {
            Toast.show({
              leadingIconName: 'open-room',
              type: 'success',
              text1: joinMessage,
              visibilityTime: 3000,
            });
            toastTimeoutRef.current = null;
          }, 500);
        }
      } catch (error) {
        console.error('Failed to process breakout join event');
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
  }, [phrase, getDisplayName, mainRoomLocalUid, enterBreakoutRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (breakoutTimeoutRef.current) {
        clearTimeout(breakoutTimeoutRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle leaving breakout room
  const handleLeaveBreakout = useCallback(() => {
    console.log('Leaving breakout room, returning to main room');

    // Set direction for exiting
    setTransitionDirection('exit');
    // Clear breakout channel details to show transition
    setBreakoutJoinChannelDetails(null);
    // Switch RoomInfoManager back to main room after transition
    setTimeout(() => {
      exitBreakoutRoom();
    }, 800);
  }, [exitBreakoutRoom]);

  // Conditional rendering based on room state
  return (
    <>
      {isInBreakoutRoom ? (
        breakoutJoinChannelDetails?.channel_name ? (
          // Breakout Room Mode - Fresh component instance
          <BreakoutVideoCall
            key={`breakout-${breakoutJoinChannelDetails.channel_name}`}
            onLeave={handleLeaveBreakout}
            callActive={props.callActive}
          />
        ) : (
          <BreakoutRoomTransition
            direction={transitionDirection}
            onTimeout={() => {
              setBreakoutJoinChannelDetails(null);
            }}
          />
        )
      ) : (
        // Main Room Mode - Fresh component instance
        <VideoCall
          key={`main-${phrase}`}
          callActive={props.callActive}
          setCallActive={props.setCallActive}
        />
      )}
    </>
  );
};

export default VideoCallContent;
