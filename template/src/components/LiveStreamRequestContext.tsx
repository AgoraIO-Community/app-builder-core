import React, {createContext, useContext, useState} from 'react';
import ChatContext, {messageChannelType} from './ChatContext';

const LiveStreamContext = createContext<Array<number>>([]);

export default LiveStreamContext;

export const LiveStreamConsumer = LiveStreamContext.Consumer;

export const LiveStreamRequestProvider: React.FC = (props) => {
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

  return (
    <LiveStreamContext.Provider value={currLiveStreamRequest}>
      {props.children}
    </LiveStreamContext.Provider>
  );
};
