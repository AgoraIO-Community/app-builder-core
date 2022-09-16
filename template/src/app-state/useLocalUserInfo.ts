import {useLocalUid} from '../../agora-rn-uikit';
import {useRender} from 'customization-api';

export const useLocalUserInfo = () => {
  const localUid = useLocalUid();
  const {renderList} = useRender();
  return renderList[localUid];
};
