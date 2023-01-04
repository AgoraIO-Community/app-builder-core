import {controlMessageEnum} from '../components/ChatContext';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import {UidType} from '../../agora-rn-uikit';
import events, {EventPersistLevel} from '../rtm-events-api';

/**
 * Returns a function to end the screenshare for a remote user with the given uid.
 */
const useRemoteEndScreenshare = () => {
  const {
    data: {isHost},
  } = useMeetingInfo();
  return (uid: UidType) => {
    if (isHost && uid) {
      events.send(
        controlMessageEnum.kickScreenshare,
        '',
        EventPersistLevel.LEVEL1,
        uid,
      );
    } else {
      console.error('A host can only remove the screenshare from the call.');
    }
  };
};
export default useRemoteEndScreenshare;
