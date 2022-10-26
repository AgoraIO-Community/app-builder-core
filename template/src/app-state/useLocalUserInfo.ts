import {useLocalUid} from '../../agora-rn-uikit';
import {useRender} from 'customization-api';

/**
 * The LocalUserInfo app state contains the local user information like uid, audio and video mute states etc.
 */
export const useLocalUserInfo = () => {
  const localUid = useLocalUid();
  const {renderList} = useRender();
  return renderList[localUid];
};
