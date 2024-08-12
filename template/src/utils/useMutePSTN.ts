import {gql, useMutation} from '@apollo/client';
import {UidType} from '../../agora-rn-uikit';
import {useRoomInfo} from '../components/room-info/useRoomInfo';
import useIsPSTN from './useIsPSTN';
import getUniqueID from './getUniqueID';
import {LogSource, logger} from '../logger/AppBuilderLogger';
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
  } = useRoomInfo();
  const isPSTN = useIsPSTN();
  return async (uid: UidType) => {
    const startReqTs = Date.now();
    const requestId = getUniqueID();
    if (isHost) {
      if (isPSTN(uid)) {
        logger.log(
          LogSource.Internals,
          'MUTE_PSTN',
          'Mutation try to call MUTE_PSTN ',
          {startReqTs, requestId},
        );
        await mutePSTN({
          context: {
            headers: {
              'X-Request-Id': requestId,
            },
          },
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
        const endReqTs = Date.now();
        logger.error(
          LogSource.Internals,
          'MUTE_PSTN',
          'Mutation MUTE_PSTN success',
          error,
          {startReqTs, endReqTs, latency: endReqTs - startReqTs, requestId},
        );
        throw error;
      } else {
        const endReqTs = Date.now();
        logger.log(
          LogSource.Internals,
          'MUTE_PSTN',
          'Mutation MUTE_PSTN success',
          {startReqTs, endReqTs, latency: endReqTs - startReqTs, requestId},
        );
        return data;
      }
    } else {
      console.error('A host can only mute audience audio or video.');
    }
  };
};

export default useMutePSTN;
