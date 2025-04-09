import {controlMessageEnum} from '../components/ChatContext';
import {useRoomInfo} from '../components/room-info/useRoomInfo';
import useIsPSTN from './useIsPSTN';
import {UidType} from '../../agora-rn-uikit';
import events, {PersistanceLevel} from '../rtm-events-api';
import SDKEvents from './SdkEvents';

/**
 * Returns a function to end the call for a remote user with the given uid.
 */
const useRemoteEndCall = () => {
  const {
    data: {isHost, channel},
  } = useRoomInfo();
  const isPSTN = useIsPSTN();

  return (uid: UidType) => {
    if (isHost && uid) {
      if (!isPSTN(uid)) {
        events.send(
          controlMessageEnum.kickUser,
          '',
          PersistanceLevel.None,
          uid,
        );
        // Also Send the SDK event for wrapper app to add extra functinalities like banning user;
        SDKEvents.emit('rtc-user-removed', uid, channel);
      }
    } else {
      console.error('A host can only remove the audience from the call.');
    }
  };
};
export default useRemoteEndCall;
