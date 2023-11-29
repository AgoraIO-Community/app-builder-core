import {useLocalUserInfo} from 'customization-api';
import hark from 'hark';
import {useEffect, useRef, useState} from 'react';

const useIsLocalUserSpeaking = () => {
  const log: (arg1: string, ...args: any[]) => void = (arg1, ...args) => {
    console.log('[ActiveSpeaker]' + arg1, ...args);
  };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const {audio} = useLocalUserInfo();
  const speechRef = useRef(null);
  const audioRef = useRef(audio);
  const audioTrackRef = useRef(null);

  useEffect(() => {
    audioRef.current = audio;
    /**
     * if user mute the mic while speaking then stoppedSpeakingCallBack won't be executed because of if (audioRef.current) condition
     * so if audio is muted then set speaking as false
     */
    if (!audio) {
      setIsSpeaking(false);
    }
  }, [audio]);

  const speakingCallBack = () => {
    if (audioRef.current) {
      setIsSpeaking(true);
    }
  };
  const stoppedSpeakingCallBack = () => {
    if (audioRef.current) {
      setIsSpeaking(false);
    }
  };

  const listenForSpeaker = () => {
    try {
      if (speechRef.current) {
        speechRef.current?.stop && speechRef.current?.stop();
      }
    } catch (error) {
      log(' Error on stopping the hark', error);
    }

    try {
      //detect local user speaking or not
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(audioStream => {
          audioTrackRef.current = audioStream.getAudioTracks();
          speechRef.current = null;
          speechRef.current = hark(audioStream, {
            interval: 100,
          });
          speechRef.current.on('speaking', speakingCallBack);
          speechRef.current.on('stopped_speaking', stoppedSpeakingCallBack);
        });
    } catch (error) {
      log(' Error on starting the hark', error);
    }
  };

  useEffect(() => {
    if ($config.ACTIVE_SPEAKER) {
      navigator.mediaDevices.ondevicechange = () => {
        log(' ondevicechange called');
        listenForSpeaker();
      };
      listenForSpeaker();
      return () => {
        speechRef.current && speechRef.current.stop();
        audioTrackRef.current &&
          audioTrackRef.current?.length &&
          audioTrackRef.current[0].stop();
        navigator.mediaDevices.ondevicechange = () => {};
      };
    }
  }, []);

  return isSpeaking;
};
export default useIsLocalUserSpeaking;
