import {UidType, useContent, useRoomInfo} from 'customization-api';
import {createHook} from 'customization-implementation';
import React, {useState, useRef, useEffect} from 'react';
import {createContext} from 'react';
import {isWeb} from '../../utils/common';
import {WhiteWebSdk, RoomPhase, Room, ViewMode} from 'white-web-sdk';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';

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
  const whiteWebSdkClient = useRef({} as WhiteWebSdk);
  const whiteboardRoom = useRef({} as Room);
  const {pinnedUid} = useContent();

  useEffect(() => {
    if (
      whiteboardRoomState === RoomPhase.Connected &&
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

  const {
    data: {isHost, whiteboard: {room_token, room_uuid} = {}},
  } = useRoomInfo();

  const randomString = (
    length = 5,
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ) => {
    var result = '';
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  const fileUploadCallBack = images => {
    console.log('debugging images', images);
    let prevImageWidth = 0;
    for (const key in images) {
      if (Object.prototype.hasOwnProperty.call(images, key)) {
        const element = images[key];
        console.log('debugging element', element, key);
        const uuid = key + ' ' + randomString();
        whiteboardRoom.current?.insertImage({
          centerX: 0 + prevImageWidth + 100,
          centerY: 0,
          height: element.height,
          width: element.width,
          uuid: uuid,
          locked: false,
        });
        setTimeout(() => {
          whiteboardRoom.current?.completeImageUpload(uuid, element.url);
        }, 1000);
        prevImageWidth = prevImageWidth + 100 + element.width;
      }
    }
  };

  useEffect(() => {
    LocalEventEmitter.on(
      LocalEventsEnum.WHITEBAORD_FILE_UPLOAD,
      fileUploadCallBack,
    );
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.WHITEBAORD_FILE_UPLOAD,
        fileUploadCallBack,
      );
    };
  }, []);

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
      if (whiteboardRoom.current && whiteboardActive) {
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
