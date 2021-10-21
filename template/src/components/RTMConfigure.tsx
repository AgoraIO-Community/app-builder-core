/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ChatContext, {controlMessageEnum} from './ChatContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {messageStoreInterface, mChannelType, mSourceType} from './ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import events from './RTMEvents';

export enum mType {
  Control = '0',
  Normal = '1',
}

export enum UserType {
  Normal,
  ScreenShare,
}

const adjustUID = (number: number) => {
  if (number < 0) {
    number = 0xffffffff + number + 1;
  }
  return number;
};

const stringifyPayload = (source: mSourceType, type: mType, msg: string) => {
  return JSON.stringify({
    source,
    type,
    msg,
  });
};

const parsePayload = (data: string) => {
  return JSON.parse(data);
};

const timeNow = () => new Date().getTime();

const RtmConfigure = (props: any) => {
  const {setRecordingActive, callActive, name} = props;
  const {rtcProps} = useContext(PropsContext);
  const {dispatch} = useContext(RtcContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [privateMessageStore, setPrivateMessageStore] = useState({});
  const [login, setLogin] = useState<boolean>(false);
  const [userList, setUserList] = useState<{[key: string]: any}>({});
  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');

  const addMessageToStore = (uid: string, text: string, ts: string) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: ts, uid: uid, msg: text}];
    });
  };

  const addMessageToPrivateStore = (
    uid: string,
    text: string,
    ts: string,
    local: boolean,
  ) => {
    setPrivateMessageStore((state: any) => {
      let newState = {...state};
      newState[uid] !== undefined
        ? (newState[uid] = [
            ...newState[uid],
            {ts: ts, uid: local ? localUid.current : uid, msg: text},
          ])
        : (newState = {
            ...newState,
            [uid]: [{ts: ts, uid: local ? localUid.current : uid, msg: text}],
          });
      return {...newState};
    });
  };

  const init = async () => {
    engine.current = new RtmEngine();
    rtcProps.uid
      ? (localUid.current = rtcProps.uid + '')
      : (localUid.current = '' + timeNow());
    engine.current.on('error', (evt: any) => {
      // console.log(evt);
    });
    engine.current.on('channelMemberJoined', (data: any) => {
      const backoffAttributes = backOff(
        async () => {
          const attr = await engine.current.getUserAttributesByUid(data.uid);
          if (attr?.attributes?.name && attr?.attributes?.screenUid) {
            return attr;
          } else {
            throw attr;
          }
        },
        {
          retry: (e, idx) => {
            console.log(
              `[retrying] Attempt ${idx}. Fetching ${data.uid}'s name`,
              e,
            );
            return true;
          },
        },
      );
      async function getname() {
        try {
          const attr = await backoffAttributes;
          console.log('[user attributes]:', {attr});
          setUserList((prevState) => {
            return {
              ...prevState,
              [data.uid]: {
                name: attr?.attributes?.name || 'User',
                type: UserType.Normal,
                screenUid: parseInt(attr?.attributes?.screenUid),
              },
              [parseInt(attr?.attributes?.screenUid)]: {
                name: `${attr?.attributes?.name || 'User'}'s screenshare`,
                type: UserType.ScreenShare,
              },
            };
          });
        } catch (e) {
          console.error(`Could not retrieve name of ${data.uid}`, e);
        }
      }
      getname();
    });
    engine.current.on('channelMemberLeft', (data: any) => {
      console.log('user left', data);
      // Chat of left user becomes undefined. So don't cleanup
    });
    engine.current.on('messageReceived', (evt: any) => {
      const {peerId, ts, text} = evt;
      const textObj = parsePayload(text);
      const {type, msg} = textObj;

      let arr = new Int32Array(1);
      arr[0] = parseInt(peerId);

      const inHours = new Date(ts).getHours();
      const timestamp = isNaN(inHours) ? timeNow() : inHours;
      const userUID = Platform.OS === 'android' ? arr[0] : peerId;

      if (type === mType.Control) {
        try {
          switch (msg) {
            case controlMessageEnum.muteVideo:
              dispatch({
                type: 'LocalMuteVideo',
                value: [true],
              });
              break;
            case controlMessageEnum.muteAudio:
              dispatch({
                type: 'LocalMuteAudio',
                value: [true],
              });
              break;
            case controlMessageEnum.kickUser:
              dispatch({
                type: 'EndCall',
                value: [],
              });
              break;
            default:
              break;
          }
        } catch (e) {
          events.emit(mChannelType.Private, null, {
            msg: `Error while dispatching ${mChannelType.Private} control message`,
            cause: e,
          });
          return;
        }
      } else if (type === mType.Normal) {
        try {
          addMessageToPrivateStore(
            userUID,
            `${type}${msg}`,
            timestamp.toString(),
            false,
          );
        } catch (e) {
          events.emit(mChannelType.Private, null, {
            msg: `Error while adding ${mChannelType.Private} message to store`,
            cause: e,
          });
          return;
        }
      }
      events.emit(mChannelType.Private, {
        uid: userUID,
        ts: timestamp.toString(),
        ...textObj,
      });
    });

    engine.current.on('channelMessageReceived', (evt) => {
      const {uid, channelId, text, ts} = evt;
      const textObj = parsePayload(text);
      const {type, msg} = textObj;

      let arr = new Int32Array(1);
      arr[0] = parseInt(uid);

      const userUID = Platform.OS ? arr[0] : uid;
      console.log('userId', userUID);
      const timestamp = ts === 0 ? timeNow() : ts;

      if (channelId === rtcProps.channel) {
        if (type === mType.Control) {
          try {
            switch (msg) {
              case controlMessageEnum.muteVideo:
                dispatch({
                  type: 'LocalMuteVideo',
                  value: [true],
                });
                break;
              case controlMessageEnum.muteAudio:
                dispatch({
                  type: 'LocalMuteAudio',
                  value: [true],
                });
                break;
              case controlMessageEnum.cloudRecordingActive:
                setRecordingActive(true);
                break;
              case controlMessageEnum.cloudRecordingUnactive:
                setRecordingActive(false);
                break;
              default:
                break;
            }
          } catch (e) {
            events.emit(mChannelType.Public, null, {
              msg: `Error while dispatching ${mChannelType.Public} control message`,
              cause: e,
            });
            return;
          }
        } else if (type === mType.Normal) {
          try {
            addMessageToStore(userUID, `${type}${msg}`, timestamp);
          } catch (e) {
            events.emit(mChannelType.Public, null, {
              msg: `Error while adding ${mChannelType.Public}  message to store`,
              cause: e,
            });
            return;
          }
        }
      }
      events.emit(mChannelType.Public, {
        uid: userUID,
        ts: timestamp,
        ...textObj,
      });
    });

    engine.current.createClient(rtcProps.appId);
    await engine.current.login({
      uid: localUid.current,
      token: rtcProps.rtm,
    });
    await engine.current.setLocalUserAttributes([
      {key: 'name', value: name || 'User'},
      {key: 'screenUid', value: String(rtcProps.screenShareUid)},
    ]);
    await engine.current.joinChannel(rtcProps.channel);
    engine.current
      .getChannelMembersBychannelId(rtcProps.channel)
      .then((data) => {
        data.members.map(async (member: any) => {
          const backoffAttributes = backOff(
            async () => {
              const attr = await engine.current.getUserAttributesByUid(
                member.uid,
              );
              if (attr?.attributes?.name && attr?.attributes?.screenUid) {
                return attr;
              } else {
                throw attr;
              }
            },
            {
              retry: (e, idx) => {
                console.log(
                  `[retrying] Attempt ${idx}. Fetching ${member.uid}'s name`,
                  e,
                );
                return true;
              },
            },
          );
          try {
            const attr = await backoffAttributes;
            console.log('[user attributes]:', {attr});
            setUserList((prevState) => {
              return {
                ...prevState,
                [member.uid]: {
                  name: attr?.attributes?.name || 'User',
                  type: UserType.Normal,
                  screenUid: parseInt(attr?.attributes?.screenUid),
                },
                [parseInt(attr?.attributes?.screenUid)]: {
                  name: `${attr?.attributes?.name || 'User'}'s screenshare`,
                  type: UserType.ScreenShare,
                },
              };
            });
          } catch (e) {
            console.error(`Could not retrieve name of ${member.uid}`, e);
          }
        });
        setLogin(true);
      });
    console.log('RTM init done');
  };

  const sendMessage = async (msg: string) => {
    if (msg.trim() === '') return;
    const text = stringifyPayload(mSourceType.Core, mType.Normal, msg);
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
    addMessageToStore(localUid.current, mType.Normal + msg, timeNow());
  };
  const sendMessageToUid = async (msg: string, uid: number) => {
    if (msg.trim() === '') return;
    let adjustedUID = uid;
    if (adjustedUID < 0) {
      adjustedUID = adjustUID(uid);
    }
    const text = stringifyPayload(mSourceType.Core, mType.Normal, msg);
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: adjustedUID.toString(),
      offline: false,
      text,
    });
    addMessageToPrivateStore(uid, mType.Normal + msg, timeNow(), true);
  };

  const sendControlMessage = async (msg: string) => {
    const text = stringifyPayload(mSourceType.Core, mType.Control, msg);
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
  };

  const sendControlMessageToUid = async (msg: string, uid: number) => {
    if (uid < 0) {
      uid = adjustUID(uid);
    }
    const text = stringifyPayload(mSourceType.Core, mType.Control, msg);
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: uid.toString(),
      offline: false,
      text,
    });
  };

  const end = async () => {
    callActive
      ? (await (engine.current as RtmEngine).logout(),
        await (engine.current as RtmEngine).destroyClient(),
        // setLogin(false),
        console.log('RTM cleanup done'))
      : {};
  };

  useEffect(() => {
    callActive ? init() : (console.log('waiting to init RTM'), setLogin(true));
    return () => {
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.channel, rtcProps.appId, callActive]);

  return (
    <ChatContext.Provider
      value={{
        messageStore,
        privateMessageStore,
        sendControlMessage,
        sendControlMessageToUid,
        sendMessage,
        sendMessageToUid,
        engine: engine.current,
        localUid: localUid.current,
        userList: userList,
        events,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
