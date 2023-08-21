import {useLocalUserInfo, useRender, useRtc} from 'customization-api';
import {useEffect, useRef, useState} from 'react';
import events, {EventPersistLevel} from '../rtm-events-api';
import useIsLocalUserSpeaking from './useIsLocalUserSpeaking';
import {filterObject} from '../utils/index';

enum volumeEnum {
  IS_SPEAKING = 'IS_SPEAKING',
  SPEAKING_VOLUME = 'SPEAKING_VOLUME',
  NON_SPEAKING_VOLUME = 'NON_SPEAKING_VOLUME',
}
const useFindActiveSpeaker = () => {
  const isLocalUserSpeaking = useIsLocalUserSpeaking();
  const {RtcEngine} = useRtc();
  const {renderList} = useRender();
  const {uid} = useLocalUserInfo();
  const renderListRef = useRef(renderList);
  const maxSpeakingVolumeRef = useRef(0);
  const minNonSpeakingVolumeRef = useRef(100);
  const usersVolume = useRef({});
  const [activeSpeaker, setActiveSpeaker] = useState(0);

  useEffect(() => {
    renderListRef.current = renderList;
  }, [renderList]);

  const normalize = (value, min, max) => {
    return (value - min) / (max - min);
  };

  useEffect(() => {
    //sending local user speaking and non speaking volume to remote users
    let volume = 0;
    //@ts-ignore
    const volumes = RtcEngine?.getUsersVolumeLevel();
    const localUserData = volumes.find((i) => i.uid == uid);
    if (localUserData && localUserData.level) {
      volume = Math.round(localUserData.level * 100) / 100;
    }
    if (volume) {
      if (isLocalUserSpeaking && volume > maxSpeakingVolumeRef.current) {
        //for remote users
        maxSpeakingVolumeRef.current = volume;
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
      } else if (
        !isLocalUserSpeaking &&
        volume < minNonSpeakingVolumeRef.current
      ) {
        //for remote users
        minNonSpeakingVolumeRef.current = volume;
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
    }

    //inform local user is speaking
    if (isLocalUserSpeaking) {
      //inform remote users
      events.send(volumeEnum.IS_SPEAKING, 'true', EventPersistLevel.LEVEL2);
      //for local usage
      isSpeakingEventCallback({payload: 'true', sender: uid});
    } else {
      //inform remote users
      events.send(volumeEnum.IS_SPEAKING, 'false', EventPersistLevel.LEVEL2);
      //for local usage
      isSpeakingEventCallback({payload: 'false', sender: uid});
    }
  }, [isLocalUserSpeaking]);

  //findout who is active speaker using usersVolume(speaking and non speaking volume) and current user volume
  const findActiveSpeaker = () => {
    //filter the user id who are all speaking
    const speakingUids = Object.keys(
      //@ts-ignore
      filterObject(usersVolume.current, ([k, v]) => {
        //@ts-ignore
        return v?.isSpeaking && renderListRef.current[k]?.audio;
      }),
    );
    if (!speakingUids || speakingUids?.length == 0) {
      console.log('debugging no active speaker');
      setActiveSpeaker(0);
    } else {
      if (speakingUids?.length === 1) {
        console.log('debugging only one user is speaking ', speakingUids[0]);
        setActiveSpeaker(parseInt(speakingUids[0]));
      } else {
        console.log('debugging multiple users are speaking ', speakingUids);
        //get current volume levels for users
        //@ts-ignore
        const currentUsersVolume = RtcEngine?.getUsersVolumeLevel();
        const normalizedValues = {};
        speakingUids?.forEach((uid) => {
          const uuid = parseInt(uid);
          const data = currentUsersVolume?.find((i) => i.uid === uuid);
          const returnVal = normalize(
            data?.level || usersVolume.current[uuid]?.speakingVolume, //current level
            usersVolume.current[uid]?.nonSpeakingVolume || 0,
            usersVolume.current[uuid]?.speakingVolume || 100,
          );
          normalizedValues[uuid] = returnVal;
        });

        const sorted = Object.keys(normalizedValues).sort((a, b) => {
          return normalizedValues[b] - normalizedValues[a];
        });
        setActiveSpeaker(parseInt(sorted[0]));

        //for logging purpose
        let obj = {};
        sorted.map((i) => {
          let id = parseInt(i);
          const curtdata = currentUsersVolume.find((i) => i.uid === id);
          const cl =
            curtdata && curtdata?.level
              ? Math.round(curtdata?.level * 100) / 100
              : 'no vol';
          obj[id] = {
            name: renderListRef.current[id]?.name,
            normalizedVolume: normalizedValues[id],
            currentVolume: cl,
            minNonSpeakingVolume: usersVolume.current[id]?.nonSpeakingVolume,
            speakingVolume: usersVolume.current[id]?.speakingVolume,
            isSpeaking: usersVolume.current[id]?.isSpeaking,
          };
        });
        console.log('debugging active speaker data', JSON.stringify(obj));
        //for logging purpose
      }
    }

    /*
    //get current volume levels for users
    //@ts-ignore
    const currentUsersVolume = RtcEngine?.getUsersVolumeLevel();

    const normalizedValues = {};

    currentUsersVolume.forEach((i) => {
      //validation
      if (
        renderListRef.current[i.uid]?.audio &&
        usersVolume.current[i.uid]?.isSpeaking
      ) {
        const returnVal = normalize(
          i.level, //current level
          usersVolume.current[i.uid]?.nonSpeakingVolume || 0,
          usersVolume.current[i.uid]?.speakingVolume || 100,
        );
        normalizedValues[i.uid] = returnVal;
      }
    });

    const sorted = Object.keys(normalizedValues).sort((a, b) => {
      return normalizedValues[b] - normalizedValues[a];
    });

    if (!sorted || !sorted?.length) {
      console.log('debugging no active speaker');
      setActiveSpeaker(0);
    } else if (
      sorted &&
      sorted.length &&
      parseInt(sorted[0]) !== activeSpeaker
    ) {
      setActiveSpeaker(parseInt(sorted[0]));

      //for logging purpose
      let obj = {};
      sorted.map((i) => {
        let id = parseInt(i);
        const curtdata = currentUsersVolume.find((i) => i.uid === id);
        const cl =
          curtdata && curtdata?.level
            ? Math.round(curtdata?.level * 100) / 100
            : 'no vol';
        obj[id] = {
          name: renderListRef.current[id]?.name,
          normalizedVolume: normalizedValues[id],
          currentVolume: cl,
          minNonSpeakingVolume: usersVolume.current[id]?.nonSpeakingVolume,
          speakingVolume: usersVolume.current[id]?.speakingVolume,
          isSpeaking: usersVolume.current[id]?.isSpeaking,
        };
      });
      console.log('debugging active speaker data', JSON.stringify(obj));
      //for logging purpose
    }*/
  };

  const isSpeakingEventCallback = ({payload, sender}) => {
    // console.log(
    //   'debugging ',
    //   sender,
    //   ' is speaking ',
    //   payload === 'true' ? true : false,
    // );
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
    //console.log('debugging speaking volume sender', sender, '=', payload);
    usersVolume.current = {
      ...usersVolume.current,
      [sender]: {
        ...usersVolume.current[sender],
        speakingVolume: parseFloat(payload),
      },
    };
  };

  const nonSpeakingVolumeEventCallback = ({payload, sender}) => {
    //console.log('debugging non speaking volume sender', sender, '=', payload);
    usersVolume.current = {
      ...usersVolume.current,
      [sender]: {
        ...usersVolume.current[sender],
        nonSpeakingVolume: parseFloat(payload),
      },
    };
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

  return activeSpeaker;
};
export default useFindActiveSpeaker;
