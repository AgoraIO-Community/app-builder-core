/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useEffect, useRef, useState} from 'react';
import {PropsContext, UidType} from '../../../agora-rn-uikit';
import {ScreenshareContext} from './useScreenshare';
import {
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useRecording} from '../recording/useRecording';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventActions, EventNames} from '../../rtm-events';
import {IAgoraRTC} from 'agora-rtc-sdk-ng';
import useRecordingLayoutQuery from '../recording/useRecordingLayoutQuery';
import {useString} from '../../utils/useString';
import {timeNow} from '../../rtm/utils';
import {useRender, useRtc} from 'customization-api';

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const rtc = useRtc();
  const {dispatch} = rtc;
  const {renderList, activeUids} = useRender();
  const {isRecordingActive} = useRecording();
  const {executeNormalQuery, executePresenterQuery} = useRecordingLayoutQuery();
  const {setScreenShareData, screenShareData} = useScreenContext();
  // commented for v1 release
  // const getScreenShareName = useString('screenshareUserName');
  // const userText = useString('remoteUserDefaultLabel')();
  const getScreenShareName = (name: string) => `${name}'s screenshare`;
  const userText = 'User';
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();

  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const renderListRef = useRef({renderList: renderList});

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  const triggerChangeLayout = (pinned: boolean, screenShareUid?: UidType) => {
    //screenshare is started set the layout to Pinned View
    if (pinned && screenShareUid) {
      dispatch({
        type: 'SwapVideo',
        value: [screenShareUid],
      });
      setPinnedLayout();
    } else {
      //screenshare is stopped set the layout Grid View
      changeLayout();
    }
  };

  useEffect(() => {
    events.on(EventNames.SCREENSHARE_ATTRIBUTE, (data) => {
      const payload = JSON.parse(data.payload);
      const action = payload.action;
      const value = payload.value;

      const screenUidOfUser =
        renderListRef.current.renderList[data.sender].screenUid;
      switch (action) {
        case EventActions.SCREENSHARE_STARTED:
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [screenUidOfUser]: {
                name: renderListRef.current.renderList[screenUidOfUser]?.name,
                isActive: true,
                ts: value || 0,
              },
            };
          });
          //if remote user started/stopped the screenshare then change the layout to pinned/grid
          triggerChangeLayout(true, screenUidOfUser);
          break;
        case EventActions.SCREENSHARE_STOPPED:
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [screenUidOfUser]: {
                name: renderListRef.current.renderList[screenUidOfUser]?.name,
                isActive: false,
                ts: value || 0,
              },
            };
          });
          //if remote user started/stopped the screenshare then change the layout to pinned/grid
          triggerChangeLayout(false);
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    // @ts-ignore
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED SHARING');
      executeNormalQuery();
      events.send(
        EventNames.SCREENSHARE_ATTRIBUTE,
        JSON.stringify({
          action: EventActions.SCREENSHARE_STOPPED,
          value: 0,
        }),
        EventPersistLevel.LEVEL2,
      );
      setScreenShareData((prevState) => {
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
      triggerChangeLayout(false);
    });
  }, []);

  const executeRecordingQuery = (isScreenActive: boolean) => {
    if (isScreenActive) {
      console.log('screenshare: Executing presenter query');
      // If screen share is not going on, start the screen share by executing the graphql query
      executePresenterQuery(screenShareUid);
    } else {
      // If recording is already going on, stop the recording by executing the graphql query.
      executeNormalQuery();
    }
  };

  const stopUserScreenShare = () => {
    if (!isScreenshareActive) return;
    userScreenshare(false);
  };
  const startUserScreenshare = () => {
    if (isScreenshareActive) return;
    userScreenshare(true);
  };

  const userScreenshare = async (isActive: boolean) => {
    if (isRecordingActive) {
      executeRecordingQuery(isActive);
    }
    console.log('screenshare query executed');
    try {
      // @ts-ignore
      await rtc.RtcEngine.startScreenshare(
        screenShareToken,
        channel,
        null,
        screenShareUid,
        appId,
        rtc.RtcEngine as unknown as IAgoraRTC,
        encryption as unknown as any,
      );
      isActive && setScreenshareActive(true);

      if (isActive) {
        // 1. Set local state
        setScreenShareData((prevState) => {
          return {
            ...prevState,
            [screenShareUid]: {
              name: renderListRef.current.renderList[screenShareUid]?.name,
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
          }),
          EventPersistLevel.LEVEL2,
        );
        //3 . if local user started the screenshare then change layout to pinned
        triggerChangeLayout(true, screenShareUid);
      }
    } catch (e) {
      console.error("can't start the screen share", e);
      executeNormalQuery();
    }
  };

  return (
    <ScreenshareContext.Provider
      value={{
        isScreenshareActive,
        startUserScreenshare,
        stopUserScreenShare,
      }}>
      {props.children}
    </ScreenshareContext.Provider>
  );
};

export default ScreenshareConfigure;
