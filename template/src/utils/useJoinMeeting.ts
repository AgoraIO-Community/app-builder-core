import {useContext} from 'react';
import SessionContext from '../components/SessionContext';

export default function useJoinMeeting() {
  const {joinSession} = useContext(SessionContext);
  return (joinPhrase: string) => {
    joinSession({phrase: joinPhrase});
  };
}
