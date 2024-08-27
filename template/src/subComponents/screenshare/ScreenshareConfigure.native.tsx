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
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {
  ClientRoleType,
  DispatchContext,
  PropsContext,
  UidType,
} from '../../../agora-rn-uikit';
import {
  getGridLayoutName,
  getPinnedLayoutName,
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import events from '../../rtm-events-api';
import {EventNames, EventActions} from '../../rtm-events';
import {useLayout, useContent, useRtc, useRoomInfo} from 'customization-api';
import {filterObject} from '../../utils';
import {ScreenshareContext} from './useScreenshare';
import useMuteToggleLocal, {
  MUTE_LOCAL_TYPE,
} from '../../utils/useMuteToggleLocal';
import {useLocalUserInfo} from '../../app-state/useLocalUserInfo';
import {
  LocalVideoStreamState,
  PermissionType,
  showRPSystemBroadcastPickerView,
  VideoSourceType,
} from 'react-native-agora';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import {controlMessageEnum} from '../../components/ChatContext';

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const {
    data: {channel: channelId},
  } = useRoomInfo();
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const {
    rtcProps: {screenShareUid, screenShareToken},
  } = useContext(PropsContext);
  const processRef = useRef(false);
  const {RtcEngineUnsafe} = useRtc();
  const engine = useRef(RtcEngineUnsafe);
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent, activeUids, pinnedUid, secondaryPinnedUid} =
    useContent();
  const isPinned = useRef(0);
  const {setScreenShareData, screenShareData, setScreenShareOnFullView} =
    useScreenContext();
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();
  const {currentLayout} = useLayout();
  const defaultContentRef = useRef({defaultContent: defaultContent});
  const currentLayoutRef = useRef({currentLayout: currentLayout});
  const pinnedUidRef = useRef({pinnedUid: pinnedUid});
  const secondaryPinnedUidRef = useRef({
    secondaryPinnedUid: secondaryPinnedUid,
  });
  const screenShareDataRef = useRef({screenShareData: screenShareData});
  const localMute = useMuteToggleLocal();
  const {video} = useLocalUserInfo();
  useEffect(() => {
    pinnedUidRef.current.pinnedUid = pinnedUid;
  }, [pinnedUid]);

  useEffect(() => {
    secondaryPinnedUidRef.current.secondaryPinnedUid = secondaryPinnedUid;
  }, [secondaryPinnedUid]);

  useEffect(() => {
    screenShareDataRef.current.screenShareData = screenShareData;
  }, [screenShareData]);

  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    currentLayoutRef.current.currentLayout = currentLayout;
  }, [currentLayout]);

  useEffect(() => {
    const data = filterObject(screenShareData, ([k, v]) => v?.isActive);
    if (data) {
      const recentScreenshare = Object.keys(data)
        .map(i => parseInt(i))
        .sort((a, b) => {
          return data[a].ts - data[b].ts;
        });
      if (recentScreenshare?.length) {
        recentScreenshare.reverse();
        if (
          isPinned.current !== recentScreenshare[0] &&
          activeUids.indexOf(recentScreenshare[0]) !== -1
        ) {
          triggerChangeLayout(
            true,
            recentScreenshare[0],
            defaultContentRef.current.defaultContent[recentScreenshare[0]]
              ?.parentUid,
          );
        }
      }
    }
  }, [activeUids, screenShareData]);

  const triggerChangeLayout = (
    pinned: boolean,
    screenShareUid?: UidType,
    parentUid?: UidType,
  ) => {
    let layout = currentLayoutRef.current.currentLayout;
    //screenshare is started set the layout to Pinned View
    if (pinned && screenShareUid) {
      isPinned.current = screenShareUid;
      dispatch({
        type: 'UserPin',
        value: [screenShareUid],
      });
      if (parentUid && !secondaryPinnedUidRef.current.secondaryPinnedUid) {
        dispatch({
          type: 'UserSecondaryPin',
          value: [parentUid],
        });
      } else if (
        parentUid &&
        secondaryPinnedUidRef.current.secondaryPinnedUid
      ) {
        dispatch({
          type: 'ActiveSpeaker',
          value: [parentUid],
        });
      }
      layout !== getPinnedLayoutName() && setPinnedLayout();
    } else {
      isPinned.current = 0;
      //screenshare is stopped set the layout Grid View
      layout !== getGridLayoutName() && changeLayout();
    }
  };

  useEffect(() => {
    /**
     * When host removed the screenshare
     */
    const unsubKickScreenshare = events.on(
      controlMessageEnum.kickScreenshare,
      () => {
        stopScreenshare(false, true);
      },
    );
    const unsubScreenShareAttribute = events.on(
      EventNames.SCREENSHARE_ATTRIBUTE,
      data => {
        const payload = JSON.parse(data.payload);
        const action = payload.action;
        const value = payload.value;

        const screenUidOfUser =
          defaultContentRef.current.defaultContent[data.sender].screenUid;
        switch (action) {
          case EventActions.SCREENSHARE_STARTED:
            setScreenShareData(prevState => {
              return {
                ...prevState,
                [screenUidOfUser]: {
                  ...prevState[screenUidOfUser],
                  name: defaultContentRef.current.defaultContent[
                    screenUidOfUser
                  ]?.name,
                  isActive: true,
                  ts: value || 0,
                },
              };
            });
            break;
          case EventActions.SCREENSHARE_STOPPED:
            //if user pinned some remote screenshare view as fullscreen view on native and remote stop the screenshare
            //then we need to exit the fullscreen view
            if (
              screenShareDataRef.current.screenShareData[screenUidOfUser] &&
              screenShareDataRef.current.screenShareData[screenUidOfUser]
                ?.isExpanded
            ) {
              setScreenShareOnFullView(false);
            }
            setScreenShareData(prevState => {
              return {
                ...prevState,
                [screenUidOfUser]: {
                  ...prevState[screenUidOfUser],
                  isExpanded: false,
                  name: defaultContentRef.current.defaultContent[
                    screenUidOfUser
                  ]?.name,
                  isActive: false,
                  ts: value || 0,
                },
              };
            });
            //if remote user started/stopped the screenshare then change the layout to pinned/grid
            //if user pinned somebody then don't triggerlayout change
            if (!pinnedUidRef.current.pinnedUid) {
              triggerChangeLayout(false);
            }
            if (screenUidOfUser === pinnedUidRef.current.pinnedUid) {
              triggerChangeLayout(false);
              dispatch({
                type: 'UserPin',
                value: [0],
              });
            }
            break;
          default:
            break;
        }
      },
    );

    return () => {
      unsubScreenShareAttribute();
      unsubKickScreenshare();
    };
  }, []);

  const log = console;

  const publishScreenshare = useCallback(() => {
    if (!channelId) {
      log.error('channelId is invalid');
      return;
    }
    if (screenShareUid <= 0) {
      log.error('uid2 is invalid');
      return;
    }

    // publish screen share stream
    //@ts-ignore
    engine.current.joinChannelEx(
      screenShareToken,
      {channelId, localUid: screenShareUid},
      {
        autoSubscribeAudio: false,
        autoSubscribeVideo: false,
        publishMicrophoneTrack: false,
        publishCameraTrack: false,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishScreenCaptureAudio: true,
        publishScreenCaptureVideo: true,
      },
    );
  }, [engine, screenShareToken, screenShareUid, channelId, log]);

  const unpublishScreenshare = useCallback(() => {
    //@ts-ignore
    engine.current.leaveChannelEx({channelId, localUid: screenShareUid});
  }, [engine, channelId, screenShareUid]);

  const startScreenshare = useCallback(
    async (captureAudio: boolean = false) => {
      if (!isScreenshareActive) {
        logger.log(LogSource.Internals, 'SCREENSHARE', 'starting screenshare');
        if (video) {
          localMute(MUTE_LOCAL_TYPE.video);
        }
        await engine.current.startScreenCapture({
          captureVideo: true,
          captureAudio,
        });
        if (Platform.OS === 'ios') {
          // Show the picker view for screen share, ⚠️ only support for iOS 12+
          await showRPSystemBroadcastPickerView(true);
        }
      } else {
        logger.debug(
          LogSource.Internals,
          'SCREENSHARE',
          'screenshare is already active',
        );
      }
    },
    [isScreenshareActive, video, localMute],
  );

  const stopScreenshare = useCallback(
    async (enableVideo: boolean = false, forceStop: boolean = false) => {
      if (isScreenshareActive || forceStop) {
        logger.log(LogSource.Internals, 'SCREENSHARE', 'stopping screenshare');
        engine.current.stopScreenCapture();
        processRef.current = true;
        setScreenshareActive(false);
        unpublishScreenshare();
      } else {
        logger.debug(
          LogSource.Internals,
          'SCREENSHARE',
          'no screenshare is active',
        );
      }
    },
    [engine, isScreenshareActive, unpublishScreenshare],
  );

  const onLocalVideoStateChanged = useCallback(
    (source: VideoSourceType, state: LocalVideoStreamState, error) => {
      log.info(
        'onLocalVideoStateChanged',
        'source',
        source,
        'state',
        state,
        'error',
        error,
      );
      if (source === VideoSourceType.VideoSourceScreen) {
        switch (state) {
          case LocalVideoStreamState.LocalVideoStreamStateStopped:
          case LocalVideoStreamState.LocalVideoStreamStateFailed:
            break;
          case LocalVideoStreamState.LocalVideoStreamStateCapturing:
          case LocalVideoStreamState.LocalVideoStreamStateEncoding:
            publishScreenshare();
            processRef.current = true;
            setScreenshareActive(true);
            break;
        }
      }
    },
    [log, publishScreenshare],
  );

  const onPermissionError = useCallback(
    (permissionType: PermissionType) => {
      log.info('onPermissionError', 'permissionType', permissionType);
      // ⚠️ You should call stopScreenCapture if received the event with permissionType ScreenCapture,
      // otherwise you can not startScreenCapture again
      stopScreenshare();
    },
    [stopScreenshare, log],
  );

  useEffect(() => {
    engine.current.addListener(
      'onLocalVideoStateChanged',
      onLocalVideoStateChanged,
    );
    engine.current.addListener('onPermissionError', onPermissionError);

    const engineCopy = engine.current;
    return () => {
      engineCopy.removeListener(
        'onLocalVideoStateChanged',
        onLocalVideoStateChanged,
      );
      engineCopy.removeListener('onPermissionError', onPermissionError);
    };
  }, [engine, onLocalVideoStateChanged, onPermissionError]);

  useEffect(() => {
    if (processRef.current) {
      //native screenshare is started
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        'native screenshare is started',
      );
      if (isScreenshareActive) {
        //to increase the performance - stop incoming video stream
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'muting all remote video streams[muteAllRemoteVideoStreams(true)] to increase the performance',
        );
        RtcEngineUnsafe.muteAllRemoteVideoStreams(true);
      }
      //native screenshare is stopped
      else {
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'native screenshare is stopped',
        );
        //resume the incoming video stream
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'resume all remote video streams[muteAllRemoteVideoStreams(false)]',
        );
        RtcEngineUnsafe.muteAllRemoteVideoStreams(false);
      }
      processRef.current = false;
    }
  }, [isScreenshareActive, RtcEngineUnsafe]);

  const ScreenshareStoppedCallback = () => {};

  return (
    <ScreenshareContext.Provider
      value={{
        isScreenshareActive,
        startScreenshare,
        stopScreenshare,
        //@ts-ignore
        ScreenshareStoppedCallback,
      }}>
      {props.children}
      <KeepAwake />
    </ScreenshareContext.Provider>
  );
};

export default ScreenshareConfigure;
