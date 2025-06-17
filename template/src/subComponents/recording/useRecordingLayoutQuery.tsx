import React, {useContext} from 'react';
import {useParams} from '../../components/Router';

import {UidType} from '../../../agora-rn-uikit';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import getUniqueID from '../../utils/getUniqueID';
import StorageContext from '../../components/StorageContext';

const RECORDING_LAYOUT_URL = `${$config.BACKEND_ENDPOINT}/v1/recording/layout/update`;

function useRecordingLayoutQuery() {
  const {store} = useContext(StorageContext);
  const {phrase} = useParams<any>();
  /**
   * @param screenShareUid
   * Default : Grid
   * Below query changes the layout to vertical and passed UID is maxed view
   * This should be called only when screenshare is actively going on
   * and we want that as the main view
   * https://docs.agora.io/en/cloud-recording/cloud_recording_layout?platform=RESTful
   */
  const executePresenterQuery = async (screenShareUid: UidType) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();

    try {
      const payload = JSON.stringify({
        uid: screenShareUid?.toString(),
        passphrase: phrase,
        preset: 'presenter',
      });
      const res = await fetch(`${RECORDING_LAYOUT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: payload,
      });
      const response = await res.json();

      if (response?.error) {
        throw response?.error;
      } else {
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
    } catch (error) {
      const endReqTs = Date.now();
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'setPresenterQuery failure',
        JSON.stringify(error || {}),
        {
          startReqTs,
          endReqTs,
          latency: endReqTs - startReqTs,
          requestId,
        },
      );
    }
  };

  const executeNormalQuery = async () => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();

    const payload = JSON.stringify({
      passphrase: phrase,
      preset: 'normal',
    });
    try {
      const res = await fetch(`${RECORDING_LAYOUT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: payload,
      });
      const response = await res.json();

      if (response?.error) {
        throw response?.error;
      } else {
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
    } catch (error) {
      const endReqTs = Date.now();
      logger.error(
        LogSource.Internals,
        'RECORDING',
        'executeNormalQuery failure',
        JSON.stringify(error || {}),
        {
          startReqTs,
          endReqTs,
          latency: endReqTs - startReqTs,
          requestId,
        },
      );
    }
  };

  return {
    executeNormalQuery,
    executePresenterQuery,
  };
}

export default useRecordingLayoutQuery;
