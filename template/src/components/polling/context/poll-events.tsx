import React, {createContext, useContext, useEffect} from 'react';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {PollItem} from './poll-context';

interface PollEventsContextValue {
  launchPollEvent: (poll: PollItem) => void;
}

const PollEventsContext = createContext<PollEventsContextValue | null>(null);
PollEventsContext.displayName = 'PollEventsContext';

function PollEventsProvider({children}: {children?: React.ReactNode}) {
  useEffect(() => {
    events.on('polls', data => {
      console.log('supriya poll event received data', data);
    });
  }, []);

  const launchPollEvent = async (poll: PollItem) => {
    events.send('polls', JSON.stringify({...poll}), PersistanceLevel.Channel);
  };

  const value = {
    launchPollEvent,
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
