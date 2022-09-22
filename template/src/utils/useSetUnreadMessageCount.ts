import {UidType} from '../../agora-rn-uikit';
import {useChatNotification} from '../components/chat-notification/useChatNotification';

export enum SET_UNREAD_MESSAGE_COUNT_TYPE {
  setGroupMessageCount,
  setIndividualMessageCount,
}

const useSetUnreadMessageCount = () => {
  const {setUnreadIndividualMessageCount, setUnreadGroupMessageCount} =
    useChatNotification();
  const setUnreadMessageCount = (
    type: SET_UNREAD_MESSAGE_COUNT_TYPE,
    count: number,
    uid?: UidType,
  ) => {
    switch (type) {
      case SET_UNREAD_MESSAGE_COUNT_TYPE.setGroupMessageCount:
        setUnreadGroupMessageCount(count);
        break;
      case SET_UNREAD_MESSAGE_COUNT_TYPE.setIndividualMessageCount:
        if (uid) {
          setUnreadIndividualMessageCount((prevState) => {
            if (prevState && prevState.hasOwnProperty(uid)) {
              return {
                ...prevState,
                [uid]: count,
              };
            } else {
              console.error(`ERROR: Invalid UID`);
              return prevState;
            }
          });
        } else {
          console.error('UID must be passed for setIndividualMessageCount.');
        }
        break;
      default:
        break;
    }
  };
  return setUnreadMessageCount;
};
export default useSetUnreadMessageCount;
