import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';

import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import {useLocalUid} from '../../../agora-rn-uikit';
import {useParams} from '../../components/Router';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

interface IuseWaitingRoomAPI {
  request: (params: {
    meetingPhrase?: string;
    send_event: boolean;
  }) => Promise<void>;
  approval: (params: {
    host_uid: number;
    attendee_uid: number;
    attendee_screenshare_uid?: number;
    approved: boolean;
  }) => Promise<void>;
}

const WAITING_ROOM_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/join`;

const useWaitingRoomAPI = (): IuseWaitingRoomAPI => {
  const {store} = React.useContext(StorageContext);
  const {phrase} = useParams<{phrase: string}>();
  const {
    data: {roomId, isHost},
  } = useRoomInfo();

  const apiCall = async (method: 'request' | 'approval', payload: string) => {
    const response = await fetch(`${WAITING_ROOM_URL}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
      },
      body: payload,
    });
    const res = await response.json();

    return res;
  };

  const request = async ({meetingPhrase, send_event}) => {
    const payload = JSON.stringify({
      passphrase: meetingPhrase || phrase,
      send_event: send_event,
    });
    logger.log(
      LogSource.NetworkRest,
      'channel_join_request',
      'API channel_join_request trying to send request to join channel',
      payload,
    );
    const res = await apiCall('request', payload);
    logger.log(
      LogSource.NetworkRest,
      'channel_join_request',
      'API channel_join_request executed successfully',
      res,
    );
    return res;
  };

  const approval = async ({
    host_uid,
    attendee_uid,
    approved,
    attendee_screenshare_uid,
  }) => {
    const payload = JSON.stringify({
      passphrase: phrase,
      host_uid: host_uid, //host id of approver,
      attendee_uid: attendee_uid, //uid of whose request was approved,
      attendee_screenshare_uid: attendee_screenshare_uid, // screenshare uid of attendee
      approved: approved, //approval status,
    });
    logger.log(
      LogSource.NetworkRest,
      'channel_join_approval',
      `API channel_join_approval. Trying to approve join channel request as waiting room is enabled. Is request approved ?  ${approved}`,
      payload,
    );
    const res = await apiCall('approval', payload);
    logger.log(
      LogSource.NetworkRest,
      'channel_join_request',
      'API channel_join_approval executed successfully',
      res,
    );
    return res;
  };

  return {request, approval};
};

export default useWaitingRoomAPI;
