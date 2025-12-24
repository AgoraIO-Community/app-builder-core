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
// import {WhiteWebSdk, RoomPhase, Room, ViewMode} from 'white-web-sdk';
// Commented out for fastboard migration - types defined locally
type Room = any;
type ViewMode = any;
type WhiteWebSdk = any;
enum RoomPhase {
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Disconnecting = 'disconnecting',
  Disconnected = 'disconnected',
}
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';
// import {CursorTool} from './WhiteboardCursor'; // Disabled for fastboard migration
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
  // const cursorAdapter = new CursorTool(); // Disabled for fastboard migration
  const uploadPendingRef = useRef(false);

  // Disabled for fastboard migration - FastBoardView handles camera
  // useEffect(() => {
  //   if (
  //     whiteboardRoomState === RoomPhase.Connected &&
  //     pinnedUid &&
  //     pinnedUid == whiteboardUidRef.current
  //   ) {
  //     whiteboardRoom?.current?.moveCamera &&
  //       whiteboardRoom?.current?.moveCamera({
  //         centerX: 0,
  //         centerY: 0,
  //         scale: 1,
  //       });
  //   }
  // }, [pinnedUid, whiteboardRoomState]);

  const [name] = useUserName();
  const {
    data: {isHost, whiteboard: {room_token, room_uuid} = {}},
    boardColor: boardColorRemote,
    whiteboardLastImageUploadPosition: whiteboardLastImageUploadPositionRemote,
  } = useRoomInfo();
  const {currentLayout} = useLayout();

  // Disabled for fastboard migration - FastBoardView handles writable state
  // useEffect(() => {
  //   try {
  //     if (
  //       whiteboardRoomState === RoomPhase.Connected &&
  //       isHost &&
  //       !isMobileUA()
  //     ) {
  //       if (
  //         currentLayout === DefaultLayouts[1].name &&
  //         activeUids &&
  //         activeUids?.length &&
  //         (activeUids[0] === getWhiteboardUid() ||
  //           pinnedUid === getWhiteboardUid())
  //       ) {
  //         whiteboardRoom?.current?.setWritable(true);
  //       } else {
  //         whiteboardRoom?.current?.setWritable(false);
  //       }
  //     }
  //   } catch (error) {
  //     logger.error(
  //       LogSource.Internals,
  //       'WHITEBOARD',
  //       'error on whiteboard setWritable',
  //       error,
  //     );
  //   }
  // }, [currentLayout, isHost, whiteboardRoomState, activeUids, pinnedUid]);

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

  // Disabled for fastboard migration - file upload not supported yet
  const fileUploadCallBack = (images: any) => {
    // TODO: Implement file upload for fastboard if needed
    console.log('File upload not yet implemented for fastboard');
  };

  const setUploadRef = () => {
    uploadPendingRef.current = true;
  };

  // Disabled for fastboard migration - image insert not supported yet
  const insertImageIntoWhiteboard = (url: string) => {
    // TODO: Implement image insert for fastboard if needed
    console.log('Image insert not yet implemented for fastboard');
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

  // Disabled for fastboard migration - FastBoardView handles join/leave
  // const join = () => { ... };
  // const leave = () => { ... };

  const joinWhiteboardRoom = () => {
    setWhiteboardActive(true);
  };

  const leaveWhiteboardRoom = () => {
    setWhiteboardActive(false);
  };

  // Disabled for fastboard migration - FastBoardView handles its own connection
  // useEffect(() => {
  //   if (!whiteWebSdkClient.current.joinRoom && whiteboardActive) {
  //     const appIdentifier = $config.WHITEBOARD_APPIDENTIFIER;
  //     whiteWebSdkClient.current = new WhiteWebSdk({
  //       appIdentifier: appIdentifier,
  //       region: $config.WHITEBOARD_REGION,
  //     });
  //     join();
  //     setWhiteboardStartedFirst(true);
  //   } else if (whiteboardActive) {
  //     join();
  //   } else {
  //     if (
  //       whiteboardRoom.current &&
  //       Object.keys(whiteboardRoom.current)?.length
  //     ) {
  //       leave();
  //     }
  //   }
  // }, [whiteboardActive]);

  // For fastboard: just set whiteboardStartedFirst when active
  useEffect(() => {
    if (whiteboardActive) {
      setWhiteboardStartedFirst(true);
      setWhiteboardRoomState(RoomPhase.Connected);
    } else {
      setWhiteboardRoomState(RoomPhase.Disconnected);
    }
  }, [whiteboardActive]);

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
