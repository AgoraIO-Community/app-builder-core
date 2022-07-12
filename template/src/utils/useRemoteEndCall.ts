import {controlMessageEnum} from '../components/ChatContext';
import {UidType} from '../../agora-rn-uikit';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import useIsPSTN from './isPSTNUser';
import useSendControlMessage, {
  CONTROL_MESSAGE_TYPE,
} from '../utils/useSendControlMessage';

const useRemoteEndCall = () => {
  const sendCtrlMsgToUid = useSendControlMessage();
  const {isHost} = useMeetingInfo();
  const isPSTN = useIsPSTN();
  return (uid: UidType) => {
    if (isHost) {
      if (!isPSTN(uid)) {
        sendCtrlMsgToUid(
          CONTROL_MESSAGE_TYPE.controlMessageToUid,
          controlMessageEnum.kickUser,
          uid,
        );
      }
    } else {
      console.error('A host can only remove the audience from the call.');
    }
  };
};
export default useRemoteEndCall;
