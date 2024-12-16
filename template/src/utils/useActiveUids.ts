import {useUserPreference} from '../components/useUserPreference';

export function useActiveUids() {
  const {uids} = useUserPreference();
  return uids;
}
