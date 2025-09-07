import {useContext} from 'react';
import {useHistory, useParams} from '../../../components/Router';
import {useCaption, useContent, useSTTAPI} from 'customization-api';

const useBreakoutRoomExit = (handleLeaveBreakout?: () => void) => {
  const history = useHistory();
  const {phrase} = useParams<{phrase: string}>();
  const {defaultContent} = useContent();
  const {stop: stopSTTAPI} = useSTTAPI();
  const {isSTTActive} = useCaption();

  return async () => {
    try {
      // stopping STT on call end,if only last user is remaining in call
      const usersInCall = Object.entries(defaultContent).filter(
        item =>
          item[1].type === 'rtc' &&
          item[1].isHost === 'true' &&
          !item[1].offline,
      );
      if (usersInCall.length === 1 && isSTTActive) {
        console.log('Stopping stt api as only one host is in the call');
        stopSTTAPI().catch(error => {
          console.log('Error stopping stt', error);
        });
      }

      // Trigger exit transition if callback provided
      if (handleLeaveBreakout) {
        console.log('Triggering breakout room exit transition');
        handleLeaveBreakout();
      } else {
        // Fallback: Navigate directly if no transition callback
        history.push(`/${phrase}`);
      }
    } catch (error) {
      // Fallback navigation on error
      if (handleLeaveBreakout) {
        handleLeaveBreakout();
      } else {
        history.push(`/${phrase}`);
      }

      throw error; // Re-throw so caller can handle
    }
  };
};

export default useBreakoutRoomExit;
