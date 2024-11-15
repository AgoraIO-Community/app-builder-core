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

import React, {useContext, useEffect, useRef, useState} from 'react';
import {whiteboardContext} from './WhiteboardConfigure';
import {StyleSheet, View, Text} from 'react-native';
import {useRoomInfo} from 'customization-api';
import {
  WhiteboardView as NativeWhiteboardView,
  RoomCallbackHandler,
} from '@netless/react-native-whiteboard';
import WhiteboardWidget from './WhiteboardWidget';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import {
  whiteboardInitializingText,
  whiteboardNativeInfoToastHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {useString} from '../../utils/useString';
import ThemeConfig from '../../theme';
import Toast from '../../../react-native-toast-message';
import {useContent} from 'customization-api';
import StorageContext from '../StorageContext';

interface WhiteboardViewInterface {}

const WhiteboardView: React.FC<WhiteboardViewInterface> = () => {
  const {getWhiteboardUid, whiteboardActive, isWhiteboardOnFullScreen} =
    useContext(whiteboardContext);
  const {setStore, store} = useContext(StorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const roomRef = useRef({});
  const sdkRef = useRef({});
  const {
    data: {whiteboard: {room_token, room_uuid} = {}},
  } = useRoomInfo();
  const whiteboardInitializing = useString(whiteboardInitializingText)();
  const whiteboardNativeInfoToastHeadingText = useString(
    whiteboardNativeInfoToastHeading,
  )();

  useEffect(() => {
    if (!store?.whiteboardNativeInfoToast) {
      Toast.show({
        leadingIconName: 'info',
        type: 'info',
        text1: whiteboardNativeInfoToastHeadingText,
        visibilityTime: 5000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
      setStore(prevState => {
        return {
          ...prevState,
          whiteboardNativeInfoToast: true,
        };
      });
    }
  }, [store]);

  const roomCallbacks: Partial<RoomCallbackHandler> = {
    onPhaseChanged: e => {
      logger.debug(
        LogSource.Internals,
        'WHITEBOARD',
        'onPhaseChanged changed:',
        e,
      ),
        setIsLoading(false);
    },
    // onRoomStateChanged: e =>
    //   console.log('debugging onRoomStateChanged changed: ', e),
    onDisconnectWithError: e => {
      logger.debug(
        LogSource.Internals,
        'WHITEBOARD',
        'onDisconnectWithError:',
        e,
      ),
        setIsLoading(false);
    },
  };

  const sdkCallbacks = {
    onSetupFail: error => {
      console.log('debugging whiteboard sdk setup fail: ', error);
      setIsLoading(false);
    },
  };

  const joinRoomCallback = (aRoom, aSdk, error) => {
    roomRef.current = aRoom;
    sdkRef.current = aSdk;

    logger.debug(LogSource.Internals, 'WHITEBOARD', 'debugging aRoom:', {
      data: aRoom,
    });

    setIsLoading(false);
    if (error) {
      logger.error(
        LogSource.Internals,
        'WHITEBOARD',
        'joinRoomCallback error:',
        error,
      );
    } else {
      try {
        //aRoom.setMemberState({currentApplianceName: 'hand'});
      } catch (error2) {
        logger.error(
          LogSource.Internals,
          'WHITEBOARD',
          'error on whiteboard setMemberState',
          error,
        );
      }
    }
  };

  return (
    <View
      style={
        isWhiteboardOnFullScreen
          ? style.whiteboardContainerLandscape
          : style.whiteboardContainer
      }>
      {whiteboardActive ? (
        <>
          {isLoading ? (
            <View style={style.placeholder}>
              <Text style={style.loadingTextStyle}>
                {whiteboardInitializing}
              </Text>
            </View>
          ) : (
            <></>
          )}
          <WhiteboardWidget whiteboardRoom={roomRef} />
          <NativeWhiteboardView
            style={style.whiteboard}
            sdkConfig={{
              appIdentifier: $config.WHITEBOARD_APPIDENTIFIER,
              userCursor: true,
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
  placeholder: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center', //Centered horizontally
    flex: 1,
    zIndex: 999,
  },
  whiteboardContainerLandscape: {
    flex: 1,
    position: 'relative',
    alignSelf: 'center',
    alignItems: 'center',
    transform: [{rotate: '90deg'}],
  },
  whiteboardContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'black',
    position: 'relative',
  },
  whiteboard: {
    aspectRatio: 16.0 / 9.0,
    flexGrow: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingTextStyle: {
    color: $config.HARD_CODED_BLACK_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
  },
});

export default WhiteboardView;
