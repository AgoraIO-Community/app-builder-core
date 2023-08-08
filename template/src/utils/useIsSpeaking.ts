import {useLocalUserInfo, useRender, useRtc} from 'customization-api';
import hark from 'hark';
import {useEffect, useRef, useState} from 'react';
import events, {EventPersistLevel} from '../rtm-events-api';

enum volumeEnum {
  IS_SPEAKING = 'IS_SPEAKING',
  SPEAKING_VOLUME = 'SPEAKING_VOLUME',
  NON_SPEAKING_VOLUME = 'NON_SPEAKING_VOLUME',
}
const useIsSpeaking = () => {
  const {RtcEngine} = useRtc();
  const {audio, uid} = useLocalUserInfo();
  const speechRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const setIntervalRef = useRef(null);
  const isSpeakingRef = useRef(isSpeaking);
  const audioRef = useRef(audio);

  /**
   * for each user
   * is speaking or not
   * min non speaking volume
   * max speaking volume
   * */
  const usersVolume = useRef({});

  const [activeSpeaker, setActiveSpeaker] = useState(0);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  const normlize = (value, min, max) => {
    return (value - min) / (max - min);
  };

  //findout who is active speaker using usersVolume(speaking and non speaking volume) and current user volume
  const findActiveSpeaker = () => {
    //get current volume levels for users
    //@ts-ignore
    const currentUsersVolume = RtcEngine?.getUsersVolumeLevel();

    const normalizedValues = {};

    currentUsersVolume.forEach((i) => {
      if (usersVolume.current[i.uid]?.isSpeaking) {
        const returnVal = normlize(
          i.level,
          usersVolume.current[i.uid]?.nonSpeakingVolume || 0,
          usersVolume.current[i.uid]?.speakingVolume || 100,
        );
        normalizedValues[i.uid] = returnVal;
      }
    });

    const sorted = Object.keys(normalizedValues).sort((a, b) => {
      return normalizedValues[b] - normalizedValues[a];
    });

    if (sorted && sorted.length) {
      setActiveSpeaker(parseInt(sorted[0]));
    } else {
      setActiveSpeaker(0);
    }
  };

  const isSpeakingEventCallback = ({payload, sender}) => {
    usersVolume.current = {
      ...usersVolume.current,
      [sender]: {
        ...usersVolume.current[sender],
        isSpeaking: payload === 'true' ? true : false,
      },
    };
    findActiveSpeaker();
  };

  const speakingVolumeEventCallBack = ({payload, sender}) => {
    usersVolume.current = {
      ...usersVolume.current,
      [sender]: {
        ...usersVolume.current[sender],
        speakingVolume: !usersVolume.current[sender]?.speakingVolume
          ? parseFloat(payload)
          : parseFloat(payload) > usersVolume.current[sender]?.speakingVolume
          ? parseFloat(payload)
          : usersVolume.current[sender].speakingVolume,
      },
    };
    //findActiveSpeaker();
  };

  const nonSpeakingVolumeEventCallback = ({payload, sender}) => {
    usersVolume.current = {
      ...usersVolume.current,
      [sender]: {
        ...usersVolume.current[sender],
        nonSpeakingVolume: !usersVolume.current[sender]?.nonSpeakingVolume
          ? parseFloat(payload)
          : parseFloat(payload) < usersVolume.current[sender]?.nonSpeakingVolume
          ? parseFloat(payload)
          : usersVolume.current[sender]?.nonSpeakingVolume,
      },
    };
    //findActiveSpeaker();
  };
  useEffect(() => {
    events.on(volumeEnum.SPEAKING_VOLUME, speakingVolumeEventCallBack);
    events.on(volumeEnum.NON_SPEAKING_VOLUME, nonSpeakingVolumeEventCallback);
    events.on(volumeEnum.IS_SPEAKING, isSpeakingEventCallback);

    return () => {
      events.off(volumeEnum.SPEAKING_VOLUME, speakingVolumeEventCallBack);
      events.off(
        volumeEnum.NON_SPEAKING_VOLUME,
        nonSpeakingVolumeEventCallback,
      );
      events.off(volumeEnum.IS_SPEAKING, isSpeakingEventCallback);
    };
  }, []);

  useEffect(() => {
    try {
      if (!audio) {
        setIntervalRef?.current && clearInterval(setIntervalRef.current);
        return;
      } else {
        // send local user speaking and non speaking volume to remote users
        setIntervalRef.current = setInterval(() => {
          let volume = 0;
          //@ts-ignore
          const volumes = RtcEngine?.getUsersVolumeLevel();
          const localUserData = volumes.find((i) => i.uid == uid);
          if (localUserData && localUserData.level) {
            volume = Math.round(localUserData.level * 100) / 100;
          }
          if (isSpeakingRef.current && audioRef.current) {
            //for remote users
            events.send(
              volumeEnum.SPEAKING_VOLUME,
              volume.toString(),
              EventPersistLevel.LEVEL2,
            );
            //for local user
            speakingVolumeEventCallBack({
              payload: volume.toString(),
              sender: uid,
            });
          } else if (!isSpeakingRef.current && audioRef.current) {
            //for remote users
            events.send(
              volumeEnum.NON_SPEAKING_VOLUME,
              volume.toString(),
              EventPersistLevel.LEVEL2,
            );
            //for local user
            nonSpeakingVolumeEventCallback({
              payload: volume.toString(),
              sender: uid,
            });
          }
        }, 500);
        // send local user speaking and non speaking volume to remote users

        //detect local user speaking or not and send data to remote users
        navigator.mediaDevices
          .getUserMedia({
            audio: true,
          })
          .then((audioStream) => {
            speechRef.current = hark(audioStream, {});
            speechRef.current.on('speaking', function () {
              if (audioRef.current) {
                //for remote usage
                events.send(
                  volumeEnum.IS_SPEAKING,
                  'true',
                  EventPersistLevel.LEVEL2,
                );
                //for local usage
                isSpeakingEventCallback({payload: 'true', sender: uid});
                setIsSpeaking(true);
              }
            });
            speechRef.current.on('stopped_speaking', function () {
              if (audioRef.current) {
                //for remote usage
                events.send(
                  volumeEnum.IS_SPEAKING,
                  'false',
                  EventPersistLevel.LEVEL2,
                );
                //for local usage
                isSpeakingEventCallback({payload: 'false', sender: uid});
                setIsSpeaking(false);
              }
            });
          })
          .catch((error) => {
            console.log('debugging useIsSpeaking error', error);
          });
        //detect local user speaking or not and send data to remote users
      }
    } catch (error) {
      console.log('debugging useIsSpeaking error', error);
    }
    return () => {
      setIntervalRef?.current && clearInterval(setIntervalRef.current);
      speechRef.current?.stop && speechRef.current?.stop();
    };
  }, [audio]);

  return activeSpeaker ? activeSpeaker : 0;
};
export default useIsSpeaking;
