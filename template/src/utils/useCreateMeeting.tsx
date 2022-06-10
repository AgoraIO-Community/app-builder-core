import {gql, useMutation} from '@apollo/client';

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
export interface CreateMeetingDataInterface {
  hostPassphrase?: string;
  attendeePassphrase: string;
  pstn?: {
    number: string;
    dtmf: string;
  };
}
export default function useCreateMeeting() {
  const [createChannel, {error}] = useMutation(CREATE_CHANNEL);
  return async (roomTitle: string, enablePSTN?: boolean) => {
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
      let returnData: CreateMeetingDataInterface = {
        attendeePassphrase: '',
      };
      if (res?.data?.createChannel?.passphrase) {
        returnData.hostPassphrase = res.data.createChannel.passphrase.host;
        returnData.attendeePassphrase = res.data.createChannel.passphrase.view;
      }
      if (enablePSTN === true && res?.data?.createChannel?.pstn) {
        returnData.pstn = {
          number: res.data.createChannel.pstn.number,
          dtmf: res.data.createChannel.pstn.dtmf,
        };
      }
      return returnData;
    } else {
      throw new Error(`An error occurred in parsing the channel data.`);
    }
  };
}
