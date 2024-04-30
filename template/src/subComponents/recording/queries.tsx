import {gql} from '@apollo/client';

export const START_RECORDING = gql`
  mutation startRecordingSession(
    $passphrase: String!
    $secret: String
    $config: recordingConfig!
  ) {
    startRecordingSession(
      passphrase: $passphrase
      secret: $secret
      config: $config
    )
  }
`;

export const STOP_RECORDING = gql`
  mutation stopRecordingSession($passphrase: String!) {
    stopRecordingSession(passphrase: $passphrase)
  }
`;
