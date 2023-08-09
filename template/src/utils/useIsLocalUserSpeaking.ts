import {useLocalUserInfo} from 'customization-api';
import hark from 'hark';
import {useEffect, useRef, useState} from 'react';

const useIsLocalUserSpeaking = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const {audio} = useLocalUserInfo();
  const speechRef = useRef(null);
  const audioRef = useRef(audio);

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

  useEffect(() => {
    try {
      //detect local user speaking or not
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((audioStream) => {
          speechRef.current = hark(audioStream, {interval: 100});
          speechRef.current.on('speaking', speakingCallBack);
          speechRef.current.on('stopped_speaking', stoppedSpeakingCallBack);
        });
    } catch (error) {}
  }, []);

  return isSpeaking;
};
export default useIsLocalUserSpeaking;
