import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ChatContext from './ChatContext';
import {messageStoreInterface} from '../components/ChatContext';

enum mType {
  Control = '0',
  Normal = '1',
}

const RtmConfigure = (props: any) => {
  const {rtcProps} = useContext(PropsContext);
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [login, setLogin] = useState<boolean>(false);
  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');

  const addMessageToStore = (uid: string, text: string, ts: string) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: ts, uid: uid, msg: text}];
    });
  };

  const init = async () => {
    engine.current = new RtmEngine();
    localUid.current = '' + new Date().getTime();
    engine.current.on('error', (evt: any) => {
      console.log(evt);
    });
    engine.current.on('channelMessageReceived', (evt: any) => {
      let {uid, channelId, text, ts} = evt;
      console.log(evt);
      if (ts === '0') {
        ts = new Date().getTime();
      }
      if (channelId === rtcProps.channel) {
        if (text[0] === mType.Control) {
          console.log('Control: ', text);
        } else if (text[0] === mType.Normal) {
          addMessageToStore(uid, text, ts);
        }
      }
    });
    engine.current.createClient(rtcProps.appId);
    await engine.current.login({uid: localUid.current});
    await engine.current.joinChannel(rtcProps.channel);
    console.log('Join channel success');
    setLogin(true);
  };

  const sendMessage = async (msg: string) => {
    await (engine.current as RtmEngine).sendMessageByChannelId(
      rtcProps.channel,
      mType.Normal + msg,
    );
    let ts = '' + new Date().getTime;
    addMessageToStore(localUid.current, mType.Normal + msg, ts);
  };

  const end = async () => {
    await (engine.current as RtmEngine).leaveChannel(rtcProps.channel);
    await (engine.current as RtmEngine).logout();
    (engine.current as RtmEngine).destroyClient;
    setLogin(false);
  };

  useEffect(() => {
    init();
    console.log('RTM init done.', engine.current);
    return () => {
      console.log('RTM cleanup.', engine.current);
      end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtcProps.channel, rtcProps.appId]);

  return (
    <ChatContext.Provider
      value={{
        messageStore,
        sendMessage,
        engine: engine.current,
        localUid: localUid.current,
      }}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
