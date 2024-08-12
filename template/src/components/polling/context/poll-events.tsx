import React, {createContext, useContext, useEffect} from 'react';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {PollItem, usePoll} from './poll-context';

enum PollEventNames {
  polls = 'POLLS',
  pollResponse = 'POLL_RESPONSE',
}
enum PollEventActions {
  sendPoll = 'SEND_POLL',
  sendResponseToPoll = 'SEND_RESONSE_TO_POLL',
}

type sendResponseToPollEvtFunction = (
  poll: PollItem,
  responses: string | string[],
) => void;
interface PollEventsContextValue {
  sendPollEvt: (poll: PollItem) => void;
  sendResponseToPollEvt: sendResponseToPollEvtFunction;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

// Event Dispatcher
function PollEventsProvider({children}: {children?: React.ReactNode}) {
  const sendPollEvt = async (poll: PollItem) => {
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
  const {savePoll, onPollReceived, onPollResponseReceived} = usePoll();

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
  }, [onPollReceived, onPollResponseReceived, savePoll]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
