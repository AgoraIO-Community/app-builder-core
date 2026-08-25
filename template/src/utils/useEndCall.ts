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

    // stopping foreground servie on end call
    stopForegroundService();

    let nativeStopPromise: Promise<void> | undefined;
    const stopNativeSTTOnce = (): Promise<void> => {
      if (!nativeStopPromise) {
        nativeStopPromise = stopSTTBotSession().catch(error => {
          nativeStopPromise = undefined;
          throw error;
        });
      }
      return nativeStopPromise;
    };
    const stopSTT = isWebCall ? stopSTTBotSession : stopNativeSTTOnce;

    try {
      await cleanupSTTSessionOnEnd(
        rtcProps.channel,
        String(localUid),
        isSTTActive,
        stopSTT,
      );
    } catch (error) {
      console.error(
        `Failed to clean up the ${isWebCall ? 'web' : 'native'} STT session ID`,
        error,
      );
      if (!isWebCall && isSTTActive) {
        const usersInCall = Object.entries(defaultContent).filter(
          item =>
            item[1].type === 'rtc' &&
            item[1].isHost === 'true' &&
            !item[1].offline,
        );
        if (usersInCall.length === 1) {
          try {
            await stopNativeSTTOnce();
          } catch (stopError) {
            console.error(
              'Failed to stop native STT during fallback',
              stopError,
            );
          }
        }
      }
    }

    // removing user from chat server
    if ($config.CHAT) {
      deleteChatUser();
    }
    try {
      await RTMEngine.getInstance().engine.unsubscribe(rtcProps.channel);
    } catch (error) {
      console.error('Failed to unsubscribe from the RTM channel', error);
    }
    scheduleEndCall();
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
