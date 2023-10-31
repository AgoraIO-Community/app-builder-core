import React from 'react';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';

import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import {useLocalUid} from '../../../agora-rn-uikit';
import {useParams} from '../../components/Router';

interface IuseWaitingRoomAPI {
  request: ({meetingPhrase: string, send_event: boolean}) => Promise<void>;
  approval: ({
    host_uid: number,
    attendee_uid,
    approved: boolean,
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
    const res = await apiCall('request', payload);
    console.log('waitingRoom: request response', res);
    return res;
  };

  const approval = async ({host_uid, attendee_uid, approved}) => {
    const payload = JSON.stringify({
      passphrase: phrase,
      host_uid: host_uid, //host id of approver,
      attendee_uid: attendee_uid, //uid of whose request was approved,
      approved: approved, //approval status,
    });
    const res = await apiCall('approval', payload);
    console.log('waitingRoom: approval response', res);
    return res;
  };

  return {request, approval};
};

export default useWaitingRoomAPI;
