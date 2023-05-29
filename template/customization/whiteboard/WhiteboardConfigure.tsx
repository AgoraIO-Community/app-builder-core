import {useRoomInfo} from 'customization-api';
import React, {useState, useRef, useEffect} from 'react';
import {createContext} from 'react';
import {WhiteWebSdk, RoomPhase, Room} from 'white-web-sdk';

export const whiteboardPaper = document.createElement('div');
whiteboardPaper.className = 'whiteboardPaper';
whiteboardPaper.setAttribute('style', 'height:100%');

export const whiteboardContext = createContext(
  {} as whiteboardContextInterface,
);

export interface whiteboardContextInterface {
  whiteboardActive: boolean;
  whiteboardRoomState: RoomPhase;
  joinWhiteboardRoom: () => void;
  leaveWhiteboardRoom: () => void;
  whiteboardRoom: React.Ref<Room>;
}

export interface WhiteboardPropsInterface {
  children: React.ReactNode;
}

const WhiteboardConfigure: React.FC<WhiteboardPropsInterface> = (props) => {
  // Defines intent, whether whiteboard should be active or not
  const [whiteboardActive, setWhiteboardActive] = useState(false);
  // Defines whiteboard room state, whether disconnected, Connected, Connecting etc.
  const [whiteboardRoomState, setWhiteboardRoomState] = useState(
    RoomPhase.Disconnected,
  );

  const whiteWebSdkClient = useRef({} as WhiteWebSdk);
  const whiteboardRoom = useRef({} as Room);

  const {
    data: {
      isHost,
      whiteboard: {room_token, room_uuid},
    },
  } = useRoomInfo();

  const join = () => {
    const InitState = whiteboardRoomState;
    try {
      setWhiteboardRoomState(RoomPhase.Connecting);
      whiteWebSdkClient.current
        .joinRoom({
          uid: `${Date.now()}`,
          uuid: room_uuid,
          roomToken: room_token,
          floatBar: true,
          isWritable: isHost,
        })
        .then((room) => {
          whiteboardRoom.current = room;
          whiteboardRoom.current.bindHtmlElement(whiteboardPaper);
          setWhiteboardRoomState(RoomPhase.Connected);
        })
        .catch((err) => {
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
        .disconnect()
        .then(() => {
          whiteboardRoom.current.bindHtmlElement(null);
          setWhiteboardRoomState(RoomPhase.Disconnected);
        })
        .catch((err) => {
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
      const appIdentifier = 'EEJBQPVbEe2Bao8ZShuoHQ/hgB5eo0qcDbVig';
      whiteWebSdkClient.current = new WhiteWebSdk({
        appIdentifier: appIdentifier,
        region: 'us-sv',
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
      }}>
      {props.children}
    </whiteboardContext.Provider>
  );
};

export default WhiteboardConfigure;
