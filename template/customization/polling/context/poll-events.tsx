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
    try {
      events.send(
        PollEventNames.polls,
        JSON.stringify({
          state: {...polls},
          pollId: pollId,
          task,
        }),
        PersistanceLevel.Channel,
      );
    } catch (error) {
      console.log('error while syncing poll: ', error);
    }
  };

  const sendResponseToPollEvt: sendResponseToPollEvtFunction = (
    item,
    responses,
    uid,
    timestamp,
  ) => {
    try {
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
    } catch (error) {
      console.log('error while sending a poll response level 1');
    }
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
  // State variable to track whether the initial load has occurred
  // State variable to track whether the initial load has occurred
  const [initialized, setInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    let initialLoadTimeout: ReturnType<typeof setTimeout>;
    // Set initialLoadTimeout only if initialLoadComplete is false
    if (!initialLoadComplete) {
      initialLoadTimeout = setTimeout(() => {
        log('Initial load timeout reached. Marking initial load as complete.');
        setInitialLoadComplete(true);
      }, 10000); // Adjust the timeout duration as necessary
    }

    events.on(PollEventNames.polls, args => {
      // const {payload, sender, ts} = args;
      const {payload} = args;
      const data = JSON.parse(payload);
      const {state, pollId, task} = data;
      log('poll channel state received', data);
      // Set the initialized flag to true after the first render
      // Determine if it's the initial load or a runtime update
      if (!initialized && !initialLoadComplete) {
        log('Initial load detected');
        // Call onPollReceived with an additional parameter or flag for initial load
        onPollReceived(state, pollId, task, true); // true indicates it's an initial load
        setInitialized(true);
        // Clear the initial load timeout since we have received the initial state
        clearTimeout(initialLoadTimeout);
      } else {
        log('Runtime update detected');
        onPollReceived(state, pollId, task, false); // false indicates it's a runtime update
      }
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
      clearTimeout(initialLoadTimeout);
    };
  }, [
    onPollReceived,
    onPollResponseReceived,
    initialized,
    initialLoadComplete,
  ]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
