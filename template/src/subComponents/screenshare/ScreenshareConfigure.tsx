import React, {useContext, useEffect, useRef, useState} from 'react';
import {RtcContext, PropsContext, UidType} from '../../../agora-rn-uikit';
import {ScreenshareContext} from './useScreenshare';
import {
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useRecording} from '../recording/useRecording';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import useUserList from '../../utils/useUserList';
import CustomEvents, {EventLevel} from '../../custom-events';
import {EventNames} from '../../rtm-events';
import {IAgoraRTC} from 'agora-rtc-sdk-ng';
import useRecordingLayoutQuery from '../recording/useRecordingLayoutQuery';
import {useString} from '../../utils/useString';

function usePrevious<T = any>(value: any) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: {children: React.ReactNode}) => {
  const [isScreenshareActive, setScreenshareActive] = useState(false);
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const {renderList, renderPosition} = useUserList();
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
    CustomEvents.on(EventNames.SCREENSHARE_ATTRIBUTE, (data) => {
      const screenUidOfUser =
        renderListRef.current.renderList[data.sender].screenUid;
      setScreenShareData((prevState) => {
        return {
          ...prevState,
          [screenUidOfUser]: {
            name: renderListRef.current.renderList[screenUidOfUser]?.name,
            isActive: data.payload.value === 'true' ? true : false,
          },
        };
      });
      //if remote user started/stopped the screenshare then change the layout to pinned/grid
      data.payload.value === 'true'
        ? triggerChangeLayout(true, screenUidOfUser)
        : triggerChangeLayout(false);
    });
  }, []);

  useEffect(() => {
    // @ts-ignore
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED SHARING');
      executeNormalQuery();
      CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
        value: `${false}`,
        level: EventLevel.LEVEL2,
      });
      //if local user stopped the screenshare then change layout to grid
      triggerChangeLayout(false);
    });
  }, []);

  const executeRecordingQuery = (isScreenActive: boolean) => {
    if (!isScreenActive) {
      // If screen share is not going on, start the screen share by executing the graphql query
      executePresenterQuery();
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
    } catch (e) {
      console.error("can't start the screen share", e);
      executeNormalQuery();
    }
    if (isActive) {
      CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
        value: `${true}`,
        level: EventLevel.LEVEL2,
      });
      //if local user started the screenshare then change layout to pinned
      triggerChangeLayout(true, screenShareUid);
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
