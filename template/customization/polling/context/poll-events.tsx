import React, {createContext, useContext, useEffect} from 'react';
import {PollItem, usePoll} from './poll-context';
import {customEvents as events, PersistanceLevel} from 'customization-api';

enum PollEventNames {
  polls = 'POLLS',
  pollResponse = 'POLL_RESPONSE',
  pollResults = 'POLL_RESULTS',
}
enum PollEventActions {
  sendPoll = 'SEND_POLL',
  sendResponseToPoll = 'SEND_RESONSE_TO_POLL',
  sendPollResults = 'SEND_POLL_RESULTS',
}

type sendResponseToPollEvtFunction = (
  poll: PollItem,
  responses: string | string[],
) => void;
interface PollEventsContextValue {
  sendPollEvt: (poll: PollItem) => void;
  sendResponseToPollEvt: sendResponseToPollEvtFunction;
  sendPollResultsEvt: (poll: PollItem) => void;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

// Event Dispatcher
function PollEventsProvider({children}: {children?: React.ReactNode}) {
  const sendPollEvt = (poll: PollItem) => {
    events.send(
      PollEventNames.polls,
      JSON.stringify({
        action: PollEventActions.sendPoll,
        item: {...poll},
        activePollId: poll.id,
      }),
      PersistanceLevel.Channel,
    );
  };

  const sendResponseToPollEvt: sendResponseToPollEvtFunction = (
    item,
    responses,
  ) => {
    events.send(
      PollEventNames.pollResponse,
      JSON.stringify({
        type: item.type,
        id: item.id,
        responses,
      }),
      PersistanceLevel.None,
    );
  };

  const sendPollResultsEvt = (item: PollItem) => {
    events.send(
      PollEventNames.polls,
      JSON.stringify({
        action: PollEventActions.sendPollResults,
        item: {...item},
        activePollId: '',
      }),
      PersistanceLevel.Channel,
    );
  };

  const value = {
    sendPollEvt,
    sendResponseToPollEvt,
    sendPollResultsEvt,
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
  const {
    savePoll,
    onPollReceived,
    onPollResponseReceived,
    onPollResultsReceived,
  } = usePoll();

  useEffect(() => {
    events.on(PollEventNames.polls, args => {
      // const {payload, sender, ts} = args;
      const {payload} = args;
      const data = JSON.parse(payload);
      const {action, item, activePollId} = data;
      console.log('supriya poll received', data);
      switch (action) {
        case PollEventActions.sendPoll:
          onPollReceived(item, activePollId);
          break;
        case PollEventActions.sendPollResults:
          onPollResultsReceived(item);
          break;
        default:
          break;
      }
    });
    events.on(PollEventNames.pollResponse, args => {
      const {payload, sender, ts} = args;
      const data = JSON.parse(payload);
      console.log('supriya poll response received', data);
      const {type, id, responses} = data;
      onPollResponseReceived(id, type, responses, sender, ts);
    });

    return () => {
      events.off(PollEventNames.polls);
      events.off(PollEventNames.pollResponse);
    };
  }, [onPollReceived, onPollResponseReceived, savePoll, onPollResultsReceived]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
