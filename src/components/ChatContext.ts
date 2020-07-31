import RtmEngine from 'agora-react-native-rtm';
import {createContext} from 'react';

export interface channelMessage {
  type: string;
  msg: string;
  ts: string;
  uid: string;
}

export interface messageStoreInterface {
  ts: string;
  uid: string;
  msg: string;
}
interface chatContext {
  messageStore: messageStoreInterface | any;
  sendMessage: (msg: string) => void;
  engine: RtmEngine;
  localUid: string;
}

const ChatContext = createContext((null as unknown) as chatContext);

export default ChatContext;
