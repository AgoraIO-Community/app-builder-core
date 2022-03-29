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
import RtmEngine, {
  RtmChannelAttribute,
  RtmAttribute,
} from 'agora-react-native-rtm';
import {ClientRole, PropsContext} from '../../agora-rn-uikit';
import ChatContext, {controlMessageEnum} from './ChatContext';
import {RtcContext} from '../../agora-rn-uikit';
import {
  messageStoreInterface,
  messageChannelType,
  messageSourceType,
  messageActionType,
  attrRequestTypes,
} from './ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';
import events from './RTMEvents';
import {filterObject} from '../utils';

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

function hasJsonStructure(str: string) {
  if (typeof str !== 'string') return false;
  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
}
function safeJsonParse(str: string) {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    return [err];
  }
}
const timeNow = () => new Date().getTime();

const RtmConfigure = (props: any) => {
  const {setRecordingActive, callActive, name} = props;
  const {rtcProps} = useContext(PropsContext);
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [privateMessageStore, setPrivateMessageStore] = useState({});
  const [login, setLogin] = useState<boolean>(false);
  const [userList, setUserList] = useState<{[key: string]: any}>({});
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);

  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');
  const timerValueRef: any = useRef(5);

  React.useEffect(() => {
    const handBrowserClose = () => {
      engine.current.leaveChannel(rtcProps.channel);
    };

    if (Platform.OS !== 'web') return;
    window.addEventListener('beforeunload', handBrowserClose);
    // cleanup this component
    return () => {
      window.removeEventListener('beforeunload', handBrowserClose);
    };
  }, []);

  React.useEffect(() => {
    setTotalOnlineUsers(
      Object.keys(
        filterObject(
          userList,
          ([k, v]) => v?.type === UserType.Normal && !v.offline,
        ),
      ).length,
    );
  }, [userList]);

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
      timerValueRef.current = 5;
      setAttribute();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        doLoginAndSetupRTM();
      }, timerValueRef.current * 1000);
    }
  };

  const setAttribute = async () => {
    try {
      await engine.current.setLocalUserAttributes([
        {key: 'name', value: name || 'User'},
        {key: 'screenUid', value: String(rtcProps.screenShareUid)},
        {key: 'role', value: String(rtcProps?.role)},
        {key: 'requests', value: attrRequestTypes.none}, // stores Uid who have raised a request
      ]);
      timerValueRef.current = 5;
      joinChannel();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        setAttribute();
      }, timerValueRef.current * 1000);
    }
  };

  const addOrUpdateLocalUserAttributes = async (attributes: RtmAttribute[]) => {
    try {
      await engine.current.addOrUpdateLocalUserAttributes(attributes);
    } catch (error) {
      console.log('error while local user addOrUpdateAttributes: ', error);
    }
  };

  const joinChannel = async () => {
    try {
      await engine.current.joinChannel(rtcProps.channel);
      timerValueRef.current = 5;
      getMembers();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        joinChannel();
      }, timerValueRef.current * 1000);
    }
  };

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
                if (
                  attr?.attributes?.name &&
                  attr?.attributes?.screenUid &&
                  attr?.attributes?.role &&
                  attr?.attributes?.requests
                ) {
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
                    role: parseInt(attr?.attributes?.role),
                    screenUid: parseInt(attr?.attributes?.screenUid),
                    offline: false,
                    requests: attr?.attributes?.requests,
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
      timerValueRef.current = 5;
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        getMembers();
      }, timerValueRef.current * 1000);
    }
  };
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
          if (
            attr?.attributes?.name &&
            attr?.attributes?.screenUid &&
            attr?.attributes?.role &&
            attr?.attributes?.requests
          ) {
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
                role: parseInt(attr?.attributes?.role),
                screenUid: parseInt(attr?.attributes?.screenUid),
                offline: false,
                requests: attr?.attributes?.requests,
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
      const {uid} = data;
      if (!uid) return;
      setUserList((prevState) => {
        return {
          ...prevState,
          [uid]: {
            ...prevState[uid],
            requests: attrRequestTypes.none,
            offline: true,
          },
        };
      });
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
              break;
            //   throw new Error('Unsupported message type');
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
      const timestamp = ts === 0 ? timeNow() : ts;

      if (channelId === rtcProps.channel) {
        if (type === messageActionType.Control) {
          let actionMsg = '';
          if (hasJsonStructure(msg)) {
            const [err, result] = safeJsonParse(msg);
            if (!err) {
              const {action} = result;
              actionMsg = action;
            }
          } else {
            actionMsg = msg;
          }
          try {
            switch (actionMsg) {
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
              case controlMessageEnum.clientRoleChanged:
                const {payload} = JSON.parse(msg);
                if (payload && payload?.role) {
                  if (
                    payload.role.trim() !== '' &&
                    payload.role in ClientRole
                  ) {
                    setUserList((prevState) => {
                      return {
                        ...prevState,
                        [uid]: {
                          ...prevState[uid],
                          role: parseInt(payload.role),
                        },
                      };
                    });
                  }
                }
                break;
              default:
                break;
              //   throw new Error('Unsupported message type');
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

    engine.current.addListener(
      'ChannelAttributesUpdated',
      (attributes: RtmChannelAttribute[]) => {
        /**
         * a) The following piece of code is commented for future reference.
         * b) To be used in future implementations of channel attributes
         * c) Kindly note the agora-react-native-rtm does not return the attributes with
         *    additional lastUpdateUserId and lastUpdateTs as mentioned in RtmChannelAttribute type
         */
      },
    );

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

  const updateChannelAttributes = async (attributes: RtmChannelAttribute[]) => {
    /**
     * a) The following piece of code is commented for future reference.
     * b) To be used in future implementations of channel attributes
     * c) attributes should be an array of key value [{key:"keyTobeUsed", value; 'valueToBeUsed}]
     *    following the type RtmChannelAttribute
     */
    // try {
    //   await (engine.current as RtmEngine).addOrUpdateChannelAttributes(
    //     rtcProps.channel,
    //     [...attributes],
    //     {enableNotificationToChannelMembers: true},
    //   );
    // } catch (error) {
    //   console.log('AttributesUpdated error', error);
    // }
  };

  useEffect(() => {
    callActive ? init() : (console.log('waiting to init RTM'), setLogin(true));
    return () => {
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.channel, rtcProps.appId, callActive]);

  const broadcastUserAttributes = async (
    attributes: RtmAttribute[],
    ctrlMsg: controlMessageEnum,
  ) => {
    // 1. Update my attributes in attribute-list
    await addOrUpdateLocalUserAttributes(attributes);

    let formattedAttributes: any = {};
    // Transform the array into object of key value pair
    attributes.map((attribute) => {
      let key = Object.values(attribute)[0];
      let value = Object.values(attribute)[1];
      formattedAttributes[key] = value;
    });
    // 2. Update my attributes in user-list
    setUserList((prevState) => {
      return {
        ...prevState,
        [localUid.current]: {
          ...prevState[localUid.current],
          ...formattedAttributes,
        },
      };
    });

    /**
     * 3. Broadcast my updated attributes to everyone
     * send payload and control message as string
     */
    const msgAsString = JSON.stringify({
      action: ctrlMsg,
      payload: {...formattedAttributes},
    });
    sendControlMessage(msgAsString);
  };

  return (
    <ChatContext.Provider
      value={{
        messageStore,
        privateMessageStore,
        sendControlMessage,
        sendControlMessageToUid,
        sendMessage,
        sendMessageToUid,
        broadcastUserAttributes,
        addOrUpdateLocalUserAttributes,
        engine: engine.current,
        localUid: localUid.current,
        userList: userList,
        onlineUsersCount,
        events,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
