import React from 'react';
import {useParams} from './Router';
import {gql, useQuery} from '@apollo/client';

const JOIN_CHANNEL_PHRASE = gql`
  query JoinChannelWithPassphrase($passphrase: String!) {
    joinChannelWithPassphrase(passphrase: $passphrase) {
      channel
      isHost
      rtc
      rtm
      uid
    }
  }
`;

const JoinPhrase = () => {
  const {phrase} = useParams();
  const {data, loading} = useQuery(JOIN_CHANNEL_PHRASE, {
    variables: {
      passphrase: phrase,
    },
  });

  return <></>;
};

export default JoinPhrase;
