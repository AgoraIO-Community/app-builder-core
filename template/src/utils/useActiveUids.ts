import {useRtm} from '../components/ChatContext';

export function useActiveUids() {
  const {rtmActiveUids} = useRtm();
  return rtmActiveUids;
}
