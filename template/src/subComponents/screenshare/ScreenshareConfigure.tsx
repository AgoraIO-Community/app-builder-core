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
import CustomEvents from '../../custom-events';
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

  const prevRenderPosition = usePrevious<{renderPosition: UidType[]}>({
    renderPosition,
  });
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const renderListRef = useRef({renderList: renderList});

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

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
    });
  }, []);

  useEffect(() => {
    // @ts-ignore
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED SHARING');
      executeNormalQuery();
      CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
        value: false.toString(),
        level: 2,
      });
    });
  }, []);

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
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [newUserUid]: {
                ...prevState[newUserUid],
                name: getScreenShareName(
                  renderList[newUserUid]?.name || userText,
                ),
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
    if (isScreenshareActive) {
      startUserScreenshare();
    }
  };

  const startUserScreenshare = async () => {
    const isScreenActive = isScreenshareActive;
    if (isRecordingActive) {
      executeRecordingQuery(isScreenActive);
    }
    try {
      await rtc.RtcEngine.startScreenshare(
        screenShareToken,
        channel,
        null,
        screenShareUid,
        appId,
        rtc.RtcEngine as unknown as IAgoraRTC,
        encryption as unknown as any,
      );
      !isScreenActive && setScreenshareActive(true);
    } catch (e) {
      console.error("can't start the screen share", e);
      executeNormalQuery();
    }
    CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
      value: true.toString(),
      level: 2,
    });
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
