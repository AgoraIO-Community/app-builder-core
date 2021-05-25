import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ChatContext, {controlMessageEnum} from './ChatContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {messageStoreInterface} from './ChatContext';
import {Platform} from 'react-native';
import {backOff} from 'exponential-backoff';

export enum mType {
  Control = '0',
  Normal = '1',
}

export enum UserType {
  Normal,
  ScreenShare,
}

const RtmConfigure = (props: any) => {
  const {setRecordingActive, callActive, name} = props;
  const {rtcProps} = useContext(PropsContext);
  const {dispatch} = useContext(RtcContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [privateMessageStore, setPrivateMessageStore] = useState({});
  const [login, setLogin] = useState<boolean>(false);
  const [userList, setUserList] = useState({});
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
    // console.log(privateMessageStore);
  };

  const init = async () => {
    engine.current = new RtmEngine();
    rtcProps.uid
      ? (localUid.current = rtcProps.uid + '')
      : (localUid.current = '' + new Date().getTime());
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
          let arr = new Int32Array(1);
          arr[0] = parseInt(data.uid);
          setUserList((prevState) => {
            return {
              ...prevState,
              [Platform.OS === 'android' ? arr[0] : data.uid]: {
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
      let arr = new Int32Array(1);
      arr[0] = parseInt(data.uid);
      setUserList((prevState) => {
        const uid: number = Platform.OS === 'android' ? arr[0] : data.uid;
        const screenuid: number = prevState[uid].screenUid;
        const {[uid]: _user, [screenuid]: _screen, ...newState} = prevState;
        return newState;
      });
    });
    engine.current.on('messageReceived', (evt: any) => {
      let {text} = evt;
      // console.log('messageReceived: ', evt);
      if (text[0] === mType.Control) {
        console.log('Control: ', text);
        if (text.slice(1) === controlMessageEnum.muteVideo) {
          // console.log('dispatch', dispatch);
          dispatch({
            type: 'LocalMuteVideo',
            value: [true],
          });
        } else if (text.slice(1) === controlMessageEnum.muteAudio) {
          dispatch({
            type: 'LocalMuteAudio',
            value: [true],
          });
        } else if (text.slice(1) === controlMessageEnum.kickUser) {
          dispatch({
            type: 'EndCall',
            value: [],
          });
        }
      } else if (text[0] === mType.Normal) {
        let arr = new Int32Array(1);
        arr[0] = parseInt(evt.peerId);
        // console.log(evt);
        let hours = new Date(evt.ts).getHours;
        if (isNaN(hours)) {
          evt.ts = new Date().getTime();
        }
        addMessageToPrivateStore(
          Platform.OS === 'android' ? arr[0] : evt.peerId,
          evt.text,
          evt.ts,
          false,
        );
      }
    });
    engine.current.on('channelMessageReceived', (evt) => {
      let {uid, channelId, text, ts} = evt;
      // if (uid < 0) {
      //   uid = uid + parseInt(0xFFFFFFFF) + 1;
      // }
      let arr = new Int32Array(1);
      arr[0] = parseInt(uid);
      Platform.OS ? (uid = arr[0]) : {};
      // console.log(evt);
      if (ts === 0) {
        ts = new Date().getTime();
      }
      if (channelId === rtcProps.channel) {
        if (text[0] === mType.Control) {
          console.log('Control: ', text);
          if (text.slice(1) === controlMessageEnum.muteVideo) {
            // console.log('dispatch', dispatch);
            dispatch({
              type: 'LocalMuteVideo',
              value: [true],
            });
          } else if (text.slice(1) === controlMessageEnum.muteAudio) {
            dispatch({
              type: 'LocalMuteAudio',
              value: [true],
            });
          } else if (
            text.slice(1) === controlMessageEnum.cloudRecordingActive
          ) {
            setRecordingActive(true);
          } else if (
            text.slice(1) === controlMessageEnum.cloudRecordingUnactive
          ) {
            setRecordingActive(false);
          }
        } else if (text[0] === mType.Normal) {
          addMessageToStore(uid, text, ts);
        }
      }
    });
    engine.current.createClient(rtcProps.appId);
    await engine.current.login({
      uid: localUid.current,
      token: rtcProps.rtm,
    });
    if (name) {
      await engine.current.setLocalUserAttributes([
        {key: 'name', value: name},
        {key: 'screenUid', value: String(rtcProps.screenShareUid)},
      ]);
    } else {
      await engine.current.setLocalUserAttributes([
        {key: 'name', value: 'User'},
      ]);
    }
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
            let arr = new Int32Array(1);
            arr[0] = parseInt(data.uid);
            setUserList((prevState) => {
              return {
                ...prevState,
                [Platform.OS === 'android' ? arr[0] : member.uid]: {
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
    if (msg !== '') {
      await (engine.current as RtmEngine).sendMessageByChannelId(
        rtcProps.channel,
        mType.Normal + msg,
      );
    }
    let ts = new Date().getTime();
    if (msg !== '') {
      addMessageToStore(localUid.current, mType.Normal + msg, ts);
    }
  };
  const sendMessageToUid = async (msg: string, uid: number) => {
    let adjustedUID = uid;
    if (adjustedUID < 0) {
      adjustedUID = uid + parseInt(0xffffffff) + 1;
    }
    let ts = new Date().getTime();
    if (msg !== '') {
      await (engine.current as RtmEngine).sendMessageToPeer({
        peerId: adjustedUID.toString(),
        offline: false,
        text: mType.Normal + '' + msg,
      });
    }
    // console.log(ts);
    if (msg !== '') {
      addMessageToPrivateStore(uid, mType.Normal + msg, ts, true);
    }
  };
  const sendControlMessage = async (msg: string) => {
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      mType.Control + msg,
    );
  };
  const sendControlMessageToUid = async (msg: string, uid: number) => {
    let adjustedUID = uid;
    if (adjustedUID < 0) {
      adjustedUID = uid + parseInt(0xffffffff) + 1;
    }
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: adjustedUID.toString(),
      offline: false,
      text: mType.Control + '' + msg,
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
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
