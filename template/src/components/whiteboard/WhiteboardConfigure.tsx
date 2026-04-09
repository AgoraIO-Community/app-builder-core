import {UidType, useContent, useLayout, useRoomInfo} from 'customization-api';
import {createHook} from 'customization-implementation';
import React, {useState, useRef, useEffect} from 'react';
import {createContext} from 'react';
import {
  isMobileUA,
  isWebInternal,
  randomIntFromInterval,
  randomString,
} from '../../utils/common';
import {WhiteWebSdk, RoomPhase, Room, ViewMode} from 'white-web-sdk';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';
import {CursorTool} from './WhiteboardCursor';
import useUserName from '../../utils/useUserName';
import {DefaultLayouts} from '../../pages/video-call/DefaultLayouts';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

export const whiteboardPaper = isWebInternal()
  ? document.createElement('div')
  : null;
if (whiteboardPaper) {
  whiteboardPaper.className = 'whiteboardPaper';
  whiteboardPaper.setAttribute('style', 'height:100%');
}

const dummyHeight = 409;
const dummyWidth = 317;

export const CursorColor = [
  {
    cursorColor: '#EAC443',
    textColor: '#000000',
  },
  {
    cursorColor: '#EB42B9',
    textColor: '#000000',
  },
  {
    cursorColor: '#FF5733',
    textColor: '#000000',
  },
  {
    cursorColor: '#C70039',
    textColor: '#FFFFFF',
  },
  {
    cursorColor: '#196F3D',
    textColor: '#FFFFFF',
  },
  {
    cursorColor: '#2E86C1',
    textColor: '#000000',
  },
  {
    cursorColor: '#A569BD',
    textColor: '#000000',
  },
  {
    cursorColor: '#AED6F1',
    textColor: '#000000',
  },
  {
    cursorColor: '#581845',
    textColor: '#FFFFFF',
  },
  {
    cursorColor: '#1B4F72',
    textColor: '#FFFFFF',
  },
];

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);
export enum BoardColor {
  Black = 1,
  White = 2,
}
export interface whiteboardContextInterface {
  whiteboardUid: UidType;
  whiteboardActive: boolean;
  whiteboardRoomState: RoomPhase;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
  whiteboardRoom: React.Ref<Room>;
  boardColor: BoardColor;
  setBoardColor: React.Dispatch<React.SetStateAction<BoardColor>>;
  setUploadRef: () => void;
  insertImageIntoWhiteboard: (url: string) => void;
  getWhiteboardUid: () => number;
  whiteboardStartedFirst?: boolean;
  clearAllCallback?: () => void;
  isWhiteboardOnFullScreen?: boolean;
  setWhiteboardOnFullScreen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface WhiteboardPropsInterface {
  children: React.ReactNode;
}

const WhiteboardConfigure: React.FC<WhiteboardPropsInterface> = props => {
  // Defines intent, whether whiteboard should be active or not
  const [isWhiteboardOnFullScreen, setWhiteboardOnFullScreen] = useState(false);
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  const [whiteboardStartedFirst, setWhiteboardStartedFirst] = useState(false);
  const [boardColor, setBoardColor] = useState<BoardColor>(BoardColor.White);
  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.
  const [whiteboardRoomState, setWhiteboardRoomState] = useState(
    RoomPhase.Disconnected,
  );
  const whiteboardUidRef = useRef(Date.now());
  const whiteWebSdkClient = useRef({} as WhiteWebSdk);
  const whiteboardRoom = useRef({} as Room);
  const {pinnedUid, activeUids} = useContent();
  const prevImageUploadHeightRef = useRef(0);
  const cursorAdapter = new CursorTool();
  const uploadPendingRef = useRef(false);

  useEffect(() => {
    if (
      whiteboardRoomState === RoomPhase.Connected &&
      // In livestream, don't recenter the camera locally when whiteboard gets pinned.
      // Followers must inherit the broadcaster's current viewport instead.
      !$config.EVENT_MODE &&
      pinnedUid &&
      pinnedUid == whiteboardUidRef.current
    ) {
      whiteboardRoom?.current?.moveCamera &&
        whiteboardRoom?.current?.moveCamera({
          centerX: 0,
          centerY: 0,
          scale: 1,
        });
    }
  }, [pinnedUid, whiteboardRoomState]);

  const [name] = useUserName();
  const {
    data: {isHost, whiteboard: {room_token, room_uuid} = {}},
    boardColor: boardColorRemote,
    whiteboardLastImageUploadPosition: whiteboardLastImageUploadPositionRemote,
  } = useRoomInfo();
  const shouldUseCursorAdapter = !($config.EVENT_MODE && !isHost);
  const {currentLayout} = useLayout();

  useEffect(() => {
    try {
      const setWritable =
        typeof whiteboardRoom?.current?.setWritable === 'function'
          ? whiteboardRoom.current.setWritable.bind(whiteboardRoom.current)
          : undefined;

      if (!setWritable) {
        return;
      }

      if (
        whiteboardRoomState === RoomPhase.Connected &&
        isHost &&
        !isMobileUA()
      ) {
        if (
          currentLayout === DefaultLayouts[1].name &&
          activeUids &&
          activeUids?.length &&
          (activeUids[0] === getWhiteboardUid() ||
            pinnedUid === getWhiteboardUid())
        ) {
          setWritable(true);
        } else {
          setWritable(false);
        }
      }
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'WHITEBOARD',
        'error on whiteboard setWritable',
        error,
      );
    }
    // activeUids[0] (the max-slot uid) is the only element checked in the condition above —
    // using the full activeUids array would re-run setWritable on every participant join/leave,
    // briefly stalling the SDK draw queue and causing cumulative lag for attendees.
  }, [currentLayout, isHost, whiteboardRoomState, activeUids?.[0], pinnedUid]);

  useEffect(() => {
    if (whiteboardRoomState === RoomPhase.Connected) {
      // Netless reads the bound element size for viewport math. Refresh when layout or
      // pin state changes (those affect the whiteboard container size). Participant
      // count changes do not affect container size in pinned layout, so activeUids.length
      // is intentionally excluded to avoid redundant refreshes on every join.
      whiteboardRoom.current?.refreshViewSize?.();
    }
  }, [whiteboardRoomState, currentLayout, pinnedUid]);

  const BoardColorChangedCallBack = ({boardColor}) => {
    setBoardColor(boardColor);
  };
  const SetLastImageUploadHeightCallBack = ({height}) => {
    prevImageUploadHeightRef.current = height;
  };
  React.useEffect(() => {
    if (($config.ENABLE_WAITING_ROOM && !isHost) || $config.AUTO_CONNECT_RTM) {
      BoardColorChangedCallBack({boardColor: boardColorRemote});
    }
  }, [boardColorRemote, isHost]);

  React.useEffect(() => {
    if (($config.ENABLE_WAITING_ROOM && !isHost) || $config.AUTO_CONNECT_RTM) {
      SetLastImageUploadHeightCallBack({
        height: whiteboardLastImageUploadPositionRemote?.height || 0,
      });
    }
  }, [whiteboardLastImageUploadPositionRemote, isHost]);

  React.useEffect(() => {
    LocalEventEmitter.on(
      LocalEventsEnum.BOARD_COLOR_CHANGED_LOCAL,
      BoardColorChangedCallBack,
    );
    LocalEventEmitter.on(
      LocalEventsEnum.WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION_LOCAL,
      SetLastImageUploadHeightCallBack,
    );
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.BOARD_COLOR_CHANGED_LOCAL,
        BoardColorChangedCallBack,
      );
      LocalEventEmitter.off(
        LocalEventsEnum.WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION_LOCAL,
        SetLastImageUploadHeightCallBack,
      );
    };
  }, []);

  const fileUploadCallBack = images => {
    if (uploadPendingRef.current) {
      let prevImageWidth = 0;
      let prevImageHeight = prevImageUploadHeightRef.current;
      let count = 0;
      let focus = {
        x: 0,
        y: 0,
      };
      for (const key in images) {
        if (Object.prototype.hasOwnProperty.call(images, key)) {
          const element = images[key];
          const uuid = key + ' ' + randomString();
          const x = 0 + prevImageWidth + 50;
          const y = 0 + prevImageUploadHeightRef?.current + 50;
          whiteboardRoom.current?.insertImage({
            centerX: x,
            centerY: y,
            height: dummyHeight,
            width: dummyWidth,
            uuid: uuid,
            locked: false,
          });
          if (count === 0) {
            focus.x = x;
            focus.y = y;
          }
          setTimeout(() => {
            whiteboardRoom.current?.completeImageUpload(uuid, element.url);
          }, 1000);
          prevImageWidth = prevImageWidth + 50 + dummyWidth;
          if ((count + 1) % 4 === 0) {
            prevImageUploadHeightRef.current =
              prevImageUploadHeightRef.current + 50 + dummyHeight;
            prevImageWidth = 0;
          } else {
            prevImageHeight = dummyHeight;
          }
          count = count + 1;
        }
      }

      //for next image upload
      if ((count + 1) % 4 !== 0) {
        prevImageUploadHeightRef.current =
          prevImageUploadHeightRef.current + 50 + prevImageHeight;
      }
      uploadPendingRef.current = false;

      //focus the uploaded doc/image
      whiteboardRoom.current?.moveCamera({
        centerX: focus.x,
        centerY: focus.y,
      });
      sendLastImageUploadPositionToRemoteUsers(
        prevImageUploadHeightRef.current,
      );
    }
  };

  const setUploadRef = () => {
    uploadPendingRef.current = true;
  };

  const insertImageIntoWhiteboard = url => {
    if (!url) {
      return;
    }
    const uuid = randomString();
    const y = 0 + prevImageUploadHeightRef?.current + 50;
    whiteboardRoom.current?.insertImage({
      centerX: 0,
      centerY: y,
      height: 300,
      width: 300,
      uuid: uuid,
      locked: false,
    });
    setTimeout(() => {
      whiteboardRoom.current?.completeImageUpload(uuid, url);
    }, 1000);
    whiteboardRoom.current?.moveCamera({
      centerX: 0,
      centerY: y,
    });
    prevImageUploadHeightRef.current =
      prevImageUploadHeightRef.current + 50 + 300 + 100;
    sendLastImageUploadPositionToRemoteUsers(prevImageUploadHeightRef.current);
  };

  const sendLastImageUploadPositionToRemoteUsers = (height: number) => {
    /**
     * Sending last image upload postion to remote user
     */
    events.send(
      EventNames.WHITEBOARD_LAST_IMAGE_UPLOAD_POSITION,
      JSON.stringify({height: height || 0}),
      PersistanceLevel.Session,
    );
  };
  useEffect(() => {
    LocalEventEmitter.on(
      LocalEventsEnum.WHITEBOARD_FILE_UPLOAD,
      fileUploadCallBack,
    );
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.WHITEBOARD_FILE_UPLOAD,
        fileUploadCallBack,
      );
    };
  }, []);

  const join = () => {
    const InitState = whiteboardRoomState;
    try {
      const index = randomIntFromInterval(0, 9);
      const joinStartTs = Date.now();
      setWhiteboardRoomState(RoomPhase.Connecting);
      console.log('[whiteboard-lag] join:start', {
        ts: joinStartTs,
        isHost,
        eventMode: $config.EVENT_MODE,
        whiteboardUid: `${whiteboardUidRef.current}`,
      });
      logger.log(LogSource.Internals, 'WHITEBOARD', 'Trying to join room');
      whiteWebSdkClient.current
        .joinRoom({
          cursorAdapter: shouldUseCursorAdapter ? cursorAdapter : undefined,
          uid: `${whiteboardUidRef.current}`,
          uuid: room_uuid,
          roomToken: room_token,
          floatBar: true,
          isWritable: isHost && !isMobileUA(),
          userPayload: {
            cursorName: name,
            cursorColor: CursorColor[index].cursorColor,
            textColor: CursorColor[index].textColor,
          },
        })
        .then(room => {
          const joinSuccessTs = Date.now();
          logger.log(
            LogSource.Internals,
            'WHITEBOARD',
            'Join room successful',
            isHost,
            $config.EVENT_MODE,
          );
          console.log('[whiteboard-lag] join:success', {
            ts: joinSuccessTs,
            latencyMs: joinSuccessTs - joinStartTs,
            isHost,
            eventMode: $config.EVENT_MODE,
            whiteboardUid: `${whiteboardUidRef.current}`,
          });
          whiteboardRoom.current = room;
          if (shouldUseCursorAdapter) {
            cursorAdapter.setRoom(room);
          }
          // In livestream: host who starts the whiteboard is Broadcaster (attendees follow their viewport),
          // co-hosts are Followers (follow Broadcaster, auto-switch to Freedom when they interact with the board),
          // If no Broadcaster exists in the room (e.g. all hosts dropped and rejoined), first host to join claims it.
          // In meeting: everyone gets Freedom (independent viewport).
          const noBroadcasterInRoom =
            room.state.broadcastState.broadcasterId === undefined;
          const viewMode = $config.EVENT_MODE
            ? isHost
              ? noBroadcasterInRoom
                ? ViewMode.Broadcaster
                : ViewMode.Follower
              : ViewMode.Follower
            : ViewMode.Freedom;
          console.log('[whiteboard-view-mode] initial', {
            isHost,
            eventMode: $config.EVENT_MODE,
            whiteboardUid: `${whiteboardUidRef.current}`,
            broadcasterId: room.state.broadcastState.broadcasterId,
            noBroadcasterInRoom,
            viewMode,
          });
          room.setViewMode(viewMode);
          // In livestream, lock camera gestures for followers so touchpad pan/zoom
          // cannot kick them out of follower mode into freedom.
          room.disableCameraTransform =
            $config.EVENT_MODE && viewMode === ViewMode.Follower;
          console.log('[whiteboard-lag] viewmode:applied', {
            ts: Date.now(),
            isHost,
            viewMode,
            disableCameraTransform: room.disableCameraTransform,
            broadcasterId: room.state.broadcastState.broadcasterId,
          });

          // In livestream, if the Broadcaster drops, the next host to detect it claims Broadcaster.
          // hasSeenBroadcaster ensures we only react to an actual drop (not the transient
          // undefined state during initial room sync before the Broadcaster is propagated).
          if ($config.EVENT_MODE && isHost) {
            let hasSeenBroadcaster = false;
            room.callbacks.on('onRoomStateChanged', modifyState => {
              const currentBroadcastState = room.state?.broadcastState;
              if (currentBroadcastState?.broadcasterId !== undefined) {
                hasSeenBroadcaster = true;
              }
              // broadcasterId becomes undefined only after a clean disconnect (unmount cleanup
              // guarantees this), so this is a reliable signal that the Broadcaster dropped.
              if (
                hasSeenBroadcaster &&
                currentBroadcastState?.broadcasterId === undefined
              ) {
                console.log('[whiteboard-view-mode] promote-to-broadcaster', {
                  isHost,
                  whiteboardUid: `${whiteboardUidRef.current}`,
                });
                room.setViewMode(ViewMode.Broadcaster);
                room.disableCameraTransform = false;
              }
            });
          }
          whiteboardRoom.current?.bindHtmlElement(whiteboardPaper);
          console.log('[whiteboard-lag] bindHtmlElement', {
            ts: Date.now(),
            isHost,
            viewMode,
          });
          whiteboardRoom.current?.refreshViewSize?.();
          console.log('[whiteboard-lag] refreshViewSize:after-bind', {
            ts: Date.now(),
            isHost,
            viewMode,
          });
          if ($config.EVENT_MODE && viewMode === ViewMode.Follower) {
            // Late followers can occasionally mount before the broadcaster viewport
            // is fully applied. Re-applying follower mode after the first bind/size
            // refresh nudges Netless to sync the current broadcaster view immediately.
            requestAnimationFrame(() => {
              console.log('[whiteboard-lag] follower-resync:start', {
                ts: Date.now(),
                isHost,
              });
              room.refreshViewSize?.();
              room.setViewMode(ViewMode.Follower);
              console.log('[whiteboard-lag] follower-resync:done', {
                ts: Date.now(),
                isHost,
              });
            });
          }
          if (isHost && !isMobileUA()) {
            whiteboardRoom.current?.setMemberState({
              strokeColor: [0, 0, 0],
            });
          }
          setWhiteboardRoomState(RoomPhase.Connected);
          console.log('[whiteboard-lag] roomPhase:connected', {
            ts: Date.now(),
            isHost,
            viewMode,
            totalJoinLatencyMs: Date.now() - joinStartTs,
          });
        })
        .catch(err => {
          setWhiteboardRoomState(InitState);
          logger.error(
            LogSource.Internals,
            'WHITEBOARD',
            'Join room error',
            err,
          );
        });
    } catch (err) {
      setWhiteboardRoomState(InitState);
      logger.error(LogSource.Internals, 'WHITEBOARD', 'Join room error', err);
    }
  };

  const leave = () => {
    const InitState = whiteboardRoomState;
    try {
      setWhiteboardRoomState(RoomPhase.Disconnecting);
      const room = whiteboardRoom.current;
      room
        ?.disconnect()
        .then(() => {
          room?.bindHtmlElement(null);
          whiteboardRoom.current = {} as Room;
          whiteboardUidRef.current = Date.now();
          setWhiteboardRoomState(RoomPhase.Disconnected);
        })
        .catch(err => {
          setWhiteboardRoomState(InitState);
          logger.error(
            LogSource.Internals,
            'WHITEBOARD',
            'leave room error',
            err,
          );
        });
    } catch (err) {
      setWhiteboardRoomState(InitState);
      logger.error(LogSource.Internals, 'WHITEBOARD', 'leave room error', err);
    }
  };

  const joinWhiteboardRoom = () => {
    setWhiteboardActive(true);
  };

  const leaveWhiteboardRoom = () => {
    setWhiteboardActive(false);
  };

  useEffect(() => {
    if (!whiteWebSdkClient.current.joinRoom && whiteboardActive) {
      const appIdentifier = $config.WHITEBOARD_APPIDENTIFIER;
      whiteWebSdkClient.current = new WhiteWebSdk({
        appIdentifier: appIdentifier,
        region: $config.WHITEBOARD_REGION,
      });
      join();
      setWhiteboardStartedFirst(true);
    } else if (whiteboardActive) {
      join();
    } else {
      if (
        whiteboardRoom.current &&
        Object.keys(whiteboardRoom.current)?.length
      ) {
        leave();
      }
    }
  }, [whiteboardActive]);

  // Disconnect from whiteboard room when component unmounts (e.g. user leaves the call abruptly)
  useEffect(() => {
    return () => {
      if (
        whiteboardRoom.current &&
        Object.keys(whiteboardRoom.current)?.length
      ) {
        whiteboardRoom.current?.bindHtmlElement(null);
        whiteboardRoom.current?.disconnect();
        whiteboardRoom.current = {} as Room;
      }
    };
  }, []);

  const getWhiteboardUid = () => {
    return whiteboardUidRef?.current;
  };

  const clearAllCallback = () => {
    prevImageUploadHeightRef.current = 0;
    sendLastImageUploadPositionToRemoteUsers(0);
  };

  useEffect(() => {
    if (!whiteboardActive && isWhiteboardOnFullScreen) {
      setWhiteboardOnFullScreen(false);
    }
  }, [whiteboardActive]);

  return (
    <whiteboardContext.Provider
      value={{
        whiteboardActive,
        whiteboardRoomState,
        joinWhiteboardRoom,
        leaveWhiteboardRoom,
        whiteboardRoom,
        whiteboardUid: whiteboardUidRef.current,
        getWhiteboardUid,
        boardColor,
        setBoardColor,
        setUploadRef,
        insertImageIntoWhiteboard,
        whiteboardStartedFirst,
        clearAllCallback,
        isWhiteboardOnFullScreen,
        setWhiteboardOnFullScreen,
      }}>
      {props.children}
    </whiteboardContext.Provider>
  );
};

export const useWhiteboard = createHook(whiteboardContext);

export default WhiteboardConfigure;
