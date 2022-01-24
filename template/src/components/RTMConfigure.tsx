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
import {PropsContext} from '../../agora-rn-uikit';
import ChatContext, {controlMessageEnum} from './ChatContext';
import {RtcContext} from '../../agora-rn-uikit';
import {
  messageStoreInterface,
  messageChannelType,
  messageSourceType,
  messageActionType,
} from './ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import events from './RTMEvents';

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

const stringifyPayload = (
  source: messageSourceType,
  type: messageActionType,
  msg: string,
) => {
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
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [privateMessageStore, setPrivateMessageStore] = useState({});
  const [login, setLogin] = useState<boolean>(false);
  const [userList, setUserList] = useState<{[key: string]: any}>({});
  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');
  const timerValueRef: any = useRef(5);

  const addMessageToStore = (uid: string, msg: {body: string; ts: string}) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: msg.ts, uid: uid, msg: msg.body}];
    });
  };

  const addMessageToPrivateStore = (
    uid: string,
    msg: {
      body: string;
      ts: string;
    },
    local: boolean,
  ) => {
    setPrivateMessageStore((state: any) => {
      let newState = {...state};
      newState[uid] !== undefined
        ? (newState[uid] = [
            ...newState[uid],
            {ts: msg.ts, uid: local ? localUid.current : uid, msg: msg.body},
          ])
        : (newState = {
            ...newState,
            [uid]: [
              {ts: msg.ts, uid: local ? localUid.current : uid, msg: msg.body},
            ],
          });
      return {...newState};
    });
  };
  
  const doLoginAndSetupRTM = async () => {
    try {
      await engine.current.login({
        uid: localUid.current,
        token: rtcProps.rtm,
      });
      timerValueRef.current = 5
      setAttribute();      
    } catch (error) {
      setTimeout( async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        doLoginAndSetupRTM();
      }, timerValueRef.current * 1000 );
    }
  }

  const setAttribute = async () => {    
    try {
      await engine.current.setLocalUserAttributes([
        {key: 'name', value: name || 'User'},
        {key: 'screenUid', value: String(rtcProps.screenShareUid)},
      ]);
      timerValueRef.current = 5
      joinChannel()            
    } catch (error) {
      setTimeout( async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        setAttribute();
      }, timerValueRef.current * 1000 );
    }
  }

  const joinChannel = async () => {
    try {
      await engine.current.joinChannel(rtcProps.channel);  
      timerValueRef.current = 5
      getMembers()      
    } catch (error) {
      setTimeout( async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        joinChannel();
      }, timerValueRef.current * 1000 );
    }  
  }

  const getMembers = async () => {
    try {
      await engine.current
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
        console.log('RTM init done');
      });
      timerValueRef.current = 5
    } catch (error) {
      setTimeout( async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        getMembers();
      }, timerValueRef.current * 1000 );
    } 
  }
  const init = async () => {
    engine.current = new RtmEngine();
    rtcProps.uid
      ? (localUid.current = rtcProps.uid + '')
      : (localUid.current = '' + timeNow());
    engine.current.on('connectionStateChanged', (evt: any) => {
       //console.log(evt);
    });
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

      const timestamp = timeNow();

      const userUID = Platform.OS === 'android' ? arr[0] : peerId;

      if (type === messageActionType.Control) {
        try {
          switch (msg) {
            case controlMessageEnum.muteVideo:
              RtcEngine.muteLocalVideoStream(true);
              dispatch({
                type: 'LocalMuteVideo',
                value: [0],
              });
              break;
            case controlMessageEnum.muteAudio:
              RtcEngine.muteLocalAudioStream(true);
              dispatch({
                type: 'LocalMuteAudio',
                value: [0],
              });
              break;
            case controlMessageEnum.kickUser:
              dispatch({
                type: 'EndCall',
                value: [],
              });
              break;
            default:
              throw new Error('Unsupported message type');
          }
        } catch (e) {
          events.emit(messageChannelType.Private, null, {
            msg: `Error while dispatching ${messageChannelType.Private} control message`,
            cause: e,
          });
          return;
        }
      } else if (type === messageActionType.Normal) {
        try {
          addMessageToPrivateStore(
            userUID,
            {
              body: `${type}${msg}`,
              ts: timestamp,
            },
            false,
          );
        } catch (e) {
          events.emit(messageChannelType.Private, null, {
            msg: `Error while adding ${messageChannelType.Private} message to store`,
            cause: e,
          });
          return;
        }
      }
      events.emit(messageChannelType.Private, {
        uid: userUID,
        ts: timestamp,
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
        if (type === messageActionType.Control) {
          try {
            switch (msg) {
              case controlMessageEnum.muteVideo:
                RtcEngine.muteLocalVideoStream(true);
                dispatch({
                  type: 'LocalMuteVideo',
                  value: [0],
                });
                break;
              case controlMessageEnum.muteAudio:
                RtcEngine.muteLocalAudioStream(true);
                dispatch({
                  type: 'LocalMuteAudio',
                  value: [0],
                });
                break;
              case controlMessageEnum.cloudRecordingActive:
                setRecordingActive(true);
                break;
              case controlMessageEnum.cloudRecordingUnactive:
                setRecordingActive(false);
                break;
              default:
                throw new Error('Unsupported message type');
            }
          } catch (e) {
            events.emit(messageChannelType.Public, null, {
              msg: `Error while dispatching ${messageChannelType.Public} control message`,
              cause: e,
            });
            return;
          }
        } else if (type === messageActionType.Normal) {
          try {
            addMessageToStore(userUID, {body: `${type}${msg}`, ts: timestamp});
          } catch (e) {
            events.emit(messageChannelType.Public, null, {
              msg: `Error while adding ${messageChannelType.Public}  message to store`,
              cause: e,
            });
            return;
          }
        }
      }
      events.emit(messageChannelType.Public, {
        uid: userUID,
        ts: timestamp,
        ...textObj,
      });
    });

    await engine.current.createClient(rtcProps.appId);
    doLoginAndSetupRTM();
    
  };

  const sendMessage = async (msg: string) => {
    if (msg.trim() === '') return;
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Normal,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
    addMessageToStore(localUid.current, {
      body: messageActionType.Normal + msg,
      ts: timeNow(),
    });
  };
  const sendMessageToUid = async (msg: string, uid: number) => {
    if (msg.trim() === '') return;
    let adjustedUID = uid;
    if (adjustedUID < 0) {
      adjustedUID = adjustUID(uid);
    }
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Normal,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: adjustedUID.toString(),
      offline: false,
      text,
    });
    addMessageToPrivateStore(
      uid,
      {
        body: messageActionType.Normal + msg,
        ts: timeNow(),
      },
      true,
    );
  };

  const sendControlMessage = async (msg: string) => {
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Control,
      msg,
    );
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      text,
    );
  };

  const sendControlMessageToUid = async (msg: string, uid: number) => {
    if (uid < 0) {
      uid = adjustUID(uid);
    }
    const text = stringifyPayload(
      messageSourceType.Core,
      messageActionType.Control,
      msg,
    );
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
