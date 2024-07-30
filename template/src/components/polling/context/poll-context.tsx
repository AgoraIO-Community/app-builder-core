import React, {createContext, useReducer, Dispatch} from 'react';
import {type PollItem} from './poll-form-context';

interface Poll {
  [key: string]: PollItem;
}

enum PollActionKind {
  ADD_FINAL_POLL_ITEM = 'ADD_FINAL_POLL_ITEM',
}

type PollAction = {
  type: PollActionKind.ADD_FINAL_POLL_ITEM;
  payload: {item: Poll};
};

function pollReducer(state: Poll, action: PollAction): Poll {
  switch (action.type) {
    case PollActionKind.ADD_FINAL_POLL_ITEM: {
      return {
        ...state,
        ...action.payload.item,
      };
    }
    default: {
      return state;
    }
  }
}

interface PollContextValue {
  polls: Poll;
  dispatch: Dispatch<PollAction>;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const value = {polls, dispatch};
  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

function usePoll() {
  const context = React.useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
}

export {PollProvider, usePoll, PollActionKind};
