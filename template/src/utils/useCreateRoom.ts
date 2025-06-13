import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import SDKEvents from '../utils/SdkEvents';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from './getUniqueID';
import {useContext} from 'react';
import StorageContext from '../components/StorageContext';

const CREATE_ROOM_URL = `${$config.BACKEND_ENDPOINT}/v1/channel`;

/**
 * Returns an asynchronous function to create a meeting with the given options.
 */
export type createRoomFun = (
  roomTitle: string,
  enablePSTN?: boolean,
) => Promise<void>;
export default function useCreateRoom(): createRoomFun {
  const {setRoomInfo} = useSetRoomInfo();
  const {store} = useContext(StorageContext);
  return async (
    roomTitle: string,
    enablePSTN?: boolean,
    //isSeparateHostLink will be for internal usage since backend integration is not there
    isSeparateHostLink?: boolean,
  ) => {
    const requestId = getUniqueID();
    const startReqTs = Date.now();
    logger.log(
      LogSource.NetworkRest,
      'createChannel',
      'API createChannel. Trying to create room',
      {
        roomTitle,
        enablePSTN,
        isSeparateHostLink,
        startReqTs,
        requestId,
      },
    );
    try {
      const payload = JSON.stringify({
        title: roomTitle,
        enable_pstn: enablePSTN,
      });
      const response = await fetch(`${CREATE_ROOM_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: payload,
      });
      const res = await response.json();
      if (res?.error) {
        throw res.error;
      } else if (res?.channel) {
        const endReqTs = Date.now();
        const latency = endReqTs - startReqTs;
        logger.log(
          LogSource.NetworkRest,
          'createChannel',
          'API createChannel. Channel created successfully',
          {
            responseData: res,
            startReqTs,
            endReqTs,
            latency: latency,
            requestId,
          },
        );
        let roomInfo: Partial<RoomInfoContextInterface['data']> = {
          roomId: {
            attendee: '',
          },
        };
        if (res?.viewer_pass_phrase) {
          roomInfo.roomId.attendee = res.viewer_pass_phrase;
        }
        if (res?.host_pass_phrase) {
          roomInfo.roomId.host = res.host_pass_phrase;
        }
        if (enablePSTN === true && res?.pstn) {
          if (res.pstn?.error?.code || res.pstn?.error?.message) {
            roomInfo.pstn = {
              number: '',
              pin: '',
              error: {
                code: res.pstn?.error?.code,
                message: res.pstn?.error?.message,
              },
            };
          } else {
            roomInfo.pstn = {
              number: res.pstn?.number,
              pin: res.pstn?.dtmf,
              error: null,
            };
          }
        }
        logger.log(LogSource.Internals, 'CREATE_MEETING', 'Room created', {
          isHost: true,
          isSeparateHostLink: isSeparateHostLink ? true : false,
          meetingTitle: roomTitle,
          roomId: roomInfo?.roomId,
          pstn: roomInfo?.pstn,
        });
        setRoomInfo(prev => {
          return {
            ...prev,
            data: {
              isHost: true,
              isSeparateHostLink: isSeparateHostLink ? true : false,
              meetingTitle: roomTitle,
              roomId: roomInfo?.roomId,
              pstn: roomInfo?.pstn,
            },
          };
        });
        SDKEvents.emit(
          'create',
          roomInfo.roomId.host,
          roomInfo.roomId.attendee,
          roomInfo?.pstn,
        );
      } else {
        throw new Error(`An error occurred in parsing the channel data.`);
      }
    } catch (error) {
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      logger.error(
        LogSource.NetworkRest,
        'createChannel',
        'API createChannel failed. There was an error',
        JSON.stringify(error || {}),
        {
          startReqTs,
          endReqTs,
          latency: latency,
          requestId,
        },
      );
      throw error;
    }
  };
}
