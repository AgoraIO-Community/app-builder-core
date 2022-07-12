import {useContext} from 'react';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import {UidType} from '../../agora-rn-uikit';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import useIsPSTN from './isPSTNUser';

const useRemoteEndCall = () => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  const {isHost} = useMeetingInfo();
  const isPSTN = useIsPSTN();
  return (uid: UidType) => {
    if (isHost) {
      if (!isPSTN(uid)) {
        sendControlMessageToUid(controlMessageEnum.kickUser, uid);
      }
    } else {
      console.error('A host can only remove the audience from the call.');
    }
  };
};
export default useRemoteEndCall;
