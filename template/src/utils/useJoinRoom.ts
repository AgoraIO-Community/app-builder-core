import {useContext} from 'react';
import {gql} from '@apollo/client';
import StorageContext from '../components/StorageContext';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {GraphQLContext} from '../components/GraphQLProvider';

const JOIN_CHANNEL_PHRASE_AND_GET_USER = gql`
  query JoinChannel($passphrase: String!) {
    joinChannel(passphrase: $passphrase) {
      channel
      title
      isHost
      secret
      mainUser {
        rtc
        rtm
        uid
      }
      screenShare {
        rtc
        rtm
        uid
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
      mainUser {
        rtc
        rtm
        uid
      }
      screenShare {
        rtc
        rtm
        uid
      }
    }
  }
`;
/**
 * Returns an asynchronous function to join a meeting with the given phrase.
 */
export default function useJoinRoom() {
  const {store} = useContext(StorageContext);
  const {setRoomInfo} = useSetRoomInfo();
  const {client} = useContext(GraphQLContext);
  return async (phrase: string) => {
    setRoomInfo((prevState) => {
      return {
        ...prevState,
        isJoinDataFetched: false,
      };
    });
    try {
      const response = await client.query({
        query:
          store.token === null
            ? JOIN_CHANNEL_PHRASE
            : JOIN_CHANNEL_PHRASE_AND_GET_USER,
        variables: {
          passphrase: phrase,
        },
      });
      if (response.error) {
        throw response.error;
      } else {
        if (response && response.data) {
          let data = response.data;
          let roomInfo: Partial<RoomInfoContextInterface['data']> = {};
          if (data?.joinChannel?.channel) {
            roomInfo.channel = data.joinChannel.channel;
          }
          if (data?.joinChannel?.mainUser?.uid) {
            roomInfo.uid = data.joinChannel.mainUser.uid;
          }
          if (data?.joinChannel?.mainUser?.rtc) {
            roomInfo.token = data.joinChannel.mainUser.rtc;
          }
          if (data?.joinChannel?.mainUser?.rtm) {
            roomInfo.rtmToken = data.joinChannel.mainUser.rtm;
          }
          if (data?.joinChannel?.secret) {
            roomInfo.encryptionSecret = data.joinChannel.secret;
          }
          if (data?.joinChannel?.screenShare?.uid) {
            roomInfo.screenShareUid = data.joinChannel.screenShare.uid;
          }
          if (data?.joinChannel?.screenShare?.rtc) {
            roomInfo.screenShareToken = data.joinChannel.screenShare.rtc;
          }
          if (data?.joinChannel?.isHost) {
            roomInfo.isHost = data.joinChannel.isHost;
          }
          if (data?.joinChannel?.title) {
            roomInfo.meetingTitle = data.joinChannel.title;
          }
          //getUser is not available from backend
          // if (data?.getUser?.name) {
          //   roomInfo.username = data.getUser.name;
          // }
          console.log('!!!!!Meetinginfo', {
            roomInfo,
            response: response.data,
          });
          setRoomInfo((prevState) => {
            let compiledMeetingInfo = {
              ...prevState.data,
              ...roomInfo,
            };
            return {
              ...prevState,
              isJoinDataFetched: true,
              data: compiledMeetingInfo,
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
