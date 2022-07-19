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
import {
  ClientRole,
  PropsContext,
  RenderInterface,
  UidType,
  useLocalUid,
} from '../../agora-rn-uikit';
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
import {useString} from '../utils/useString';
import {isAndroid, isWeb} from '../utils/common';
import StorageContext from './StorageContext';
import {useChatUIControl} from './chat-ui/useChatUIControl';
import {useChatNotification} from './chat-notification/useChatNotification';
import Toast from '../../react-native-toast-message';
import {useRenderContext, useSidePanel} from 'fpe-api';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {useScreenContext} from './contexts/ScreenShareContext';
import {useLiveStreamDataContext} from './contexts/LiveStreamDataContext';

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
  const localUid = useLocalUid();
  const {setRecordingActive, callActive} = props;
  const {rtcProps} = useContext(PropsContext);
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const {renderList, renderPosition} = useRenderContext();
  const renderListRef = useRef({renderList: renderList});
  const renderPositionRef = useRef({renderPosition: renderPosition});

  /**
   * inside event callback state won't have latest value.
   * so creating ref to access the state
   */
  useEffect(() => {
    renderPositionRef.current.renderPosition = renderPosition;
  }, [renderPosition]);

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  const {setScreenShareData, screenShareData} = useScreenContext();
  const {
    setLiveStreamData,
    audienceUids,
    hostUids,
    setAudienceUids,
    setHostUids,
  } = useLiveStreamDataContext();

  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);

  const {setUnreadGroupMessageCount, setUnreadIndividualMessageCount} =
    useChatNotification();
  const {groupActive, selectedChatUserId, setGroupActive} = useChatUIControl();
  const groupActiveRef = useRef<boolean>();
  const individualActiveRef = useRef<UidType>();

  /**
   *  engine on channelMessageReceived callback won't be receiving update react state value so using ref
   */
  useEffect(() => {
    groupActiveRef.current = groupActive;
  }, [groupActive]);

  /**
   * engine on messageReceived callback won't be receiving update react state value so using ref
   */
  useEffect(() => {
    individualActiveRef.current = selectedChatUserId;
  }, [selectedChatUserId]);

  const {store, setStore} = useContext(StorageContext);
  const getInitialUsername = () =>
    store?.displayName ? store.displayName : '';
  const [displayName, setDisplayName] = useState(getInitialUsername());

  const [privateMessageStore, setPrivateMessageStore] = useState({});
  const [login, setLogin] = useState<boolean>(false);
  const [onlineUsersCount, setTotalOnlineUsers] = useState<number>(0);

  const userText = useString('remoteUserDefaultLabel')();
  const pstnUserLabel = useString('pstnUserLabel')();
  const getScreenShareName = useString('screenshareUserName');
  const fromText = useString('messageSenderNotificationLabel');

  let engine = useRef<RtmEngine>(null!);
  const timerValueRef: any = useRef(5);

  const {setSidePanel} = useSidePanel();

  React.useEffect(() => {
    const showMessageNotification = (data: any) => {
      if (data.type === messageActionType.Normal) {
        const {uid, msg} = data;
        Toast.show({
          type: 'success',
          text1: msg.length > 30 ? msg.slice(0, 30) + '...' : msg,
          text2: renderList[parseInt(uid)]?.name
            ? fromText(renderList[parseInt(uid)]?.name)
            : '',
          visibilityTime: 1000,
          onPress: () => {
            setSidePanel(SidePanelType.Chat);
            setUnreadGroupMessageCount(0);
            setGroupActive(true);
          },
        });
      }
    };
    events.on(
      messageChannelType.Public,
      'onPublicMessageReceived',
      (data: any, error: any) => {
        if (!data) return;
        showMessageNotification(data);
      },
    );
    events.on(
      messageChannelType.Private,
      'onPrivateMessageReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.uid === localUid) return;
        showMessageNotification(data);
      },
    );
    return () => {
      // Cleanup the listeners
      events.off(messageChannelType.Public, 'onPublicMessageReceived');
      events.off(messageChannelType.Private, 'onPrivateMessageReceived');
    };
  }, [renderList, messageStore]);

  useEffect(() => {
    // Update the username in localstorage when username changes
    if (setStore) {
      setStore((prevState) => {
        return {
          ...prevState,
          token: store?.token || null,
          displayName: displayName,
        };
      });
    }
    if (callActive) {
      broadcastUserAttributes(
        [
          {
            key: 'name',
            value: displayName,
          },
        ],
        controlMessageEnum.userNameChanged,
      );
    }
  }, [displayName]);

  React.useEffect(() => {
    const handBrowserClose = () => {
      engine.current.leaveChannel(rtcProps.channel);
    };

    if (!isWeb) return;
    window.addEventListener('beforeunload', handBrowserClose);
    // cleanup this component
    return () => {
      window.removeEventListener('beforeunload', handBrowserClose);
    };
  }, []);

  React.useEffect(() => {
    setTotalOnlineUsers(
      $config.EVENT_MODE
        ? [...hostUids, ...audienceUids].length
        : Object.keys(
            filterObject(
              renderList,
              ([k, v]) => v?.type === 'rtc' && !v?.offline,
            ),
          ).length,
    );
  }, [hostUids, audienceUids, renderList]);

  const addMessageToStore = (uid: UidType, msg: {body: string; ts: string}) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: msg.ts, uid: uid, msg: msg.body}];
    });
  };

  const addMessageToPrivateStore = (
    uid: UidType,
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
            {ts: msg.ts, uid: local ? localUid : uid, msg: msg.body},
          ])
        : (newState = {
            ...newState,
            [uid]: [{ts: msg.ts, uid: local ? localUid : uid, msg: msg.body}],
          });
      return {...newState};
    });
  };

  const doLoginAndSetupRTM = async () => {
    try {
      await engine.current.login({
        uid: localUid.toString(),
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
        {key: 'name', value: displayName || userText},
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

  const updateRenderListState = (
    uid: number,
    data: Partial<RenderInterface>,
  ) => {
    dispatch({type: 'UpdateRenderList', value: [uid, data]});
  };

  const updateClientUids = (uid: number, role: ClientRole) => {
    if (role === ClientRole.Broadcaster) {
      setHostUids((prevState) => {
        return prevState.filter((i) => i === uid).length
          ? prevState
          : [...prevState, uid];
      });
      setAudienceUids((prevState) => {
        return prevState.filter((i) => i !== uid);
      });
    } else {
      setAudienceUids((prevState) => {
        return prevState.filter((i) => i === uid).length
          ? prevState
          : [...prevState, uid];
      });
      setHostUids((prevState) => {
        return prevState.filter((i) => i !== uid);
      });
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
              //RTC layer uid type is number. so doing the parseInt to convert to number
              //todo hari check android uid comparsion
              const uid = parseInt(member.uid);
              const role = parseInt(attr?.attributes?.role);
              const screenUid = parseInt(attr?.attributes?.screenUid);
              //start - updating user data in rtc
              const userData = {
                name:
                  String(member.uid)[0] === '1'
                    ? pstnUserLabel
                    : attr?.attributes?.name || userText,
                screenUid: screenUid,
                //below thing for livestreaming
                type: 'rtc',
              };
              updateRenderListState(uid, userData);
              //end- updating user data in rtc

              //start - updating screenshare data in rtc
              const screenShareData = {
                name: getScreenShareName(attr?.attributes?.name || userText),
                //below thing for livestreaming
                type: 'screenshare',
              };
              updateRenderListState(screenUid, screenShareData);
              //end - updating screenshare data in rtc

              //todo hari throw error on access non livestreaming mode
              //updating the client uids for livestreaming
              updateClientUids(uid, role);
              //setting live steam data
              setLiveStreamData((prevState) => {
                return {
                  ...prevState,
                  [uid]: {
                    role: role,
                    requests: attr?.attributes?.requests,
                  },
                };
              });
              //todo hari update with events api
              //setting screenshare data
              setScreenShareData((prevState) => {
                return {
                  ...prevState,
                  [screenUid]: {
                    name: getScreenShareName(
                      attr?.attributes?.name || userText,
                    ),
                    isActive: renderPositionRef.current.renderPosition.filter(
                      (i) => i === screenUid,
                    ).length
                      ? true
                      : false,
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
          const uid = parseInt(data.uid);
          const screenUid = parseInt(attr?.attributes?.screenUid);
          const role = parseInt(attr?.attributes?.role);
          //start - updating user data in rtc
          const userData = {
            name:
              String(data.uid)[0] === '1'
                ? pstnUserLabel
                : attr?.attributes?.name || userText,
            screenUid: screenUid,
            //below thing for livestreaming
            type: 'rtc',
          };
          updateRenderListState(uid, userData);
          //start - updating user data in rtc

          //updating host/audience id for livestreaming
          updateClientUids(uid, role);
          //setting live steam data
          setLiveStreamData((prevState) => {
            return {
              ...prevState,
              [uid]: {
                role: role,
                requests: attr?.attributes?.requests,
              },
            };
          });
          //setting screenshare data
          setScreenShareData((prevState) => {
            return {
              ...prevState,
              [screenUid]: {
                name: getScreenShareName(attr?.attributes?.name || userText),
                isActive: false,
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
      const uid = data?.uid ? parseInt(data?.uid) : undefined;
      if (!uid) return;
      //updating the rtc data
      updateRenderListState(uid, {
        offline: true,
      });
      //setting live steam data
      setLiveStreamData((prevState) => {
        if (prevState[uid]?.role === ClientRole.Broadcaster) {
          setHostUids((prevStateH) => {
            return prevStateH.filter((i) => i !== uid);
          });
        } else {
          setAudienceUids((prevStateA) => {
            return prevStateA.filter((i) => i !== uid);
          });
        }
        return {
          ...prevState,
          [uid]: {
            ...prevState[uid],
            requests: attrRequestTypes.none,
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

      const userUID = isAndroid ? arr[0] : peerId;

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
          /**
           * If individual chat window is not active
           * then increment unread count based on uid
           */
          if (!(individualActiveRef.current === userUID)) {
            setUnreadIndividualMessageCount((prevState) => {
              const prevCount =
                prevState && prevState[userUID] ? prevState[userUID] : 0;
              return {
                ...prevState,
                [userUID]: prevCount + 1,
              };
            });
          }
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
                    const uidAsNumber = parseInt(uid);
                    const roleAsNumber = parseInt(payload.role);
                    updateClientUids(uidAsNumber, roleAsNumber);
                    setLiveStreamData((prevState) => {
                      return {
                        ...prevState,
                        [uidAsNumber]: {
                          ...prevState[uidAsNumber],
                          role: roleAsNumber,
                        },
                      };
                    });
                  }
                }
                break;
              case controlMessageEnum.userNameChanged:
                const {payload: payloadData} = JSON.parse(msg);
                if (payloadData && payloadData.name) {
                  const uidNumber = parseInt(uid);
                  updateRenderListState(uidNumber, {name: payloadData.name});
                  setScreenShareData((prevState) => {
                    return {
                      ...prevState,
                      [renderListRef.current.renderList[uidNumber].screenUid]: {
                        ...prevState[
                          renderListRef.current.renderList[uidNumber].screenUid
                        ],
                        name: getScreenShareName(payloadData.name || userText),
                      },
                    };
                  });
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
            /**
             * if chat group window is not active.
             * then we will increment the unread count
             */
            if (!groupActiveRef.current) {
              setUnreadGroupMessageCount((prevState) => {
                return prevState + 1;
              });
            }
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
    addMessageToStore(localUid, {
      body: messageActionType.Normal + msg,
      ts: timeNow(),
    });
  };

  const sendMessageToUid = async (msg: string, uid: UidType) => {
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

  const sendControlMessageToUid = async (msg: string, uid: UidType) => {
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
    // 2. Update my attributes in rtm and screenshare and livestream
    if ('name' in formattedAttributes) {
      updateRenderListState(localUid, {name: formattedAttributes['name']});
      setScreenShareData((prevState) => {
        return {
          ...prevState,
          [renderListRef.current.renderList[localUid].screenUid]: {
            ...prevState[renderListRef.current.renderList[localUid].screenUid],
            name: getScreenShareName(formattedAttributes['name'] || userText),
          },
        };
      });
    }
    if (
      //'offline' in formattedAttributes ||
      'requests' in formattedAttributes ||
      'role' in formattedAttributes
    ) {
      let updateData: any = {};
      // if ('offline' in formattedAttributes) {
      //   updateData['offline'] = formattedAttributes['offline'];
      // }
      if ('requests' in formattedAttributes) {
        updateData['requests'] = formattedAttributes['requests'];
      }
      if ('role' in formattedAttributes) {
        updateData['role'] = parseInt(formattedAttributes['role']);
        updateClientUids(localUid, parseInt(formattedAttributes['role']));
      }

      setLiveStreamData((prevState) => {
        return {
          ...prevState,
          [localUid]: {
            ...prevState[localUid],
            ...updateData,
          },
        };
      });
    }
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
        localUid: localUid,
        onlineUsersCount,
        events,
        setDisplayName,
        displayName,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
