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

  const listenForSpeaker = () => {
    try {
      if (speechRef.current) {
        speechRef.current?.stop && speechRef.current?.stop();
      }
    } catch (error) {
      console.log('error on stopping the hark', error);
    }

    try {
      //detect local user speaking or not
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((audioStream) => {
          speechRef.current = null;
          speechRef.current = hark(audioStream, {interval: 100});
          speechRef.current.on('speaking', speakingCallBack);
          speechRef.current.on('stopped_speaking', stoppedSpeakingCallBack);
        });
    } catch (error) {
      console.log('error on starting the hark', error);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = (event) => {
      listenForSpeaker();
    };
    listenForSpeaker();
  }, []);

  return isSpeaking;
};
export default useIsLocalUserSpeaking;
