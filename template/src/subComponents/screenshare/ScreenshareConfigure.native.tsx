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
import events, {PersistanceLevel} from '../../rtm-events-api';
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
import {timeNow} from '../../rtm/utils';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';

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

  const triggerChangeLayout = useCallback(
    (pinned: boolean, screenShareUid?: UidType, parentUid?: UidType) => {
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
    },
    [changeLayout, dispatch, setPinnedLayout],
  );

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
  }, [activeUids, screenShareData, triggerChangeLayout]);

  useEffect(() => {
    /**
     * When user kicked off by remote host then stop the screenshare
     */
    const unsubKickUser = LocalEventEmitter.on(
      LocalEventsEnum.USER_KICKED_OFF_BY_REMOTE_HOST,
      () => {
        stopScreenshare(false, true);
      },
    );
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
      unsubKickUser.removeListener(
        LocalEventsEnum.USER_KICKED_OFF_BY_REMOTE_HOST,
        () => {},
      );
    };
  }, []);

  const publishScreenshare = useCallback(() => {
    if (!channelId) {
      console.error('channelId is invalid');
      return;
    }
    if (screenShareUid <= 0) {
      console.error('uid2 is invalid');
      return;
    }

    try {
      // publish screen share stream
      //@ts-ignore
      engine?.current?.joinChannelEx(
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
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        'native screenshare Error on joinChannelEx',
        error,
      );
    }
  }, [engine, screenShareToken, screenShareUid, channelId]);

  const unpublishScreenshare = useCallback(() => {
    try {
      //@ts-ignore
      engine?.current?.leaveChannelEx({channelId, localUid: screenShareUid});
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        'native screenshare Error on leaveChannelEx',
        error,
      );
    }
  }, [engine, channelId, screenShareUid]);

  const startScreenshare = useCallback(
    async (captureAudio: boolean = false) => {
      if (!isScreenshareActive) {
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'Trying to start native screenshare',
        );
        if (video) {
          localMute(MUTE_LOCAL_TYPE.video);
        }
        try {
          await engine.current.startScreenCapture({
            captureVideo: true,
            captureAudio,
          });
          if (Platform.OS === 'ios') {
            // Show the picker view for screen share, ⚠️ only support for iOS 12+
            await showRPSystemBroadcastPickerView(true);
          }
        } catch (error) {
          logger.error(
            LogSource.Internals,
            'SCREENSHARE',
            'native screenshare error on -> startScreenCapture',
            error,
          );
        }
      } else {
        logger.debug(
          LogSource.Internals,
          'SCREENSHARE',
          'native screenshare is already active',
        );
      }
    },
    [isScreenshareActive, video, localMute],
  );

  const ScreenshareStartedCallback = useCallback(() => {
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      'native screenshare started.',
    );
    publishScreenshare();
    processRef.current = true;
    setScreenshareActive(true);
    // 1. Set local state
    setScreenShareData(prevState => {
      return {
        ...prevState,
        [screenShareUid]: {
          name: defaultContentRef.current.defaultContent[screenShareUid]?.name,
          isActive: true,
          ts: timeNow(),
        },
      };
    });
    // 2. Inform everyone in the channel screenshare is actice
    events.send(
      EventNames.SCREENSHARE_ATTRIBUTE,
      JSON.stringify({
        action: EventActions.SCREENSHARE_STARTED,
        value: timeNow(),
        screenUidOfUser: screenShareUid,
      }),
      PersistanceLevel.Sender,
    );
  }, [publishScreenshare, screenShareUid, setScreenShareData]);

  const ScreenshareStoppedCallback = useCallback(() => {
    logger.log(
      LogSource.Internals,
      'SCREENSHARE',
      'native screenshare stopped.',
    );
    processRef.current = true;
    setScreenshareActive(false);
    unpublishScreenshare();
    events.send(
      EventNames.SCREENSHARE_ATTRIBUTE,
      JSON.stringify({
        action: EventActions.SCREENSHARE_STOPPED,
        value: 0,
      }),
      PersistanceLevel.Sender,
    );
    setScreenShareData(prevState => {
      return {
        ...prevState,
        [screenShareUid]: {
          ...prevState[screenShareUid],
          isActive: false,
          ts: 0,
        },
      };
    });
    //if local user stopped the screenshare then change layout to grid
    //if user pinned somebody then don't triggerlayout change
    if (!pinnedUidRef.current.pinnedUid) {
      triggerChangeLayout(false);
    }
    if (screenShareUid === pinnedUidRef.current.pinnedUid) {
      triggerChangeLayout(false);
      dispatch({
        type: 'UserPin',
        value: [0],
      });
    }
  }, [
    screenShareUid,
    dispatch,
    triggerChangeLayout,
    setScreenShareData,
    unpublishScreenshare,
  ]);

  const stopScreenshare = useCallback(
    async (enableVideo: boolean = false, forceStop: boolean = false) => {
      if (isScreenshareActive || forceStop) {
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'Trying to stop native screenshare',
        );
        try {
          engine?.current?.stopScreenCapture();
        } catch (error) {
          logger.error(
            LogSource.Internals,
            'SCREENSHARE',
            'native screenshare error on -> stopScreenCapture',
            error,
          );
        }
      } else {
        logger.debug(
          LogSource.Internals,
          'SCREENSHARE',
          'native screenshare -> no screenshare is active',
        );
      }
    },
    [engine, isScreenshareActive],
  );

  const onLocalVideoStateChanged = useCallback(
    (source: VideoSourceType, state: LocalVideoStreamState, error) => {
      logger.log(
        LogSource.Internals,
        'SCREENSHARE',
        'native screenshare -> onLocalVideoStateChanged',
        {source, state, error},
      );
      if (source === VideoSourceType.VideoSourceScreen) {
        switch (state) {
          case LocalVideoStreamState.LocalVideoStreamStateStopped:
          case LocalVideoStreamState.LocalVideoStreamStateFailed:
            ScreenshareStoppedCallback();
            break;
          case LocalVideoStreamState.LocalVideoStreamStateCapturing:
          case LocalVideoStreamState.LocalVideoStreamStateEncoding:
            ScreenshareStartedCallback();
            break;
        }
      }
    },
    [ScreenshareStoppedCallback, ScreenshareStartedCallback],
  );

  const onPermissionError = useCallback(
    (permissionType: PermissionType) => {
      logger.error(
        LogSource.Internals,
        'SCREENSHARE',
        'native screenshare -> onPermissionError',
        permissionType,
      );
      // ⚠️ You should call stopScreenCapture if received the event with permissionType ScreenCapture,
      // otherwise you can not startScreenCapture again
      stopScreenshare();
    },
    [stopScreenshare],
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
    if (processRef?.current) {
      if (isScreenshareActive) {
        //to increase the performance - stop incoming video stream
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'muting all remote video streams[muteAllRemoteVideoStreams(true)] to increase the performance',
        );
        RtcEngineUnsafe?.muteAllRemoteVideoStreams(true);
      } else {
        //resume the incoming video stream
        logger.log(
          LogSource.Internals,
          'SCREENSHARE',
          'resume all remote video streams[muteAllRemoteVideoStreams(false)]',
        );
        RtcEngineUnsafe?.muteAllRemoteVideoStreams(false);
      }
      processRef.current = false;
    }
  }, [isScreenshareActive, RtcEngineUnsafe]);

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
