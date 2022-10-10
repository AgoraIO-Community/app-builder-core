import {useContext} from 'react';
import {gql} from '@apollo/client';
import StorageContext from '../components/StorageContext';
import {MeetingInfoContextInterface} from '../components/meeting-info/useMeetingInfo';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
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
export default function useJoinMeeting() {
  const {store} = useContext(StorageContext);
  const {setMeetingInfo} = useSetMeetingInfo();
  const {client} = useContext(GraphQLContext);
  return async (phrase: string) => {
    setMeetingInfo((prevState) => {
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
          let meetingInfo: Partial<MeetingInfoContextInterface['data']> = {};
          if (data?.joinChannel?.channel) {
            meetingInfo.channel = data.joinChannel.channel;
          }
          if (data?.joinChannel?.mainUser?.uid) {
            meetingInfo.uid = data.joinChannel.mainUser.uid;
          }
          if (data?.joinChannel?.mainUser?.rtc) {
            meetingInfo.token = data.joinChannel.mainUser.rtc;
          }
          if (data?.joinChannel?.mainUser?.rtm) {
            meetingInfo.rtmToken = data.joinChannel.mainUser.rtm;
          }
          if (data?.joinChannel?.secret) {
            meetingInfo.encryptionSecret = data.joinChannel.secret;
          }
          if (data?.joinChannel?.screenShare?.uid) {
            meetingInfo.screenShareUid = data.joinChannel.screenShare.uid;
          }
          if (data?.joinChannel?.screenShare?.rtc) {
            meetingInfo.screenShareToken = data.joinChannel.screenShare.rtc;
          }
          if (data?.joinChannel?.isHost) {
            meetingInfo.isHost = data.joinChannel.isHost;
          }
          if (data?.joinChannel?.title) {
            meetingInfo.meetingTitle = data.joinChannel.title;
          }
          //getUser is not available from backend
          // if (data?.getUser?.name) {
          //   meetingInfo.username = data.getUser.name;
          // }
          setMeetingInfo((prevState) => {
            return {
              ...prevState,
              isJoinDataFetched: true,
              data: {
                ...prevState.data,
                ...meetingInfo,
              },
            };
          });
        } else {
          throw new Error('An error occurred in parsing the channel data.');
        }
      }
    } catch (error) {
      throw error;
    }
  };
}
