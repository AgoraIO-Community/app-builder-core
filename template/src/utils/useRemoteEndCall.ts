import {controlMessageEnum} from '../components/ChatContext';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import useIsPSTN from './isPSTNUser';
import {UidType} from '../../agora-rn-uikit';
import events, {EventPersistLevel} from '../rtm-events-api';

const useRemoteEndCall = () => {
  const {isHost} = useMeetingInfo();
  const isPSTN = useIsPSTN();

  return (uid: UidType) => {
    if (isHost && uid) {
      if (!isPSTN(uid)) {
        events.send(
          controlMessageEnum.kickUser,
          '',
          EventPersistLevel.LEVEL1,
          uid,
        );
      }
    } else {
      console.error('A host can only remove the audience from the call.');
    }
  };
};
export default useRemoteEndCall;
