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
import React, {useEffect, useContext, useRef} from 'react';
import KeepAwake from 'react-native-keep-awake';
import {RtcContext, UidType} from '../../../agora-rn-uikit';
import {
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import useUserList from '../../utils/useUserList';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import {useString} from '../../utils/useString';
import CustomEvents from '../../custom-events';
import {EventNames, EventActions} from '../../rtm-events';

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const {renderList, renderPosition} = useUserList();
  const {setScreenShareData, screenShareData} = useScreenContext();
  // commented for v1 release
  // const getScreenShareName = useString('screenshareUserName');
  // const userText = useString('remoteUserDefaultLabel')();
  const getScreenShareName = (name: string) => `${name}'s screenshare`;
  const userText = 'User';
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();

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
    CustomEvents.on(EventNames.SCREENSHARE_ATTRIBUTE, (data) => {
      const screenUidOfUser =
        renderListRef.current.renderList[data.sender].screenUid;
      switch (data?.payload?.action) {
        case EventActions.SCREENSHARE_STARTED:
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [screenUidOfUser]: {
                name: renderListRef.current.renderList[screenUidOfUser]?.name,
                isActive: true,
                ts: data.payload.value || 0,
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
                ts: data.payload.value || 0,
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

  return (
    <>
      {props.children}
      <KeepAwake />
    </>
  );
};

export default ScreenshareConfigure;
