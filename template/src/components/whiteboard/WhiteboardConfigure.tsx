import {UidType, useRoomInfo} from 'customization-api';
import {createHook} from 'customization-implementation';
import React, {useState, useRef, useEffect} from 'react';
import {createContext} from 'react';
import {isWeb} from '../../utils/common';
import {WhiteWebSdk, RoomPhase, Room, ViewMode} from 'white-web-sdk';

export const whiteboardPaper = isWeb() ? document.createElement('div') : null;
if (whiteboardPaper) {
  whiteboardPaper.className = 'whiteboardPaper';
  whiteboardPaper.setAttribute('style', 'height:100%');
}

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);

export interface whiteboardContextInterface {
  whiteboardUid: UidType;
  whiteboardActive: boolean;
  whiteboardRoomState: RoomPhase;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
  whiteboardRoom: React.Ref<Room>;
}

export interface WhiteboardPropsInterface {
  children: React.ReactNode;
}

const WhiteboardConfigure: React.FC<WhiteboardPropsInterface> = props => {
  // Defines intent, whether whiteboard should be active or not
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.
  const [whiteboardRoomState, setWhiteboardRoomState] = useState(
    RoomPhase.Disconnected,
  );
  const whiteboardUidRef = useRef(Date.now());
  console.log('debugging whiteboardUid', whiteboardUidRef.current);
  const whiteWebSdkClient = useRef({} as WhiteWebSdk);
  const whiteboardRoom = useRef({} as Room);

  const {
    data: {isHost, whiteboard: {room_token, room_uuid} = {}},
  } = useRoomInfo();

  const join = () => {
    console.log(
      '[Whiteboard] join called UID:' + room_uuid + ' Token:',
      room_token,
    );

    const InitState = whiteboardRoomState;
    try {
      setWhiteboardRoomState(RoomPhase.Connecting);
      whiteWebSdkClient.current
        .joinRoom({
          uid: `${whiteboardUidRef.current}`,
          uuid: room_uuid,
          roomToken: room_token,
          floatBar: true,
          isWritable: isHost,
        })
        .then(room => {
          whiteboardRoom.current = room;
          whiteboardRoom.current?.setViewMode(ViewMode.Freedom);
          whiteboardRoom.current?.bindHtmlElement(whiteboardPaper);
          setWhiteboardRoomState(RoomPhase.Connected);
        })
        .catch(err => {
          setWhiteboardRoomState(InitState);
          console.log(err);
        });
    } catch (err) {
      setWhiteboardRoomState(InitState);
      console.log(err);
    }
  };

  const leave = () => {
    const InitState = whiteboardRoomState;
    try {
      setWhiteboardRoomState(RoomPhase.Disconnecting);
      whiteboardRoom.current
        ?.disconnect()
        .then(() => {
          whiteboardRoom.current?.bindHtmlElement(null);
          setWhiteboardRoomState(RoomPhase.Disconnected);
        })
        .catch(err => {
          setWhiteboardRoomState(InitState);
          console.log(err);
        });
    } catch (err) {
      setWhiteboardRoomState(InitState);
      console.log(err);
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
    } else if (whiteboardActive) {
      join();
    } else {
      if (whiteboardRoom.current) {
        leave();
      }
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
      }}>
      {props.children}
    </whiteboardContext.Provider>
  );
};

export const useWhiteboard = createHook(whiteboardContext);

export default WhiteboardConfigure;
