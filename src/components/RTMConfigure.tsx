import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ChatContext, {controlMessageEnum} from './ChatContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {messageStoreInterface} from '../components/ChatContext';

enum mType {
  Control = '0',
  Normal = '1',
}

const RtmConfigure = (props: any) => {
  const {setRecordingActive} = props;
  const {rtcProps} = useContext(PropsContext);
  const {dispatch} = useContext(RtcContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [login, setLogin] = useState<boolean>(false);
  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');
  // const [peersRTM, setPeersRTM] = useState<Array<string>>([]);
  const addMessageToStore = (uid: string, text: string, ts: string) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: ts, uid: uid, msg: text}];
    });
  };

  const init = async () => {
    engine.current = new RtmEngine();
    rtcProps.uid
      ? (localUid.current = rtcProps.uid + '')
      : (localUid.current = '' + new Date().getTime());
    engine.current.on('error', (evt: any) => {
      console.log(evt);
    });
    // engine.current.on('channelMemberJoined', (uid: any) => {
    //   setPeersRTM([...peersRTM, uid]);
    //   console.log({peersRTM});
    // });
    // engine.current.on('channelMemberLeft', (uid: any) => {
    //   setPeersRTM([...peersRTM].filter(uid));
    //   console.log({peersRTM});
    // });
    engine.current.on('messageReceived', (evt: any) => {
      let {text} = evt;
      console.log('messageReceived: ', evt);
      if (text[0] === mType.Control) {
        console.log('Control: ', text);
        if (text.slice(1) === controlMessageEnum.muteVideo) {
          console.log('dispatch', dispatch);
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
        // else if (text.slice(1) === controlMessageEnum.muteSingleVideo) {
        //     if (text.slice(2) === localRTCUid) {
        //       dispatch({
        //         type: 'LocalMuteAudio',
        //         value: [true],
        //       });
        //     }
        //   }
      }
    });
    engine.current.on('channelMessageReceived', (evt) => {
      let {uid, channelId, text, ts} = evt;
      console.log(evt);
      if (ts === '0') {
        ts = new Date().getTime();
      }
      if (channelId === rtcProps.channel) {
        if (text[0] === mType.Control) {
          console.log('Control: ', text);
          if (text.slice(1) === controlMessageEnum.muteVideo) {
            console.log('dispatch', dispatch);
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
    await engine.current.login({uid: localUid.current, token: rtcProps.token});
    await engine.current.joinChannel(rtcProps.channel);
    setLogin(true);
    console.log('RTM init done.', engine.current);
  };

  const sendMessage = async (msg: string) => {
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      mType.Normal + msg,
    );
    let ts = '' + new Date().getTime;
    addMessageToStore(localUid.current, mType.Normal + msg, ts);
  };

  const sendControlMessage = async (msg: string) => {
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      mType.Control + msg,
    );
  };
  const sendControlMessageToUid = async (msg: string, uid: number) => {
    console.log('sendcmtouid:', {
      peerId: uid.toString(),
      offline: false,
      text: mType.Control + '' + msg,
    });
    await (engine.current as RtmEngine).sendMessageToPeer({
      peerId: uid.toString(),
      offline: false,
      text: mType.Control + '' + msg,
    });
  };
  const end = async () => {
    await (engine.current as RtmEngine).logout();
    await (engine.current as RtmEngine).destroyClient();
    setLogin(false);
    console.log('RTM cleanup done.', engine.current);
  };

  useEffect(() => {
    init();
    return () => {
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.channel, rtcProps.appId]);

  return (
    <ChatContext.Provider
      value={{
        messageStore,
        sendControlMessage,
        sendControlMessageToUid,
        sendMessage,
        engine: engine.current,
        localUid: localUid.current,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
