import React, {useCallback, useContext, useEffect} from 'react';
import {
  PersistanceLevel,
  ToolbarItem,
  customEvents,
  useContent,
  useLayout,
} from 'customization-api';
import {Text, TouchableOpacity, Image, View} from 'react-native';
import WhiteboardView from './WhiteboardView';
import {whiteboardContext} from './WhiteboardConfigure';
import {RoomPhase} from 'white-web-sdk';
import IconButton from '../../src/atoms/IconButton';

const WhiteboardButton = () => {
  const {
    whiteboardRoomState,
    whiteboardActive,
    joinWhiteboardRoom,
    leaveWhiteboardRoom,
  } = useContext(whiteboardContext);

  const {setLayout, currentLayout} = useLayout();

  const WhiteboardStoppedCallBack = () => {
    toggleWhiteboard(true, false);
  };

  const WhiteboardStartedCallBack = () => {
    toggleWhiteboard(false, false);
  };

  useEffect(() => {
    whiteboardActive &&
      currentLayout !== 'whiteboard' &&
      setLayout('whiteboard');
    customEvents.on('WhiteBoardStopped', WhiteboardStoppedCallBack);
    customEvents.on('WhiteBoardStarted', WhiteboardStartedCallBack);

    return () => {
      customEvents.off('WhiteBoardStopped', WhiteboardStoppedCallBack);
      customEvents.off('WhiteBoardStarted', WhiteboardStartedCallBack);
    };
  }, []);

  const {setCustomContent} = useContent();

  const toggleWhiteboard = (
    whiteboardActive: boolean,
    triggerEvent: boolean,
  ) => {
    if (whiteboardActive) {
      // setCustomContent(1223, false);
      leaveWhiteboardRoom();
      setLayout('grid');
      triggerEvent &&
        customEvents.send(
          'WhiteBoardStopped',
          JSON.stringify({}),
          PersistanceLevel.Session,
        );
    } else {
      joinWhiteboardRoom();
      // setCustomContent(1223, WhiteboardView, {showToolbox: true});
      setLayout('whiteboard');
      triggerEvent &&
        customEvents.send(
          'WhiteBoardStarted',
          JSON.stringify({}),
          PersistanceLevel.Session,
        );
    }
  };
  return (
    <ToolbarItem>
      <IconButton
        iconProps={{
          iconBackgroundColor: whiteboardActive
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : '',
          base64: true,
          base64TintColor: whiteboardActive
            ? $config.SECONDARY_ACTION_COLOR
            : $config.SEMANTIC_ERROR,
          name: 'white-board',
          iconSize: 26,
        }}
        btnTextProps={{
          textColor: $config.FONT_COLOR,
          text: whiteboardActive ? 'Whiteboard On' : 'Whiteboard Off',
        }}
        onPress={() => toggleWhiteboard(whiteboardActive, true)}
        disabled={
          whiteboardRoomState === RoomPhase.Connecting ||
          whiteboardRoomState === RoomPhase.Disconnecting
        }
      />
    </ToolbarItem>
  );
};
export default WhiteboardButton;
