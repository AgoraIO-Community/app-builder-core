import React, {createContext, useContext, useEffect, useState} from 'react';
import {Poll, PollItem, PollTaskRequestTypes, usePoll} from './poll-context';
import {customEvents as events, PersistanceLevel} from 'customization-api';
import {log} from '../helpers';

enum PollEventNames {
  polls = 'POLLS',
  pollResponse = 'POLL_RESPONSE',
}

type sendResponseToPollEvtFunction = (
  item: PollItem,
  responses: string | string[],
  uid: number,
  timestamp: number,
) => void;

interface PollEventsContextValue {
  syncPollEvt: (
    polls: Poll,
    pollId: string,
    task: PollTaskRequestTypes,
  ) => void;
  sendResponseToPollEvt: sendResponseToPollEvtFunction;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

// Event Dispatcher
function PollEventsProvider({children}: {children?: React.ReactNode}) {
  const syncPollEvt = (
    polls: Poll,
    pollId: string,
    task: PollTaskRequestTypes,
  ) => {
    events.send(
      PollEventNames.polls,
      JSON.stringify({
        state: {...polls},
        pollId: pollId,
        task,
      }),
      PersistanceLevel.Channel,
    );
  };

  const sendResponseToPollEvt: sendResponseToPollEvtFunction = (
    item,
    responses,
    uid,
    timestamp,
  ) => {
    events.send(
      PollEventNames.pollResponse,
      JSON.stringify({
        id: item.id,
        responses,
        uid,
        timestamp,
      }),
      PersistanceLevel.None,
      item.createdBy,
    );
  };

  const value = {
    syncPollEvt,
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
  const [isInitialized, setIsInitialized] = useState(false); // Track the initialization state

  useEffect(() => {
    events.on(PollEventNames.polls, args => {
      // const {payload, sender, ts} = args;
      const {payload} = args;
      const data = JSON.parse(payload);
      const {state, pollId, task} = data;
      log('poll channel state received', data);
      // Set the initialized flag to true after the first render
      onPollReceived(state, pollId, task, isInitialized);
      setIsInitialized(true);
      // switch (action) {
      //   case PollEventActions.savePoll:
      //     log('on poll saved');
      //     onPollReceived(state, pollId, task);
      //     break;
      //   case PollEventActions.sendPoll:
      //     log('on poll received');
      //     onPollReceived(state, pollId, task);
      //     break;
      //   default:
      //     break;
      // }
    });
    events.on(PollEventNames.pollResponse, args => {
      const {payload} = args;
      const data = JSON.parse(payload);
      log('poll response received', data);
      const {id, responses, uid, timestamp} = data;
      onPollResponseReceived(id, responses, uid, timestamp);
    });

    return () => {
      events.off(PollEventNames.polls);
      events.off(PollEventNames.pollResponse);
    };
  }, [onPollReceived, onPollResponseReceived, isInitialized]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
