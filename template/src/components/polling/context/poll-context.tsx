import React, {createContext, useState} from 'react';
import {type PollItem} from './poll-form-context';

interface Poll {
  [key: string]: PollItem;
}

const PollContext = createContext(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  // const [state, dispatch] = React.useReducer(pollReducer, {
  //   form: null,
  //   nextUserActivity: 'SELECT_NEW_POLL',
  //   poll: {},
  // });
  const [polls, setPolls] = useState(null);

  const value = {polls, setPolls};
  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

function usePoll() {
  const context = React.useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
}

export {PollProvider, usePoll};
