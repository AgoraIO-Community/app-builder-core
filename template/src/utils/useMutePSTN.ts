import {UidType} from '../../agora-rn-uikit';
import {useRoomInfo} from '../components/room-info/useRoomInfo';
import useIsPSTN from './useIsPSTN';
import getUniqueID from './getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {useContext} from 'react';
import StorageContext from '../components/StorageContext';

const MUTE_PSTN_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/pstn/mute`;

const useMutePSTN = () => {
  const {
    data: {isHost, roomId},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);
  const isPSTN = useIsPSTN();
  return async (uid: UidType) => {
    const startReqTs = Date.now();
    const requestId = getUniqueID();
    if (isHost) {
      if (isPSTN(uid)) {
        logger.log(
          LogSource.Internals,
          'MUTE_PSTN',
          'Mutation try to call MUTE_PSTN ',
          {startReqTs, requestId},
        );
        const payload = JSON.stringify({
          uid: uid?.toString(),
          passphrase: roomId?.host,
          mute: true,
        });
        try {
          const res = await fetch(`${MUTE_PSTN_URL}`, {
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
              'MUTE_PSTN',
              'Mutation MUTE_PSTN success',
              {startReqTs, endReqTs, latency: endReqTs - startReqTs, requestId},
            );
            return response;
          }
        } catch (error) {
          const endReqTs = Date.now();
          logger.error(
            LogSource.Internals,
            'MUTE_PSTN',
            'Mutation MUTE_PSTN success',
            JSON.stringify(error || {}),
            {
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
          throw error;
        }
      } else {
        console.error('UID does not belong to the PSTN user.');
      }
    } else {
      console.error('A host can only mute audience audio or video.');
    }
  };
};

export default useMutePSTN;
