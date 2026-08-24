import {useContext} from 'react';
import {useCustomization} from 'customization-implementation';
import {useCaption, useContent, useRoomInfo} from 'customization-api';
import {PropsContext, DispatchContext, useLocalUid} from '../../agora-rn-uikit';
import {useHistory} from '../components/Router';
import {stopForegroundService} from '../subComponents/LocalEndCall';
import RTMEngine from '../rtm/RTMEngine';
import {ENABLE_AUTH} from '../auth/config';
import {useAuth} from '../auth/AuthProvider';
import {useChatConfigure} from '../components/chat/chatConfigure';
import {isWebInternal} from './common';
import {cleanupSTTSessionOnEnd} from '../subComponents/caption/sttSessionId';

const useEndCall = () => {
  const history = useHistory();
  const {defaultContent} = useContent();
  const {isSTTActive, stopSTTBotSession} = useCaption();
  const {
    data: {isHost},
  } = useRoomInfo();
  const {authLogin} = useAuth();
  const {deleteChatUser} = useChatConfigure();

  const {rtcProps} = useContext(PropsContext);
  const {dispatch} = useContext(DispatchContext);
  const localUid = useLocalUid();

  const beforeEndCall = useCustomization(
    data =>
      data?.lifecycle?.useBeforeEndCall && data?.lifecycle?.useBeforeEndCall(),
  );
  const afterEndCall = useCustomization(
    data =>
      data?.lifecycle?.useAfterEndCall && data?.lifecycle?.useAfterEndCall(),
  );

  return async () => {
    try {
      beforeEndCall &&
        (await beforeEndCall(isHost, history as unknown as History));
    } catch (error) {
      console.log('debugging error on beforeEndCall', error);
    }

    const scheduleEndCall = () => {
      setTimeout(() => {
        dispatch({
          type: 'EndCall',
          value: [],
        });
      });
    };
    const isWebCall = isWebInternal();

    // Preserve native dispatch timing. Web dispatches after RTM cleanup.
    if (!isWebCall) {
      scheduleEndCall();
    }
    // stopping foreground servie on end call
    stopForegroundService();

    if (isWebCall) {
      try {
        await cleanupSTTSessionOnEnd(
          rtcProps.channel,
          String(localUid),
          isSTTActive,
          stopSTTBotSession,
        );
      } catch (error) {
        console.error('Failed to clean up the web STT session ID', error);
      }
    } else {
      // stopping STT on call end,if only last user is remaining in call
      const usersInCall = Object.entries(defaultContent).filter(
        item =>
          item[1].type === 'rtc' &&
          item[1].isHost === 'true' &&
          !item[1].offline,
      );
      if (usersInCall.length === 1 && isSTTActive) {
        console.log('Stopping stt api as only one host is in the call');
        stopSTTBotSession().catch(error => {
          console.log('Error stopping stt', error);
        });
      }
    }

    // removing user from chat server
    if ($config.CHAT) {
      deleteChatUser();
    }
    if (isWebCall) {
      try {
        await RTMEngine.getInstance().engine.unsubscribe(rtcProps.channel);
      } catch (error) {
        console.error('Failed to unsubscribe from the RTM channel', error);
      }
      scheduleEndCall();
    } else {
      RTMEngine.getInstance().engine.unsubscribe(rtcProps.channel);
    }
    if (!ENABLE_AUTH) {
      // await authLogout();
      await authLogin();
    }

    try {
      afterEndCall &&
        (await afterEndCall(isHost, history as unknown as History));
    } catch (error) {
      console.log('debugging error on afterEndCall', error);
    }
  };
};

export default useEndCall;
