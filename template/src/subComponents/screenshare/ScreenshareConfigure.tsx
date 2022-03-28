import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useParams} from '../../components/Router';
import ChatContext from '../../components/ChatContext';
import {
  RtcContext,
  PropsContext,
  MinUidContext,
  MaxUidContext,
} from '../../../agora-rn-uikit/src';
import Layout from '../LayoutEnum';
import {gql, useMutation} from '@apollo/client';
import ScreenshareContext from './ScreenshareContext';

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

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const ScreenshareContextConsumer = ScreenshareContext.Consumer;

export const ScreenshareConfigure = (props: any) => {
  const {userList} = useContext(ChatContext);
  const [screenshareActive, setScreenshareActive] = useState(false);
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  const prevUsers = usePrevious({users});
  const {phrase} = useParams<any>();
  const {setLayout, recordingActive} = props;
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const [setPresenterQuery] = useMutation(SET_PRESENTER);
  const [setNormalQuery] = useMutation(SET_NORMAL);

  useEffect(() => {
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED SHARING');
      setLayout((l: Layout) =>
        l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
      );
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
    if (prevUsers !== undefined) {
      let joinedUser = users.filter((person) =>
        prevUsers?.users.every((person2) => !(person2.uid === person.uid)),
      );
      let leftUser = prevUsers?.users.filter((person) =>
        users.every((person2) => !(person2.uid === person.uid)),
      );

      if (joinedUser.length === 1) {
        const newUserUid = joinedUser[0].uid;
        if (userList[newUserUid] && userList[newUserUid].type === 1) {
          dispatch({
            type: 'SwapVideo',
            value: [joinedUser[0]],
          });
          setLayout(Layout.Pinned);
        } else if (newUserUid === 1) {
          if (newUserUid !== users[0].uid) {
            dispatch({
              type: 'SwapVideo',
              value: [joinedUser[0]],
            });
          }
          setLayout(Layout.Pinned);
        }
      }

      if (leftUser.length === 1) {
        const leftUserUid = leftUser[0].uid;
        if (userList[leftUserUid] && userList[leftUserUid].type === 1) {
          setLayout((l: Layout) =>
            l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
          );
        }
      }
    }
  }, [users, userList]);

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
    if (screenshareActive) {
      startUserScreenshare();
    }
  };

  const startUserScreenshare = async () => {
    const isScreenActive = screenshareActive;
    if (recordingActive) {
      executeRecordingQuery(isScreenActive);
    }
    try {
      await rtc.RtcEngine.startScreenshare(
        screenShareToken,
        channel,
        null,
        screenShareUid,
        appId,
        rtc.RtcEngine,
        encryption,
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
        screenshareActive,
        startUserScreenshare,
        stopUserScreenShare,
      }}>
      {props.children}
    </ScreenshareContext.Provider>
  );
};

export default ScreenshareConfigure;
