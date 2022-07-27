import React, {useContext, useEffect, useRef, useState} from 'react';
import {useParams} from '../../components/Router';
import {RtcContext, PropsContext, UidType} from '../../../agora-rn-uikit';
import {gql, useMutation} from '@apollo/client';
import {ScreenshareContext} from './useScreenshare';
import {
  useChangeDefaultLayout,
  useSetPinnedLayout,
} from '../../pages/video-call/DefaultLayouts';
import {useRecording} from '../recording/useRecording';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import useUserList from '../../utils/useUserList';
import CustomEvents from '../../custom-events';
import {EventNames, EventActions} from '../../rtm-events';
import {IAgoraRTC} from 'agora-rtc-sdk-ng';

const SET_PRESENTER = gql`
  mutation setPresenter($uid: Int!, $passphrase: String!) {
    setPresenter(uid: $uid, passphrase: $passphrase)
  }
`;

const SET_NORMAL = gql`
  mutation setNormal($passphrase: String!) {
    setNormal(passphrase: $passphrase)
  }
`;

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
  const {setScreenShareData, screenShareData} = useScreenContext();
  const prevRenderPosition = usePrevious<{renderPosition: UidType[]}>({
    renderPosition,
  });
  const {phrase} = useParams<any>();
  const {isRecordingActive} = useRecording();
  const setPinnedLayout = useSetPinnedLayout();
  const changeLayout = useChangeDefaultLayout();
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const [setPresenterQuery] = useMutation(SET_PRESENTER);
  const [setNormalQuery] = useMutation(SET_NORMAL);

  useEffect(() => {
    CustomEvents.on(EventNames.SCREENSHARE_ATTRIBUTE, (data) => {
      setScreenShareData((prevState) => {
        return {
          ...prevState,
          [data.sender]: {
            ...prevState[parseInt(data.sender)],
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
      setNormalQuery({variables: {passphrase: phrase}})
        .then((res) => {
          console.log(res.data);
          if (res.data.stopRecordingSession === 'success') {
          }
        })
        .catch((err) => {
          console.log(err);
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
        //todo:hari update with events api
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
          CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
            action: EventActions.SCREENSHARE_STARTED,
            value: true.toString(),
            level: 2,
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
          CustomEvents.send(EventNames.SCREENSHARE_ATTRIBUTE, {
            action: EventActions.RECORDING_STOPPED,
            value: false.toString(),
            level: 2,
          });
          changeLayout();
        }
      }
    }
  }, [renderPosition, renderList]);

  const executeRecordingQuery = (isScreenActive: boolean) => {
    if (!isScreenActive) {
      // If screen share is not going on, start the screen share by executing the graphql query
      setPresenterQuery({
        variables: {
          uid: screenShareUid,
          passphrase: phrase,
        },
      })
        .then((res) => {
          if (res.data.setPresenter === 'success') {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // If recording is already going on, stop the recording by executing the graphql query.
      setNormalQuery({variables: {passphrase: phrase}})
        .then((res) => {
          console.log(res.data);
          if (res.data.stopRecordingSession === 'success') {
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
      setNormalQuery({variables: {passphrase: phrase}})
        .then((res) => {
          console.log(res.data);
          if (res.data.stopRecordingSession === 'success') {
            // Once the backend sucessfuly stops recording,
            // send a control message to everbody in the channel indicating that cloud recording is now inactive.
            // sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
            // set the local recording state to false to update the UI
            // setScreenshareActive(false);
          }
        })
        .catch((err) => {
          console.log(err);
        });
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
