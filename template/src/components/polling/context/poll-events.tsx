import React, {createContext, useContext, useEffect} from 'react';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {PollItem, usePoll} from './poll-context';

const POLL_ATTRIBUTE = 'polls';
enum PollEventActions {
  sendPoll = 'SEND_POLL',
  sendPollResponse = 'SEND_POLL_RESPONSE',
}

interface PollEventsContextValue {
  sendPollEvt: (poll: PollItem) => void;
  sendPollResponseEvt: (poll: PollItem) => void;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

// Event Dispatcher
function PollEventsProvider({children}: {children?: React.ReactNode}) {
  const sendPollEvt = async (poll: PollItem) => {
    events.send(
      POLL_ATTRIBUTE,
      JSON.stringify({
        action: PollEventActions.sendPoll,
        item: {...poll},
        activePollId: poll.id,
      }),
      PersistanceLevel.Channel,
    );
  };
  const sendPollResponseEvt = async (poll: PollItem) => {
    events.send(
      POLL_ATTRIBUTE,
      JSON.stringify({
        action: PollEventActions.sendPollResponse,
        item: {...poll},
        activePollId: poll.id,
      }),
      PersistanceLevel.Channel,
    );
  };

  const value = {
    sendPollEvt,
    sendPollResponseEvt,
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
  const {savePollForm, launchPollForm} = usePoll();

  useEffect(() => {
    events.on(POLL_ATTRIBUTE, args => {
      const {payload, sender, ts} = args;
      const data = JSON.parse(payload);
      const {action, item, activePollId} = data;
      // console.log(
      //   'supriya POLLS event received data',
      //   args,
      //   data,
      //   item,
      //   activePollId,
      // );
      switch (action) {
        case PollEventActions.sendPoll:
          launchPollForm(item, activePollId);
          break;
        case PollEventActions.sendPollResponse:
          savePollForm(item);
          break;
        default:
          break;
      }
    });

    return () => {
      events.off(POLL_ATTRIBUTE);
    };
  }, [launchPollForm, savePollForm]);

  return (
    <PollEventsSubscriberContext.Provider value={null}>
      {children}
    </PollEventsSubscriberContext.Provider>
  );
}

export {usePollEvents, PollEventsProvider, PollEventsSubscriber};
