import {UidType, useRoomInfo} from 'customization-api';
import {createHook} from 'customization-implementation';
import React, {useState, useRef, useEffect} from 'react';
import {createContext} from 'react';

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);

export interface whiteboardContextInterface {
  whiteboardUid: UidType;
  whiteboardActive: boolean;
  whiteboardRoomState: any;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
  whiteboardRoom: React.Ref<any>;
}

export interface WhiteboardPropsInterface {
  children: React.ReactNode;
}

const WhiteboardConfigure: React.FC<WhiteboardPropsInterface> = props => {
  // Defines intent, whether whiteboard should be active or not
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.
  const [whiteboardRoomState, setWhiteboardRoomState] = useState();
  const whiteboardUidRef = useRef(Date.now());

  const whiteboardRoom = useRef({});

  const {
    data: {isHost, whiteboard: {room_token, room_uuid} = {}},
  } = useRoomInfo();

  const joinWhiteboardRoom = () => {};

  const leaveWhiteboardRoom = () => {};

  useEffect(() => {}, []);

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
