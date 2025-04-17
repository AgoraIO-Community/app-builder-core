import {useContext} from 'react';
import {gql} from '@apollo/client';
import StorageContext from '../components/StorageContext';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {GraphQLContext} from '../components/GraphQLProvider';
import useGetName from './useGetName';
import useWaitingRoomAPI from '../subComponents/waiting-rooms/useWaitingRoomAPI';
import {base64ToUint8Array} from '../utils';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from './getUniqueID';
import {
  chatErrorNoToken
} from '../language/default-labels/videoCallScreenLabels';
import {useString} from '../utils/useString';

const JOIN_CHANNEL_PHRASE_AND_GET_USER = gql`
  query JoinChannel($passphrase: String!) {
    joinChannel(passphrase: $passphrase) {
      channel
      title
      isHost
      secret
      chat {
        groupId
        userToken
        isGroupOwner
        error {
          code
          message
        }
      }
      secretSalt
      mainUser {
        rtc
        rtm
        uid
      }
      whiteboard {
        room_uuid
        room_token
        error {
          code
          message
        }
      }
      screenShare {
        rtc
        rtm
        uid
      }
      agents {
        id
        is_active
        config {
          llm {
            agent_name
            model
            prompt
          }
          vad {
            threshold
          }
          asr_language
          enable_aivad
          tts {
            vendor
            params {
              ... on TtsVendorParamsMs {
                voice_name
                region
              }
            }
          }
        }
      }
    }
    getUser {
      name
      email
    }
  }
`;

const JOIN_CHANNEL_PHRASE = gql`
  query JoinChannel($passphrase: String!) {
    joinChannel(passphrase: $passphrase) {
      channel
      title
      isHost
      secret
      chat {
        groupId
        userToken
        isGroupOwner
        error {
          code
          message
        }
      }
      secretSalt
      mainUser {
        rtc
        rtm
        uid
      }
      whiteboard {
        room_uuid
        room_token
        error {
          code
          message
        }
      }
      screenShare {
        rtc
        rtm
        uid
      }
      agents {
        id
        is_active
        config {
          llm {
            agent_name
            model
            prompt
          }
          vad {
            threshold
          }
          asr_language
          enable_aivad
          tts {
            vendor
            params {
              ... on TtsVendorParamsMs {
                voice_name
                region
              }
            }
          }
        }
      }
    }
  }
`;
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

  const {client} = useContext(GraphQLContext);
  const username = useGetName();
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
        response = await client.query({
          context: {
            headers: {
              'X-Request-Id': requestId,
              'X-Session-Id': logger.getSessionId(),
            },
          },
          query:
            store.token === null
              ? JOIN_CHANNEL_PHRASE
              : JOIN_CHANNEL_PHRASE_AND_GET_USER,
          variables: {
            passphrase: phrase,
            //userName: username,
          },
        });
      }
      const endReqTs = Date.now();
      const latency = endReqTs - startReqTs;
      if (response?.error) {
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
        if ((response && response.data) || isWaitingRoomEnabled) {
          let data = isWaitingRoomEnabled ? response : response.data;
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

          if (data?.joinChannel?.channel || data?.channel) {
            roomInfo.channel = isWaitingRoomEnabled
              ? data.channel
              : data.joinChannel.channel;
          }
          if (data?.joinChannel?.mainUser?.uid || data?.mainUser?.uid) {
            roomInfo.uid = isWaitingRoomEnabled
              ? data.mainUser.uid
              : data.joinChannel.mainUser.uid;
          }
          if (data?.joinChannel?.mainUser?.rtc || data?.mainUser?.rtc) {
            roomInfo.token = isWaitingRoomEnabled
              ? data.mainUser.rtc
              : data.joinChannel.mainUser.rtc;
          }
          if (data?.joinChannel?.mainUser?.rtm || data?.mainUser?.rtm) {
            roomInfo.rtmToken = isWaitingRoomEnabled
              ? data.mainUser.rtm
              : data.joinChannel.mainUser.rtm;
          }
          if (data?.joinChannel?.secret || data?.secret) {
            roomInfo.encryptionSecret = isWaitingRoomEnabled
              ? data.secret
              : data.joinChannel.secret;
          }
          if (data?.joinChannel?.secretSalt || data?.secretSalt) {
            roomInfo.encryptionSecretSalt = base64ToUint8Array(
              isWaitingRoomEnabled
                ? data.secretSalt
                : data.joinChannel.secretSalt,
            ) as Uint8Array;
          }
          if (data?.joinChannel?.screenShare?.uid || data?.screenShare?.uid) {
            roomInfo.screenShareUid = isWaitingRoomEnabled
              ? data.screenShare.uid
              : data.joinChannel.screenShare.uid;
          }
          if (data?.joinChannel?.screenShare?.rtc || data?.screenShare?.rtc) {
            roomInfo.screenShareToken = isWaitingRoomEnabled
              ? data.screenShare.rtc
              : data.joinChannel.screenShare.rtc;
          }

          if (data?.joinChannel?.mainUser?.rtm || data?.mainUser?.rtm) {
            roomInfo.rtmToken = isWaitingRoomEnabled
              ? data.mainUser.rtm
              : data.joinChannel.mainUser.rtm;
          }
          if (data?.joinChannel?.chat || data?.chat) {
            const chatData = isWaitingRoomEnabled
              ? data.chat
              : data?.joinChannel?.chat;
            const hasError = chatData?.error?.code || chatData?.error?.message;  
            const missingUserToken =
            !(
              isWaitingRoomEnabled
                ? data.chat?.userToken
                : data?.joinChannel?.chat?.userToken
            );
            if (
              $config.CHAT &&
              (hasError || missingUserToken)
            ) {
              roomInfo.chat = {
                user_token: '',
                group_id: '',
                is_group_owner: false,
                error: {
                  code: chatData?.error?.code || (missingUserToken ? 'NO_USER_TOKEN' : ''),
                  message: chatData?.error?.message ||
                  (missingUserToken ? chatErrorNoTokenText : ''),
                },
              };
            } else {
              const chat: RoomInfoContextInterface['data']['chat'] = {
                user_token: isWaitingRoomEnabled
                  ? data.chat.userToken
                  : data?.joinChannel?.chat?.userToken,
                group_id: isWaitingRoomEnabled
                  ? data.chat.groupId
                  : data?.joinChannel?.chat?.groupId,
                is_group_owner: isWaitingRoomEnabled
                  ? data.chat.isGroupOwner
                  : data?.joinChannel?.chat?.isGroupOwner,
                error:  null,
              };
              roomInfo.chat = chat;
            }
          }

          roomInfo.isHost = isWaitingRoomEnabled
            ? data.isHost
            : data.joinChannel.isHost;

          if (data?.joinChannel?.title || data?.title) {
            roomInfo.meetingTitle = isWaitingRoomEnabled
              ? data.title
              : data.joinChannel.title;
          }
          if (data?.joinChannel?.whiteboard || data?.whiteboard) {
            const whiteboardData = isWaitingRoomEnabled
              ? data.whiteboard
              : data?.joinChannel?.whiteboard;
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
                  room_token: isWaitingRoomEnabled
                    ? data.whiteboard.room_token
                    : data?.joinChannel?.whiteboard?.room_token,
                  room_uuid: isWaitingRoomEnabled
                    ? data.whiteboard.room_uuid
                    : data?.joinChannel?.whiteboard?.room_uuid,
                  error: null,
                };
              if (whiteboard?.room_token && whiteboard?.room_uuid) {
                roomInfo.whiteboard = whiteboard;
              }
            }
          }

          //set the ai agent data
          if ($config.ENABLE_CONVERSATIONAL_AI) {
            roomInfo.agents = data?.joinChannel?.agents;
          }

          //getUser is not available from backend
          // if (data?.getUser?.name) {
          //   roomInfo.username = data.getUser.name;
          // }
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
