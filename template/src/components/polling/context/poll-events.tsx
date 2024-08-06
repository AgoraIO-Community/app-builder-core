import React, {createContext, useContext, useEffect} from 'react';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {PollItem} from './poll-context';

export enum PollEventsEnum {
  POLLS = 'POLLS',
  POLL_LAUNCHED = 'POLL_LAUNCHED',
}

interface PollEventsContextValue {
  sendPoll: (poll: PollItem) => void;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

function PollEventsProvider({children}: {children?: React.ReactNode}) {
  useEffect(() => {
    events.on(PollEventsEnum.POLLS, data => {
      console.log('supriya POLLS event received data', data);
    });
    events.on(PollEventsEnum.POLL_LAUNCHED, data => {
      console.log('supriya POLL_LAUNCHED event received data', data);
    });
    return () => {
      events.off(PollEventsEnum.POLLS);
      events.off(PollEventsEnum.POLL_LAUNCHED);
    };
  }, []);

  const sendPoll = async (poll: PollItem) => {
    events.send(
      PollEventsEnum.POLL_LAUNCHED,
      JSON.stringify({...poll}),
      PersistanceLevel.Channel,
    );
  };

  const value = {
    sendPoll,
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

export {usePollEvents, PollEventsProvider};
