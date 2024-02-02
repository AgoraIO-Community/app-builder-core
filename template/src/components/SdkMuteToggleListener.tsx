import React, {useContext, useEffect, createContext, useRef} from 'react';
import {SdkApiContext} from './SdkApiContext';
import {
  useMuteToggleLocal,
  useLocalUserInfo,
  ToggleState,
  MUTE_LOCAL_TYPE,
  useRtc,
} from 'customization-api';
import isSDK from '../utils/isSDK';
import {WebRtcEngineInstance} from '../../bridge/rtc/webNg/RtcEngine';

export const SdkMuteQueueContext = createContext({
  videoMuteQueue: {current: []},
  audioMuteQueue: {current: []},
});

const SdkMuteToggleListener = (props) => {
  const videoMuteQueue = useRef([]);
  const audioMuteQueue = useRef([]);
  const {RtcEngine} = useRtc();

  const {
    onMuteVideo: onSdkMuteVideo,
    onMuteAudio: onSdkMuteAudio,
    muteAllParticipants,
    setMuteAllParticipantsListenerReady,
    clearState,
  } = useContext(SdkApiContext);
  const local = useLocalUserInfo();
  const toggleMute = useMuteToggleLocal();

  useEffect(() => {
    if (isSDK()) {
      // Casting to web only engine object
      const RtcBridgeEngine = RtcEngine as unknown as WebRtcEngineInstance;
      setMuteAllParticipantsListenerReady(true);
      if (
        RtcBridgeEngine.muteParticipantStreams !== muteAllParticipants.state
      ) {
        RtcBridgeEngine.muteParticipantStreams = muteAllParticipants.state;
        try {
          RtcBridgeEngine.remoteStreams.forEach((stream) => {
            if (muteAllParticipants.state) {
              if (stream?.audio?.isPlaying) {
                stream?.audio?.stop();
              }
            } else {
              if (!stream?.audio?.isPlaying) {
                stream?.audio?.play();
              }
            }
          });
          muteAllParticipants.promise?.res();
        } catch (error) {
          muteAllParticipants.promise?.rej(error);
        } finally {
          clearState('muteAllParticipants');
        }
      }
    }
    return () => {
      isSDK() && setMuteAllParticipantsListenerReady(false);
    };
  }, [muteAllParticipants]);

  const queuedToggleMute = (type, status) => {
    const localstatus =
      local[type === MUTE_LOCAL_TYPE.video ? 'video' : 'audio'];

    // if ([ToggleState.enabling, ToggleState.disabling].includes(localstatus)) {
    // if ({[ToggleState.enabling]: true, [ToggleState.disabling]: true}[localstatus]) {
    if (
      ToggleState.enabling === localstatus ||
      ToggleState.disabling === localstatus
    ) {
      return new Promise((res, rej) => {
        if (type === MUTE_LOCAL_TYPE.video) {
          videoMuteQueue.current.push({
            resolveQueued: res,
            rejectQueued: rej,
            action: status ? ToggleState.disabled : ToggleState.enabled,
          });
        } else {
          audioMuteQueue.current.push({
            resolveQueued: res,
            rejectQueued: rej,
            action: status ? ToggleState.disabled : ToggleState.enabled,
          });
        }
      });
    } else
      return toggleMute(
        type,
        status ? ToggleState.disabled : ToggleState.enabled,
      );
  };

  useEffect(() => {
    onSdkMuteVideo(async (res, rej, mute) => {
      const status = typeof mute === 'function' ? mute(!local.video) : mute;
      try {
        await queuedToggleMute(MUTE_LOCAL_TYPE.video, status);
        res();
      } catch (e) {
        rej(e);
      }
    });
    onSdkMuteAudio(async (res, rej, mute) => {
      const status = typeof mute === 'function' ? mute(!local.audio) : mute;
      try {
        await queuedToggleMute(MUTE_LOCAL_TYPE.audio, status);
        res();
      } catch (e) {
        rej(e);
      }
    });

    return () => {
      clearState('muteVideo');
      clearState('muteAudio');
    };
  }, [local]);

  return (
    <SdkMuteQueueContext.Provider value={{videoMuteQueue, audioMuteQueue}}>
      {props.children}
    </SdkMuteQueueContext.Provider>
  );
};

export default SdkMuteToggleListener;
