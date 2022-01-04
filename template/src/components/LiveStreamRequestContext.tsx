import React, {createContext, useContext, useState} from 'react';
import ChatContext, {
  messageChannelType,
  controlMessageEnum,
} from './ChatContext';

interface liveStreamContext {
  currLiveStreamRequest: Array<number>;
  approveRequestOfUID: (uid: number) => void;
  rejectRequestOfUID: (uid: number) => void;
}

const LiveStreamContext = createContext(null as unknown as liveStreamContext);

export default LiveStreamContext;

export const LiveStreamConsumer = LiveStreamContext.Consumer;

export const LiveStreamRequestProvider: React.FC = (props) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  const [currLiveStreamRequest, setLiveStreamRequest] = useState<Array<number>>(
    [],
  );

  const {events} = React.useContext(ChatContext);

  React.useEffect(() => {
    events.on(
      messageChannelType.Public,
      'onLiveStreamRequestReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.msg === '8') {
          console.log('hey sus received a channel message');
          setLiveStreamRequest((oldLiveStreamRequest) => [
            ...oldLiveStreamRequest,
            data.uid,
          ]);
        }
      },
    );
  }, [events]);

  const updateCurrentLiveStreamRequest = (uid: number | string) => {
    setLiveStreamRequest(
      currLiveStreamRequest.filter(
        (liveStreamUserId) => liveStreamUserId != uid,
      ),
    );
  };

  const approveRequestOfUID = (uid: number | string) => {
    // SUP TODO: Add toast notitications
    updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(controlMessageEnum.raiseHandRequestAccepted, uid);
  };

  const rejectRequestOfUID = (uid: number | string) => {
    // SUP TODO: Add toast notitications
    updateCurrentLiveStreamRequest(uid);
    sendControlMessageToUid(controlMessageEnum.raiseHandRequestRejected, uid);
  };

  return (
    <LiveStreamContext.Provider
      value={{currLiveStreamRequest, approveRequestOfUID, rejectRequestOfUID}}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};
