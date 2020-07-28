import React, {useState, useContext, useEffect, useRef} from 'react';
import RtmEngine from 'agora-react-native-rtm';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ChatContext from './ChatContext';

enum mType {
  Control = '0',
  Normal = '1',
}

interface messageStore {
  Array: {
    ts: string;
    uid: string;
    msg: string;
  };
}

const RtmConfigure = (props: any) => {
  const {rtcProps} = useContext(PropsContext);
  const [messageStore, setMessageStore] = useState<messageStore>([]);
  const [login, setLogin] = useState<boolean>(false);
  let engine = useRef<RtmEngine | null>(null);
  let localUid: string;

  const addMessageToStore = (uid: string, text: string, ts: string) => {
    setMessageStore((m) => {
      return [...m, {ts: ts, uid: uid, msg: text}];
    });
  };

  const init = async () => {
    engine.current = new RtmEngine();
    localUid = '' + new Date().getTime();
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
    await engine.current.login({uid: localUid});
    await engine.current.joinChannel(rtcProps.channel);
    console.log('Join channel success');
    setLogin(true);
  };

  const sendMessage = async (msg: string) => {
    await (engine.current as RtmEngine).sendMessageByChannelId(rtcProps.channel, '1' + msg);
    let ts = '' + new Date().getTime;
    addMessageToStore(localUid, '1' + msg, ts);
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
      value={{messageStore, sendMessage, engine: engine.current, localUid}}>
      {login ? props.children : <></>}
    </ChatContext.Provider>
  );
};

export default RtmConfigure;
