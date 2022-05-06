import {gql, useMutation} from '@apollo/client';
import {MeetingInfoContextInterface} from '../components/meeting-info/useMeetingInfo';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';

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
      let meetingInfoPassPhrase: MeetingInfoContextInterface['meetingPassphrase'] =
        {
          attendee: '',
        };
      if (res?.data?.createChannel?.passphrase?.view) {
        meetingInfoPassPhrase.attendee = res.data.createChannel.passphrase.view;
      }
      if (res?.data?.createChannel?.passphrase?.host) {
        meetingInfoPassPhrase.host = res.data.createChannel.passphrase.host;
      }
      if (enablePSTN === true && res?.data?.createChannel?.pstn) {
        meetingInfoPassPhrase.pstn = {
          number: res.data.createChannel.pstn.number,
          pin: res.data.createChannel.pstn.dtmf,
        };
      }
      setMeetingInfo({
        isHost: true,
        isSeparateHostLink: isSeparateHostLink ? true : false,
        meetingTitle: roomTitle,
        meetingPassphrase: meetingInfoPassPhrase,
      });
    } else {
      throw new Error(`An error occurred in parsing the channel data.`);
    }
  };
}
