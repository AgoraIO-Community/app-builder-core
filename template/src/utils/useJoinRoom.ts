import {useContext} from 'react';
import StorageContext from '../components/StorageContext';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import useWaitingRoomAPI from '../subComponents/waiting-rooms/useWaitingRoomAPI';
import {base64ToUint8Array} from '../utils';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from './getUniqueID';
import {chatErrorNoToken} from '../language/default-labels/videoCallScreenLabels';
import {useString} from '../utils/useString';
import isSDK from './isSDK';
import {AuthErrorCodes} from './common';
import SDKEvents from './SdkEvents';

const JOIN_CHANNEL_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/join`;
/**
 * Returns an asynchronous function to join a meeting with the given phrase.
 */

export interface joinRoomPreference {
  disableShareTile: boolean;
  disableVideoProcessors: boolean;
  disableChat?: boolean;
  disableInvite?: boolean;
  disableScreenShare?: boolean;
  disableSettings?: boolean;
  disableParticipants?: boolean;
  userRemovalTimeout?: number;
}

export default function useJoinRoom() {
  const {store} = useContext(StorageContext);
  const {setRoomInfo} = useSetRoomInfo();

  const {request: requestToJoin} = useWaitingRoomAPI();
  const isWaitingRoomEnabled = $config.ENABLE_WAITING_ROOM;
  const chatErrorNoTokenText = useString(chatErrorNoToken)();

  return async (phrase: string, preference?: joinRoomPreference) => {
    setRoomInfo(prevState => {
      return {
        ...prevState,
        isJoinDataFetched: false,
      };
    });
    try {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      let response = null;
      if (isWaitingRoomEnabled) {
        logger.log(
          LogSource.NetworkRest,
          'channel_join_request',
          'API channel_join_request. Trying request to join channel as waiting room is enabled',
        );
        response = await requestToJoin({
          meetingPhrase: phrase,
          send_event: false,
        });
      } else {
        logger.log(
          LogSource.NetworkRest,
          'joinChannel',
          'API joinChannel. Trying to join channel. Waiting room is disabled',
          {
            startReqTs,
            requestId,
          },
        );
        const payload = JSON.stringify({
          passphrase: phrase,
        });
        const res = await fetch(`${JOIN_CHANNEL_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: store.token ? `Bearer ${store.token}` : '',
            'X-Request-Id': requestId,
            'X-Session-Id': logger.getSessionId(),
          },
          body: payload,
        });
        response = await res.json();
      }
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      if (response?.error) {
        if (isWaitingRoomEnabled) {
          const errorCode = response?.error?.code;
          if (AuthErrorCodes.indexOf(errorCode) !== -1 && isSDK()) {
            SDKEvents.emit('unauthorized', response?.error);
          }
        }
        logger.error(
          LogSource.NetworkRest,
          `${isWaitingRoomEnabled ? 'channel_join_request' : 'joinChannel'}`,
          `API ${
            isWaitingRoomEnabled ? 'channel_join_request' : 'joinChannel'
          } failed.`,
          'Join Channel Failed',
          JSON.stringify(response?.error || {}),
          {
            startReqTs,
            endReqTs,
            latency,
            requestId,
          },
        );
        throw response.error;
      } else {
        if (response) {
          let data = response;
          logger.log(
            LogSource.NetworkRest,
            `${isWaitingRoomEnabled ? 'channel_join_request' : 'joinChannel'}`,
            `API to ${
              isWaitingRoomEnabled ? 'channel_join_request' : 'joinChannel'
            } successful.`,
            {
              responseData: data,
              phrase: phrase,
              startReqTs,
              endReqTs,
              latency,
              requestId,
            },
          );
          let roomInfo: Partial<RoomInfoContextInterface['data']> = {};

          if (data?.channel_name || data?.channel) {
            roomInfo.channel = isWaitingRoomEnabled
              ? data.channel
              : data.channel_name;
          }
          if (data?.main_user?.uid || data?.mainUser?.uid) {
            roomInfo.uid = isWaitingRoomEnabled
              ? data.mainUser.uid
              : data.main_user.uid;
          }
          if (data?.main_user?.rtc || data?.mainUser?.rtc) {
            roomInfo.token = isWaitingRoomEnabled
              ? data.mainUser.rtc
              : data.main_user.rtc;
          }
          if (data?.main_user?.rtm || data?.mainUser?.rtm) {
            roomInfo.rtmToken = isWaitingRoomEnabled
              ? data.mainUser.rtm
              : data.main_user.rtm;
          }

          if (data?.secret) {
            roomInfo.encryptionSecret = data.secret;
          }
          if (data?.secret_salt || data?.secretSalt) {
            roomInfo.encryptionSecretSalt = base64ToUint8Array(
              isWaitingRoomEnabled ? data.secretSalt : data.secret_salt,
            ) as Uint8Array;
          }

          if (data?.encryption_mode) {
            roomInfo.encryptionMode = data.encryption_mode;
          }

          if (data?.screen_share_user?.uid || data?.screenShare?.uid) {
            roomInfo.screenShareUid = isWaitingRoomEnabled
              ? data.screenShare.uid
              : data.screen_share_user.uid;
          }
          if (data?.screen_share_user?.rtc || data?.screenShare?.rtc) {
            roomInfo.screenShareToken = isWaitingRoomEnabled
              ? data.screenShare.rtc
              : data.screen_share_user.rtc;
          }

          if (data?.chat) {
            const chatData = data.chat;

            const hasError = chatData?.error?.code || chatData?.error?.message;
            const missingUserToken = !(isWaitingRoomEnabled
              ? data.chat?.userToken
              : data.chat?.user_token);
            if ($config.CHAT && (hasError || missingUserToken)) {
              roomInfo.chat = {
                user_token: '',
                group_id: '',
                is_group_owner: false,
                error: {
                  code:
                    chatData?.error?.code ||
                    (missingUserToken ? 'NO_USER_TOKEN' : ''),
                  message:
                    chatData?.error?.message ||
                    (missingUserToken ? chatErrorNoTokenText : ''),
                },
              };
            } else {
              const chat: RoomInfoContextInterface['data']['chat'] = {
                user_token: isWaitingRoomEnabled
                  ? data.chat?.userToken
                  : data.chat?.user_token,
                group_id: isWaitingRoomEnabled
                  ? data.chat?.groupId
                  : data.chat?.group_id,
                is_group_owner: isWaitingRoomEnabled
                  ? data.chat?.isGroupOwner
                  : data.chat?.is_group_owner,
                error: null,
              };
              roomInfo.chat = chat;
            }
          }

          roomInfo.isHost = isWaitingRoomEnabled ? data.isHost : data.is_host;

          if (data?.joinChannel?.title || data?.title) {
            roomInfo.meetingTitle = data.title;
          }
          if (data?.whiteboard) {
            const whiteboardData = data.whiteboard;

            if (
              $config.ENABLE_WHITEBOARD &&
              (whiteboardData?.error?.code || whiteboardData?.error?.message)
            ) {
              roomInfo.whiteboard = {
                room_token: '',
                room_uuid: '',
                error: {
                  code: whiteboardData?.error?.code,
                  message: whiteboardData?.error?.message,
                },
              };
            } else {
              const whiteboard: RoomInfoContextInterface['data']['whiteboard'] =
                {
                  room_token: data.whiteboard?.room_token,
                  room_uuid: data.whiteboard?.room_uuid,
                  error: null,
                };
              if (whiteboard?.room_token && whiteboard?.room_uuid) {
                roomInfo.whiteboard = whiteboard;
              }
            }
          }

          //set the ai agent data
          if ($config.ENABLE_CONVERSATIONAL_AI) {
            roomInfo.agents = data?.agents;
          }

          const validPreference =
            preference && Object.keys(preference).length > 0;
          setRoomInfo(prevState => {
            let compiledMeetingInfo = {
              ...prevState.data,
              ...roomInfo,
            };
            return {
              ...prevState,
              isJoinDataFetched: true,
              data: compiledMeetingInfo,
              roomPreference: validPreference
                ? {...preference}
                : prevState.roomPreference,
            };
          });
          return roomInfo;
        } else {
          throw new Error('An error occurred in parsing the channel data.');
        }
      }
    } catch (error) {
      throw error;
    }
  };
}
