import {useContext} from 'react';
import {gql} from '@apollo/client';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {GraphQLContext} from '../components/GraphQLProvider';
import getUniqueID from './getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';

const SHARE = gql`
  query share($passphrase: String!) {
    share(passphrase: $passphrase) {
      passphrase {
        host
        view
      }
      channel
      title
      pstn {
        number
        dtmf
      }
    }
  }
`;

export default function useGetMeetingPhrase() {
  const {setRoomInfo} = useSetRoomInfo();
  const {client} = useContext(GraphQLContext);
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
    const response = await client.query({
      context: {
        headers: {
          'X-Request-Id': requestId,
        },
      },
      query: SHARE,
      variables: {
        passphrase: phrase,
      },
    });
    const endReqTs = Date.now();
    if (response.error) {
      logger.error(
        LogSource.Internals,
        'GET_MEETING_PHRASE',
        'Query GET_MEETING_PHRASE failed',
        response.error,
        {
          requestId,
          startReqTs,
          endReqTs,
          latency: endReqTs - startReqTs,
        },
      );
      throw response.error;
    } else {
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
        if (response && response.data) {
          let data = response.data;
          let roomInfo: Partial<RoomInfoContextInterface['data']> = {
            roomId: {attendee: ''},
          };
          if (data?.share?.passphrase?.view) {
            roomInfo.roomId.attendee = data.share.passphrase.view;
          }
          if (data?.share?.passphrase?.host) {
            roomInfo.roomId.host = data.share.passphrase.host;
          }
          if (data?.share?.pstn) {
            roomInfo.pstn = {
              number: data.share.pstn.number,
              pin: data.share.pstn.dtmf,
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
  };
}
