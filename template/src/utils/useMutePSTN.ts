import {gql, useMutation} from '@apollo/client';
import {UidType} from '../../agora-rn-uikit';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import useIsPSTN from './useIsPSTN';
const MUTE_PSTN = gql`
  mutation mutePSTN($uid: Int!, $passphrase: String!, $mute: Boolean!) {
    mutePSTN(uid: $uid, passphrase: $passphrase, mute: $mute) {
      uid
      mute
    }
  }
`;

const useMutePSTN = () => {
  const [mutePSTN, {data, loading, error}] = useMutation(MUTE_PSTN);
  const {
    data: {isHost, roomId},
  } = useMeetingInfo();
  const isPSTN = useIsPSTN();
  return async (uid: UidType) => {
    if (isHost) {
      if (isPSTN(uid)) {
        await mutePSTN({
          variables: {
            uid: uid,
            passphrase: roomId?.host,
            //todo: hari need to test mute flag for PSTN
            mute: 1,
          },
        });
      } else {
        console.error('UID does not belong to the PSTN user.');
      }
      if (!loading && error) {
        throw error;
      } else {
        return data;
      }
    } else {
      console.error('A host can only mute audience audio or video.');
    }
  };
};

export default useMutePSTN;
