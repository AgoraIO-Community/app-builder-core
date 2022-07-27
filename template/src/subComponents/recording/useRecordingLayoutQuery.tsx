import React, {useContext} from 'react';
import {useParams} from '../../components/Router';

import {gql, useMutation} from '@apollo/client';
import {PropsContext} from '../../../agora-rn-uikit';

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

function useRecordingLayoutQuery() {
  const [setPresenterQuery] = useMutation(SET_PRESENTER);
  const [setNormalQuery] = useMutation(SET_NORMAL);
  const {screenShareUid} = useContext(PropsContext).rtcProps;
  const {phrase} = useParams<any>();

  const executePresenterQuery = () => {
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
  };

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
  };

  return {
    executeNormalQuery,
    executePresenterQuery,
  };
}

export default useRecordingLayoutQuery;
