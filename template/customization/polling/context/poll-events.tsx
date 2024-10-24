import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  user: {name: string; uid: number},
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
  // Sync poll event handler
  const syncPollEvt = useCallback(
    (polls: Poll, pollId: string, task: PollTaskRequestTypes) => {
      log('syncPollEvt called', {polls, pollId, task});
      try {
        if (!polls || !pollId || !task) {
          throw new Error('Invalid arguments provided to syncPollEvt.');
        }
        events.send(
          PollEventNames.polls,
          JSON.stringify({
            state: {...polls},
            pollId: pollId,
            task,
          }),
          PersistanceLevel.Channel,
        );
        log('Poll sync successful', {pollId, task});
      } catch (error) {
        console.error('Error while syncing poll: ', error);
      }
    },
    [],
  );

  // Send response to poll handler
  const sendResponseToPollEvt: sendResponseToPollEvtFunction = useCallback(
    (item, responses, user, timestamp) => {
      log('sendResponseToPollEvt called', {item, responses, user, timestamp});
      try {
        if (!item || !item.id || !responses || !user.uid) {
          throw new Error(
            'Invalid arguments provided to sendResponseToPollEvt.',
          );
        }
        if (!item?.createdBy?.uid) {
          throw new Error(
            'Poll createdBy is null, cannot send response to creator',
          );
        }
        events.send(
          PollEventNames.pollResponse,
          JSON.stringify({
            id: item.id,
            responses,
            user,
            timestamp,
          }),
          PersistanceLevel.None,
          item.createdBy.uid,
        );
        log('Poll response sent successfully', {pollId: item.id});
      } catch (error) {
        console.error('Error while sending a poll response: ', error);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      syncPollEvt,
      sendResponseToPollEvt,
    }),
    [syncPollEvt, sendResponseToPollEvt],
  );

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

  // Use refs to hold the stable references of callbacks
  const onPollReceivedRef = useRef(onPollReceived);
  const onPollResponseReceivedRef = useRef(onPollResponseReceived);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onPollReceivedRef.current = onPollReceived;
    onPollResponseReceivedRef.current = onPollResponseReceived;
  }, [onPollReceived, onPollResponseReceived]);

  useEffect(() => {
    if (!onPollReceivedRef.current || !onPollResponseReceivedRef.current) {
      log('PollEventsSubscriber ref not intialized.');
      return;
    }
    log('PollEventsSubscriber useEffect triggered.');
    log('PollEventsSubscriber is app initialized ?', initialized);
    let initialLoadTimeout: ReturnType<typeof setTimeout>;
    // Set initialLoadTimeout only if initialLoadComplete is false
    if (!initialLoadComplete) {
      log('Setting initial load timeout.');
      initialLoadTimeout = setTimeout(() => {
        log('Initial load timeout reached. Marking initial load as complete.');
        setInitialLoadComplete(true);
      }, 3000); // Adjust the timeout duration as necessary
    }

    events.on(PollEventNames.polls, args => {
      try {
        log('PollEventNames.polls event received', args);
        const {payload} = args;
        const data = JSON.parse(payload);
        const {state, pollId, task} = data;
        log('Poll data received and parsed successfully:', data);
        // Determine if it's the initial load or a runtime update
        if (!initialized && !initialLoadComplete) {
          log('Initial load detected.');
          // Call onPollReceived with an additional parameter or flag for initial load
          onPollReceivedRef.current(state, pollId, task, true); // true indicates it's an initial load
          setInitialized(true);
          // Clear the initial load timeout since we have received the initial state
          clearTimeout(initialLoadTimeout);
        } else {
          log('Runtime update detected');
          onPollReceivedRef.current(state, pollId, task, false); // false indicates it's a runtime update
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
      } catch (error) {
        log('Error handling poll event:', error);
      }
    });
    events.on(PollEventNames.pollResponse, args => {
      try {
        log('PollEventNames.pollResponse event received', args);
        const {payload} = args;
        const data = JSON.parse(payload);
        log('poll response received', data);
        const {id, responses, user, timestamp} = data;
        log('Poll response data parsed successfully:', data);
        onPollResponseReceivedRef.current(id, responses, user, timestamp);
      } catch (error) {
        log('Error handling poll response event:', error);
      }
    });

    return () => {
      log('Cleaning up PollEventsSubscriber event listeners.');
      events.off(PollEventNames.polls);
      events.off(PollEventNames.pollResponse);
      clearTimeout(initialLoadTimeout);
    };
  }, [initialized, initialLoadComplete]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
