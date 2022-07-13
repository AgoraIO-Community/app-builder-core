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
import {RtcContext} from '../../../agora-rn-uikit';
import {
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import useUserList from '../../utils/useUserList';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const {renderList, renderPosition} = useUserList();
  const {setScreenShareData, screenShareData} = useScreenContext();
  const prevRenderPosition = usePrevious({renderPosition});
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();
  useEffect(() => {
    if (prevRenderPosition !== undefined) {
      let joinedUser = renderPosition.filter((uid) =>
        prevRenderPosition?.renderPosition.every((olduid) => !(olduid === uid)),
      );
      let leftUser = prevRenderPosition?.renderPosition.filter((olduid) =>
        renderPosition.every((newuid) => !(newuid === olduid)),
      );
      if (joinedUser.length === 1) {
        const newUserUid = joinedUser[0];
        if (screenShareData[newUserUid]) {
          dispatch({
            type: 'UpdateRenderList',
            value: [
              typeof newUserUid === 'number'
                ? newUserUid
                : parseInt(newUserUid),
              {type: 'screenshare', name: screenShareData[newUserUid].name},
            ],
          });
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [newUserUid]: {
                ...prevState[newUserUid],
                isActive: true,
              },
            };
          });
          dispatch({
            type: 'SwapVideo',
            value: [newUserUid],
          });
          setPinnedLayout();
        }
      }
      if (leftUser.length === 1) {
        const leftUserUid = leftUser[0];
        if (screenShareData[leftUserUid]) {
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [leftUserUid]: {
                ...prevState[leftUserUid],
                isActive: false,
              },
            };
          });
          changeLayout();
        }
      }
    }
  }, [renderPosition, renderList]);
  return (
    <>
      {props.children}
      <KeepAwake />
    </>
  );
};

export default ScreenshareConfigure;
