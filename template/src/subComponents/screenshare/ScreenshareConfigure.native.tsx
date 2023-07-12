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
import React, {useEffect, useRef, useState} from 'react';
import KeepAwake from 'react-native-keep-awake';
import {UidType} from '../../../agora-rn-uikit';
import {
  getGridLayoutName,
  getPinnedLayoutName,
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import {useString} from '../../utils/useString';
import events from '../../rtm-events-api';
import {EventNames, EventActions} from '../../rtm-events';
import {useLayout, useRender, useRtc} from 'customization-api';
import {filterObject} from '../../utils';
import {ScreenshareContext} from './useScreenshare';
import {PermissionsAndroid, Platform} from 'react-native';

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const {dispatch, RtcEngine} = useRtc();
  const {renderList, activeUids, lastJoinedUid, pinnedUid} = useRender();
  const isPinned = useRef(0);
  const {setScreenShareData, screenShareData} = useScreenContext();
  // commented for v1 release
  // const getScreenShareName = useString('screenshareUserName');
  // const userText = useString('remoteUserDefaultLabel')();
  const getScreenShareName = (name: string) => `${name}'s screenshare`;
  const userText = 'User';
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();
  const {currentLayout} = useLayout();
  const renderListRef = useRef({renderList: renderList});
  const currentLayoutRef = useRef({currentLayout: currentLayout});

  const pinnedUidRef = useRef({pinnedUid: pinnedUid});

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ]);
    }
  }, []);

  useEffect(() => {
    pinnedUidRef.current.pinnedUid = pinnedUid;
  }, [pinnedUid]);

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  useEffect(() => {
    currentLayoutRef.current.currentLayout = currentLayout;
  }, [currentLayout]);

  useEffect(() => {
    const data = filterObject(screenShareData, ([k, v]) => v?.isActive);
    if (data) {
      const recentScreenshare = Object.keys(data)
        .map((i) => parseInt(i))
        .sort((a, b) => {
          return data[a].ts - data[b].ts;
        });
      if (recentScreenshare?.length) {
        recentScreenshare.reverse();
        if (
          isPinned.current !== recentScreenshare[0] &&
          activeUids.indexOf(recentScreenshare[0]) !== -1
        ) {
          triggerChangeLayout(true, recentScreenshare[0]);
        }
      }
    }
  }, [activeUids, screenShareData]);

  const triggerChangeLayout = (pinned: boolean, screenShareUid?: UidType) => {
    let layout = currentLayoutRef.current.currentLayout;
    //screenshare is started set the layout to Pinned View
    if (pinned && screenShareUid) {
      isPinned.current = screenShareUid;
      dispatch({
        type: 'SwapVideo',
        value: [screenShareUid],
      });
      layout !== getPinnedLayoutName() && setPinnedLayout();
    } else {
      isPinned.current = 0;
      //screenshare is stopped set the layout Grid View
      layout !== getGridLayoutName() && changeLayout();
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
          //if user pinned somebody then don't triggerlayout change
          if (!pinnedUidRef.current.pinnedUid) {
            triggerChangeLayout(false);
          }
          break;
        default:
          break;
      }
    });
  }, []);

  const startUserScreenshare = () => {
    if (!isScreenshareActive) {
      RtcEngine?.startScreenCapture({
        captureAudio: true,
        captureVideo: true,
      });
      setScreenshareActive(true);
    } else {
      console.log('screenshare is already active');
    }
  };

  const stopUserScreenShare = () => {
    if (isScreenshareActive) {
      RtcEngine?.stopScreenCapture();
      setScreenshareActive(false);
    } else {
      console.log('no screenshare is active');
    }
  };

  const ScreenshareStoppedCallback = () => {};

  return (
    <ScreenshareContext.Provider
      value={{
        isScreenshareActive,
        startUserScreenshare,
        stopUserScreenShare,
        //@ts-ignore
        ScreenshareStoppedCallback,
      }}>
      {props.children}
      <KeepAwake />
    </ScreenshareContext.Provider>
  );
};

export default ScreenshareConfigure;
