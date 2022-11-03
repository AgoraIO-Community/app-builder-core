import {gql, useMutation} from '@apollo/client';
import {MeetingInfoContextInterface} from '../components/meeting-info/useMeetingInfo';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import SDKEvents from '../utils/SdkEvents';

const CREATE_CHANNEL = gql`
  mutation CreateChannel(
    $title: String!
    $backendURL: String!
    $enablePSTN: Boolean
  ) {
    createChannel(
      title: $title
      backendURL: $backendURL
      enablePSTN: $enablePSTN
    ) {
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
export default function useCreateMeeting() {
  const [createChannel, {error}] = useMutation(CREATE_CHANNEL);
  const {setMeetingInfo} = useSetMeetingInfo();
  return async (
    roomTitle: string,
    enablePSTN?: boolean,
    isSeparateHostLink?: boolean,
  ) => {
    const res = await createChannel({
      variables: {
        title: roomTitle,
        backendURL: $config.BACKEND_ENDPOINT,
        enablePSTN: enablePSTN,
      },
    });
    if (error) {
      throw error;
    }
    if (res && res?.data && res?.data?.createChannel) {
      let meetingInfo: Partial<MeetingInfoContextInterface['data']> = {
        roomId: {
          attendee: '',
        },
      };
      if (res?.data?.createChannel?.passphrase?.view) {
        meetingInfo.roomId.attendee = res.data.createChannel.passphrase.view;
      }
      if (res?.data?.createChannel?.passphrase?.host) {
        meetingInfo.roomId.host = res.data.createChannel.passphrase.host;
      }
      if (enablePSTN === true && res?.data?.createChannel?.pstn) {
        meetingInfo.pstn = {
          number: res.data.createChannel.pstn.number,
          pin: res.data.createChannel.pstn.dtmf,
        };
      }
      setMeetingInfo({
        data: {
          isHost: true,
          isSeparateHostLink: isSeparateHostLink ? true : false,
          meetingTitle: roomTitle,
          roomId: meetingInfo?.roomId,
          pstn: meetingInfo?.pstn,
        },
      });
      SDKEvents.emit(
        'create',
        meetingInfo.roomId.host,
        meetingInfo.roomId.attendee,
        meetingInfo?.pstn,
      );
    } else {
      throw new Error(`An error occurred in parsing the channel data.`);
    }
  };
}
