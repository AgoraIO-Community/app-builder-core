import {useContext} from 'react';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import getUniqueID from './getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import StorageContext from '../components/StorageContext';

const SHARE_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/share`;

export default function useGetMeetingPhrase() {
  const {setRoomInfo} = useSetRoomInfo();
  const {store} = useContext(StorageContext);
  return async (phrase: string) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    logger.log(
      LogSource.Internals,
      'GET_MEETING_PHRASE',
      'Query Trying request to meeting phrase details',
      {
        requestId,
        startReqTs,
      },
    );
    try {
      const payload = JSON.stringify({
        passphrase: phrase,
      });
      const res = await fetch(`${SHARE_URL}`, {
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
        throw response.error;
      } else {
        const endReqTs = Date.now();
        logger.log(
          LogSource.Internals,
          'GET_MEETING_PHRASE',
          'Query GET_MEETING_PHRASE success',
          {
            responseData: response,
            requestId,
            startReqTs,
            endReqTs,
            latency: endReqTs - startReqTs,
          },
        );
        try {
          if (response) {
            let data = response;
            let roomInfo: Partial<RoomInfoContextInterface['data']> = {
              roomId: {attendee: ''},
            };
            if (data?.passphrases?.attendee) {
              roomInfo.roomId.attendee = data.passphrases.attendee;
            }
            if (data?.passphrases?.host) {
              roomInfo.roomId.host = data.passphrases.host;
            }
            if (data?.pstn) {
              roomInfo.pstn = {
                number: data.pstn.number,
                pin: data.pstn.dtmf,
              };
            }
            setRoomInfo(prevState => {
              return {
                ...prevState,
                data: {
                  ...prevState.data,
                  roomId: roomInfo.roomId,
                  pstn: roomInfo?.pstn,
                },
              };
            });
          }
        } catch (error) {
          throw new Error('An error occurred in parsing the channel data.');
        }
      }
    } catch (error) {
      const endReqTs = Date.now();
      logger.error(
        LogSource.Internals,
        'GET_MEETING_PHRASE',
        'Query GET_MEETING_PHRASE failed',
        JSON.stringify(error || {}),
        {
          requestId,
          startReqTs,
          endReqTs,
          latency: endReqTs - startReqTs,
        },
      );
      throw error;
    }
  };
}
