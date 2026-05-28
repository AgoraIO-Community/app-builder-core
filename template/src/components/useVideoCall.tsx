/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React, {
  SetStateAction,
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {createHook} from 'customization-implementation';
import InvitePopup from './popups/InvitePopup';
import StopRecordingPopup from './popups/StopRecordingPopup';
import StartScreenSharePopup from './popups/StartScreenSharePopup';
import StopScreenSharePopup from './popups/StopScreenSharePopup';
import {SdkApiContext} from './SdkApiContext';
import {
  UidType,
  useContent,
  useLocalUserInfo,
  useRoomInfo,
} from 'customization-api';
import SDKEvents from '../utils/SdkEvents';
import DeviceContext from './DeviceContext';
import useSetName from '../utils/useSetName';
import WhiteboardClearAllPopup from './popups/WhiteboardClearAllPopup';
import events from '../rtm-events-api';
import {PersistanceLevel} from '../rtm-events-api/types';
import {EventNames} from '../rtm-events';
import {nanoid} from 'nanoid/non-secure';
import {useUserPreference} from './useUserPreference';
import {
  LIVE_REACTION_BADGE_DURATION,
  LIVE_REACTION_FLOAT_DURATION,
  LIVE_REACTION_MAX_FLOATING_ITEMS,
  LiveReactionDefinition,
  LiveReactionEvent,
} from './reactions/catalog';
import {useString} from '../utils/useString';
import {videoRoomUserFallbackText} from '../language/default-labels/videoCallScreenLabels';

interface InViewPortState {
  [key: number]: boolean;
}
export interface VideoCallContextInterface {
  showInvitePopup: boolean;
  setShowInvitePopup: React.Dispatch<SetStateAction<boolean>>;
  showStopRecordingPopup: boolean;
  setShowStopRecordingPopup: React.Dispatch<SetStateAction<boolean>>;
  showLayoutOption: boolean;
  setShowLayoutOption: React.Dispatch<SetStateAction<boolean>>;
  showStartScreenSharePopup: boolean;
  setShowStartScreenSharePopup: React.Dispatch<SetStateAction<boolean>>;
  showStopScreenSharePopup: boolean;
  setShowStopScreenSharePopup: React.Dispatch<SetStateAction<boolean>>;
  enablePinForMe: boolean;
  setEnablePinForMe: React.Dispatch<SetStateAction<boolean>>;
  videoTileInViewPortState: InViewPortState;
  setVideoTileInViewPortState: (uid: UidType, visible: boolean) => void;
  showWhiteboardClearAllPopup: boolean;
  setShowWhiteboardClearAllPopup: React.Dispatch<SetStateAction<boolean>>;
  latestReactionByUid: Record<string, LiveReactionEvent>;
  floatingReactions: LiveReactionEvent[];
  emitLiveReaction: (reaction: LiveReactionDefinition) => void;
}

const VideoCallContext = React.createContext<VideoCallContextInterface>({
  showInvitePopup: false,
  setShowInvitePopup: () => {},
  showStopRecordingPopup: false,
  setShowStopRecordingPopup: () => {},
  showLayoutOption: false,
  setShowLayoutOption: () => {},
  showStartScreenSharePopup: false,
  setShowStartScreenSharePopup: () => {},
  showStopScreenSharePopup: false,
  setShowStopScreenSharePopup: () => {},
  enablePinForMe: true,
  setEnablePinForMe: () => {},
  videoTileInViewPortState: {},
  setVideoTileInViewPortState: () => {},
  showWhiteboardClearAllPopup: false,
  setShowWhiteboardClearAllPopup: () => {},
  latestReactionByUid: {},
  floatingReactions: [],
  emitLiveReaction: () => {},
});

interface VideoCallProviderProps {
  children: React.ReactNode;
}
const VideoCallProvider = (props: VideoCallProviderProps) => {
  const [showWhiteboardClearAllPopup, setShowWhiteboardClearAllPopup] =
    useState(false);
  const [enablePinForMe, setEnablePinForMe] = useState(true);
  const [showLayoutOption, setShowLayoutOption] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showStopRecordingPopup, setShowStopRecordingPopup] = useState(false);
  const [showStartScreenSharePopup, setShowStartScreenSharePopup] =
    useState(false);
  const [showStopScreenSharePopup, setShowStopScreenSharePopup] =
    useState(false);
  const {join, enterRoom} = useContext(SdkApiContext);
  const roomInfo = useRoomInfo();
  const localUser = useLocalUserInfo();
  const {defaultContent} = useContent();
  const {uids} = useUserPreference();
  const remoteUserFallbackName = useString(videoRoomUserFallbackText)();
  const {deviceList} = useContext(DeviceContext);
  const setUsername = useSetName();
  //const videoTileInViewPortStateRef = useRef({});
  const [videoTileInViewPortState, setVideoTileInViewPortStateL] = useState({});
  const [latestReactionByUid, setLatestReactionByUid] = useState<
    Record<string, LiveReactionEvent>
  >({});
  const [floatingReactions, setFloatingReactions] = useState<
    LiveReactionEvent[]
  >([]);
  const reactionBadgeTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const floatingReactionTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const processedReactionIdsRef = useRef<Set<string>>(new Set());

  const assignReactionLane = useCallback((reaction: LiveReactionEvent) => {
    if (typeof reaction.lane === 'number') {
      return reaction;
    }
    const lane = Math.floor(Math.random() * 5);
    return {...reaction, lane};
  }, []);

  const getReactionSenderName = useCallback(
    (senderUid: string) => {
      if (String(localUser.uid) === String(senderUid)) {
        return 'You';
      }
      return (
        uids[String(senderUid)]?.name ||
        defaultContent[Number(senderUid)]?.name ||
        defaultContent[String(senderUid)]?.name ||
        remoteUserFallbackName
      );
    },
    [defaultContent, localUser.uid, remoteUserFallbackName, uids],
  );

  const setVideoTileInViewPortState = (uid: UidType, visible: boolean) => {
    //videoTileInViewPortStateRef.current[uid] = visible;
    setVideoTileInViewPortStateL(prevState => {
      return {
        ...prevState,
        [uid]: visible,
      };
    });
  };

  const cleanupReactionBadgeTimeout = useCallback((uid: string) => {
    if (reactionBadgeTimeoutsRef.current[uid]) {
      clearTimeout(reactionBadgeTimeoutsRef.current[uid]);
      delete reactionBadgeTimeoutsRef.current[uid];
    }
  }, []);

  const cleanupFloatingReactionTimeout = useCallback((reactionId: string) => {
    if (floatingReactionTimeoutsRef.current[reactionId]) {
      clearTimeout(floatingReactionTimeoutsRef.current[reactionId]);
      delete floatingReactionTimeoutsRef.current[reactionId];
    }
  }, []);

  const ingestReaction = useCallback(
    (reaction: LiveReactionEvent) => {
      if (!$config.ENABLE_LIVE_REACTIONS) {
        return;
      }
      if (processedReactionIdsRef.current.has(reaction.reactionId)) {
        return;
      }
      const nextReaction = assignReactionLane({
        ...reaction,
        senderDisplayName: getReactionSenderName(reaction.senderUid),
      });
      processedReactionIdsRef.current.add(nextReaction.reactionId);
      if (processedReactionIdsRef.current.size > 200) {
        processedReactionIdsRef.current = new Set(
          Array.from(processedReactionIdsRef.current).slice(-100),
        );
      }

      setLatestReactionByUid(prev => ({
        ...prev,
        [nextReaction.senderUid]: nextReaction,
      }));
      cleanupReactionBadgeTimeout(nextReaction.senderUid);
      reactionBadgeTimeoutsRef.current[nextReaction.senderUid] = setTimeout(
        () => {
          setLatestReactionByUid(prev => {
            if (
              prev[nextReaction.senderUid]?.reactionId !==
              nextReaction.reactionId
            ) {
              return prev;
            }
            const next = {...prev};
            delete next[nextReaction.senderUid];
            return next;
          });
          cleanupReactionBadgeTimeout(nextReaction.senderUid);
        },
        LIVE_REACTION_BADGE_DURATION,
      );

      setFloatingReactions(prev => {
        const next = [...prev, nextReaction];
        return next.length > LIVE_REACTION_MAX_FLOATING_ITEMS
          ? next.slice(next.length - LIVE_REACTION_MAX_FLOATING_ITEMS)
          : next;
      });
      cleanupFloatingReactionTimeout(nextReaction.reactionId);
      floatingReactionTimeoutsRef.current[nextReaction.reactionId] = setTimeout(
        () => {
          setFloatingReactions(prev =>
            prev.filter(item => item.reactionId !== nextReaction.reactionId),
          );
          cleanupFloatingReactionTimeout(nextReaction.reactionId);
        },
        LIVE_REACTION_FLOAT_DURATION,
      );
    },
    [
      assignReactionLane,
      cleanupFloatingReactionTimeout,
      cleanupReactionBadgeTimeout,
      getReactionSenderName,
    ],
  );

  const emitLiveReaction = useCallback(
    (reaction: LiveReactionDefinition) => {
      const reactionId = `${localUser.uid}-${
        reaction.key
      }-${Date.now()}-${nanoid(4)}`;
      const senderDisplayName = getReactionSenderName(String(localUser.uid));
      const nextReaction: LiveReactionEvent = {
        reactionId,
        assetKey: reaction.key,
        emoji: reaction.emoji,
        senderUid: String(localUser.uid),
        senderDisplayName,
        timestamp: Date.now(),
      };

      ingestReaction(nextReaction);
      events.send(
        EventNames.LIVE_REACTION,
        JSON.stringify({
          reactionId: nextReaction.reactionId,
          assetKey: nextReaction.assetKey,
          emoji: nextReaction.emoji,
          timestamp: nextReaction.timestamp,
        }),
        PersistanceLevel.None,
      );
    },
    [getReactionSenderName, ingestReaction, localUser.uid],
  );

  useEffect(() => {
    if (join.initialized && join.phrase) {
      if (join.userName && join.skipPrecall) {
        setUsername(join.userName);
      }
      join.promise.res(roomInfo.data);
    }
    if (enterRoom.promise) {
      enterRoom.promise.res(roomInfo.data);
    }
    SDKEvents.emit(
      'join',
      roomInfo.data.meetingTitle,
      deviceList,
      roomInfo.data.isHost,
    );
  }, []);

  useEffect(() => {
    if (!$config.ENABLE_LIVE_REACTIONS) {
      return;
    }
    const unsubscribe = events.on(EventNames.LIVE_REACTION, data => {
      try {
        const payload =
          typeof data.payload === 'string'
            ? JSON.parse(data.payload)
            : data.payload;
        ingestReaction({
          reactionId: payload.reactionId,
          assetKey: payload.assetKey,
          emoji: payload.emoji,
          senderUid: String(data.sender),
          timestamp: payload.timestamp || data.ts || Date.now(),
        });
      } catch (error) {
        console.warn('Failed to parse live reaction payload', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [ingestReaction]);

  useEffect(() => {
    return () => {
      Object.keys(reactionBadgeTimeoutsRef.current).forEach(uid => {
        cleanupReactionBadgeTimeout(uid);
      });
      Object.keys(floatingReactionTimeoutsRef.current).forEach(reactionId => {
        cleanupFloatingReactionTimeout(reactionId);
      });
    };
  }, [cleanupFloatingReactionTimeout, cleanupReactionBadgeTimeout]);
  return (
    <VideoCallContext.Provider
      value={{
        showInvitePopup,
        setShowInvitePopup,
        showStopRecordingPopup,
        setShowStopRecordingPopup,
        showLayoutOption,
        setShowLayoutOption,
        showStartScreenSharePopup,
        setShowStartScreenSharePopup,
        showStopScreenSharePopup,
        setShowStopScreenSharePopup,
        enablePinForMe,
        setEnablePinForMe,
        setVideoTileInViewPortState,
        //videoTileInViewPortState: videoTileInViewPortStateRef.current,
        videoTileInViewPortState,
        showWhiteboardClearAllPopup,
        setShowWhiteboardClearAllPopup,
        latestReactionByUid,
        floatingReactions,
        emitLiveReaction,
      }}>
      <StartScreenSharePopup />
      <StopScreenSharePopup />
      <StopRecordingPopup />
      <InvitePopup />
      <WhiteboardClearAllPopup />
      {props.children}
    </VideoCallContext.Provider>
  );
};

/**
 *
 */
const useVideoCall = createHook(VideoCallContext);

export {VideoCallProvider, useVideoCall};
