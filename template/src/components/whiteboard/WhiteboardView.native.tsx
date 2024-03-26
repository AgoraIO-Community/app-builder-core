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

import React, {useContext, useRef} from 'react';
import {whiteboardContext} from './WhiteboardConfigure';
import {StyleSheet, View} from 'react-native';
import {useRoomInfo} from 'customization-api';
import {
  WhiteboardView as NativeWhiteboardView,
  RoomCallbackHandler,
} from '@netless/react-native-whiteboard';
import WhiteboardWidget from './WhiteboardWidget';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

interface WhiteboardViewInterface {}

const WhiteboardView: React.FC<WhiteboardViewInterface> = () => {
  const {getWhiteboardUid, whiteboardActive} = useContext(whiteboardContext);
  const roomRef = useRef({});
  const sdkRef = useRef({});
  const {
    data: {whiteboard: {room_token, room_uuid} = {}},
  } = useRoomInfo();

  const roomCallbacks: Partial<RoomCallbackHandler> = {
    onPhaseChanged: e =>
      logger.log(LogSource.Internals, 'WHITEBOARD', 'onPhaseChanged changed:', {
        data: e,
      }),
    onRoomStateChanged: e =>
      logger.log(
        LogSource.Internals,
        'WHITEBOARD',
        'onRoomStateChanged changed:',
        {
          data: e,
        },
      ),
    onDisconnectWithError: e =>
      logger.log(LogSource.Internals, 'WHITEBOARD', 'onDisconnectWithError:', {
        data: e,
      }),
  };

  const sdkCallbacks = {
    onSetupFail: error =>
      logger.error(
        LogSource.Internals,
        'WHITEBOARD',
        'whiteboard sdk setup fail:',
        {
          error,
        },
      ),
  };

  const joinRoomCallback = (aRoom, aSdk, error) => {
    roomRef.current = aRoom;
    sdkRef.current = aSdk;

    logger.log(LogSource.Internals, 'WHITEBOARD', 'aRoom:', {
      data: aRoom,
    });

    if (error) {
      logger.error(
        LogSource.Internals,
        'WHITEBOARD',
        'joinRoomCallback error:',
        {
          error,
        },
      );
    } else {
      try {
        //aRoom.setMemberState({currentApplianceName: 'hand'});
      } catch (error2) {
        logger.error(
          LogSource.Internals,
          'WHITEBOARD',
          'error on whiteboard setMemberState',
          {
            error,
          },
        );
      }
    }
  };

  return (
    <View style={style.whiteboardContainer}>
      {whiteboardActive ? (
        <>
          <WhiteboardWidget whiteboardRoom={roomRef} />
          <NativeWhiteboardView
            style={style.whiteboard}
            sdkConfig={{
              appIdentifier: $config.WHITEBOARD_APPIDENTIFIER,
            }}
            roomConfig={{
              uid: getWhiteboardUid()?.toString(),
              uuid: room_uuid,
              roomToken: room_token,
              region: $config.WHITEBOARD_REGION,
              isWritable: false,
            }}
            joinRoomCallback={joinRoomCallback}
            roomCallbacks={roomCallbacks}
            sdkCallbacks={sdkCallbacks}
          />
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  whiteboardContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  whiteboard: {
    aspectRatio: 16.0 / 9.0,
    flexGrow: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default WhiteboardView;
