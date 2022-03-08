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
import React, {createContext, useContext, useEffect, useRef} from 'react';
import {gql, useMutation} from '@apollo/client';
import {RtcContext,PropsContext,MinUidContext, MaxUidContext, UidInterface} from '../../../agora-rn-uikit';
import {useParams} from '../../components/Router';
import ChatContext from '../../components/ChatContext';
import Layout from '../LayoutEnum';
import {createHook, useVideoCall} from 'fpe-api';

export interface ScreenShareContextInterface {  
  children:React.ReactNode,
  startScreenShare?: () => void;
  screenshareActive: boolean;
  setScreenshareActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const ScreenShareContext: React.Context<ScreenShareContextInterface> = createContext({
  children: <></>,
  screenshareActive: false,
  setScreenshareActive: () => {},
  startScreenShare: () => {},
} as ScreenShareContextInterface);


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
type users = {users: UidInterface[]}
function usePrevious(value:users) {
  const ref = useRef<users>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}



const ScreenShareProvider = (props: ScreenShareContextInterface) => {
  const {userList} = useContext(ChatContext);
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  const prevUsers = usePrevious({users});  
  const {setLayout, recordingActive} = useVideoCall(data => data);
  const {screenshareActive, setScreenshareActive} = props;
  const {phrase} = useParams<{phrase:string}>();
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const [setPresenterQuery] = useMutation(SET_PRESENTER);
  const [setNormalQuery] = useMutation(SET_NORMAL);

  const executeNormalQuery = () => {
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
  const executePresentQuery = () => {
    setPresenterQuery({
      variables: {
        uid: screenShareUid,
        passphrase: phrase,
      },
    })
      .then((res) => {
        if (res.data.setPresenter === 'success') {
          // Once the backend sucessfuly starts screnshare,
          // send a control message to everbody in the channel indicating that screen sharing is now active.
          // sendControlMessage(controlMessageEnum.cloudRecordingActive);
          // set the local recording state to true to update the UI
          // setScreenshareActive(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const startScreenShare = async ( ) => {
    const isScreenActive = screenshareActive;
    if (!isScreenActive && recordingActive) {
      // If screen share is not going on, start the screen share by executing the graphql query
      executePresentQuery();
    } else if (isScreenActive && recordingActive) {
      // If recording is already going on, stop the recording by executing the graphql query.
      executeNormalQuery();
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
      executeNormalQuery();
    }
  }

  useEffect(() => {
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED SHARING');
      setLayout((l: Layout) =>
        l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
      );
      executeNormalQuery()
    });
  }, []);

  useEffect(() => {
    if (prevUsers !== undefined) {
      let joinedUser = users.filter((person) =>
        prevUsers.users.every((person2) => !(person2.uid === person.uid)),
      );
      let leftUser = prevUsers.users.filter((person) =>
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

  return (
    <ScreenShareContext.Provider
      value={{...props, screenshareActive, startScreenShare, setScreenshareActive}}
    >
      {true ? props.children : <></>}
    </ScreenShareContext.Provider>
  );
};

const useScreenShare = createHook(ScreenShareContext);

export { ScreenShareProvider, useScreenShare };