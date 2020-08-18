import React, {useContext} from 'react';
import {useParams} from './Router';
import SessionContext from './SessionContext';
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
  const joinFlag = 1;
  const {joinSession} = useContext(SessionContext);
  console.log({phrase});
  let {data, loading, error} = useQuery(JOIN_CHANNEL_PHRASE, {
    variables: {passphrase: phrase},
  });
  if (!loading && data) {
    joinSession({
      phrase,
      joinFlag,
      channel: data.joinChannelWithPassphrase.channel,
    });
  }
  return <></>;
};

export default JoinPhrase;
