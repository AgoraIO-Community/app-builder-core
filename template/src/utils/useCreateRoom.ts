import {gql, useMutation} from '@apollo/client';
import {RoomInfoContextInterface} from '../components/room-info/useRoomInfo';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import SDKEvents from '../utils/SdkEvents';
import isSDK from './isSDK';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from './getUniqueID';

const CREATE_CHANNEL = gql`
  mutation CreateChannel($title: String!, $enablePSTN: Boolean) {
    createChannel(title: $title, enablePSTN: $enablePSTN) {
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
/**
 * Returns an asynchronous function to create a meeting with the given options.
 */
export type createRoomFun = (
  roomTitle: string,
  enablePSTN?: boolean,
) => Promise<void>;
export default function useCreateRoom(): createRoomFun {
  const [createChannel, {error}] = useMutation(CREATE_CHANNEL);
  const {setRoomInfo} = useSetRoomInfo();
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
    const res = await createChannel({
      context: {
        headers: {
          'X-Request-Id': requestId,
        },
      },
      variables: {
        title: roomTitle,
        enablePSTN: enablePSTN,
      },
    });
    const endReqTs = Date.now();
    const latency = endReqTs - startReqTs;
    // in React-SDK mode, we use a more recent package of @apollo/client
    // which is compatible with react18, long term we should be looking to
    // upgrade core dependency as well. The following condition accounts
    // for differences in the way the two version function.
    if (error && !isSDK) {
      logger.error(
        LogSource.NetworkRest,
        'createChannel',
        'API createChannel failed. There was an error',
        error,
        {startReqTs, endReqTs, latency: latency, requestId},
      );
      throw error;
    }

    if (res && res?.data && res?.data?.createChannel) {
      logger.log(
        LogSource.NetworkRest,
        'createChannel',
        'API createChannel. Channel created successfully',
        {
          responseData: res.data.createChannel,
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
      if (res?.data?.createChannel?.passphrase?.view) {
        roomInfo.roomId.attendee = res.data.createChannel.passphrase.view;
      }
      if (res?.data?.createChannel?.passphrase?.host) {
        roomInfo.roomId.host = res.data.createChannel.passphrase.host;
      }
      if (enablePSTN === true && res?.data?.createChannel?.pstn) {
        roomInfo.pstn = {
          number: res.data.createChannel.pstn.number,
          pin: res.data.createChannel.pstn.dtmf,
        };
      }
      logger.log(LogSource.Internals, 'CREATE_MEETING', 'Room created', {
        isHost: true,
        isSeparateHostLink: isSeparateHostLink ? true : false,
        meetingTitle: roomTitle,
        roomId: roomInfo?.roomId,
        pstn: roomInfo?.pstn,
      });
      setRoomInfo({
        data: {
          isHost: true,
          isSeparateHostLink: isSeparateHostLink ? true : false,
          meetingTitle: roomTitle,
          roomId: roomInfo?.roomId,
          pstn: roomInfo?.pstn,
        },
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
  };
}
