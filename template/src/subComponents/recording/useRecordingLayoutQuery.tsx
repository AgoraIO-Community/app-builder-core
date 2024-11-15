import React from 'react';
import {useParams} from '../../components/Router';

import {gql, useMutation} from '@apollo/client';
import {UidType} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';

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
  const {phrase} = useParams<any>();
  /**
   * @param screenShareUid
   * Default : Grid
   * Below query changes the layout to vertical and passed UID is maxed view
   * This should be called only when screenshare is actively going on
   * and we want that as the main view
   * https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful
   */
  const executePresenterQuery = (screenShareUid: UidType) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    setPresenterQuery({
      variables: {
        uid: screenShareUid,
        passphrase: phrase,
      },
      context: {
        headers: {
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
      },
    })
      .then(res => {
        if (res?.data?.setPresenter === 'success') {
          const endReqTs = Date.now();
          logger.log(
            LogSource.Internals,
            'RECORDING',
            'setPresenterQuery success',
            {
              responseData: res,
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
        }
      })
      .catch(error => {
        const endReqTs = Date.now();
        logger.error(
          LogSource.Internals,
          'RECORDING',
          'setPresenterQuery failure',
          error,
          {
            networkError: {
              name: error?.networkError?.name,
              //@ts-ignore
              code: error?.networkError?.result?.error?.code,
              //@ts-ignore
              message: error?.networkError?.result?.error?.message,
            },
            startReqTs,
            endReqTs,
            latency: endReqTs - startReqTs,
            requestId,
          },
        );
      });
  };

  const executeNormalQuery = () => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    setNormalQuery({
      variables: {passphrase: phrase},
      context: {
        headers: {
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
      },
    })
      .then(res => {
        if (res?.data?.stopRecordingSession === 'success') {
          const endReqTs = Date.now();
          logger.log(
            LogSource.Internals,
            'RECORDING',
            'executeNormalQuery success',
            {
              responseData: res,
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
          // Once the backend sucessfuly stops recording,
          // send a control message to everbody in the channel indicating that cloud recording is now inactive.
          // sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
          // set the local recording state to false to update the UI
          // setScreenshareActive(false);
        }
      })
      .catch(error => {
        const endReqTs = Date.now();
        logger.error(
          LogSource.Internals,
          'RECORDING',
          'executeNormalQuery failure',
          error,
          {
            networkError: {
              name: error?.networkError?.name,
              //@ts-ignore
              code: error?.networkError?.result?.error?.code,
              //@ts-ignore
              message: error?.networkError?.result?.error?.message,
            },
            startReqTs,
            endReqTs,
            latency: endReqTs - startReqTs,
            requestId,
          },
        );
      });
  };

  return {
    executeNormalQuery,
    executePresenterQuery,
  };
}

export default useRecordingLayoutQuery;
