import React, {createContext, useContext, useEffect} from 'react';
import {Poll, usePoll} from './poll-context';
import {customEvents as events, PersistanceLevel} from 'customization-api';

enum PollEventNames {
  polls = 'POLLS',
  pollResponse = 'POLL_RESPONSE',
}
enum PollEventActions {
  sendPoll = 'SEND_POLL',
  sendResponseToPoll = 'SEND_RESONSE_TO_POLL',
  sendPollResults = 'SEND_POLL_RESULTS',
}

type sendResponseToPollEvtFunction = (
  id: string,
  responses: string | string[],
  uid: number,
  timestamp: number,
) => void;

interface PollEventsContextValue {
  sendPollEvt: (polls: Poll, pollId: string) => void;
  sendResponseToPollEvt: sendResponseToPollEvtFunction;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

// Event Dispatcher
function PollEventsProvider({children}: {children?: React.ReactNode}) {
  const sendPollEvt = (polls: Poll, pollId: string) => {
    events.send(
      PollEventNames.polls,
      JSON.stringify({
        state: {...polls},
        action: PollEventActions.sendPoll,
        pollId: pollId,
      }),
      PersistanceLevel.Channel,
    );
  };

  const sendResponseToPollEvt: sendResponseToPollEvtFunction = (
    id,
    responses,
    uid,
    timestamp,
  ) => {
    events.send(
      PollEventNames.pollResponse,
      JSON.stringify({
        id,
        responses,
        uid,
        timestamp,
      }),
      PersistanceLevel.None,
    );
  };

  const value = {
    sendPollEvt,
    sendResponseToPollEvt,
  };

  return (
    <PollEventsContext.Provider value={value}>
      {children}
    </PollEventsContext.Provider>
  );
}

function usePollEvents() {
  const context = useContext(PollEventsContext);
  if (!context) {
    throw new Error('usePollEvents must be used within PollEventsProvider.');
  }
  return context;
}

// Event Subscriber
const PollEventsSubscriberContext = createContext<null>(null);
PollEventsSubscriberContext.displayName = 'PollEventsContext';

function PollEventsSubscriber({children}: {children?: React.ReactNode}) {
  const {onPollReceived, onPollResponseReceived} = usePoll();

  useEffect(() => {
    events.on(PollEventNames.polls, args => {
      // const {payload, sender, ts} = args;
      const {payload} = args;
      const data = JSON.parse(payload);
      const {action, state, pollId} = data;
      console.log('supriya poll state received', data);
      switch (action) {
        case PollEventActions.sendPoll:
          onPollReceived(state, pollId);
          break;
        default:
          break;
      }
    });
    events.on(PollEventNames.pollResponse, args => {
      const {payload} = args;
      const data = JSON.parse(payload);
      console.log('supriya poll response received', data);
      const {id, responses, uid, timestamp} = data;
      onPollResponseReceived(id, responses, uid, timestamp);
    });

    return () => {
      events.off(PollEventNames.polls);
      events.off(PollEventNames.pollResponse);
    };
  }, [onPollReceived, onPollResponseReceived]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
