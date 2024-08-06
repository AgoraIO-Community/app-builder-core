import React, {createContext, useReducer, Dispatch, useState} from 'react';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import {usePollEvents} from './poll-events';

enum PollAccess {
  PUBLIC = 'PUBLIC',
}

enum PollStatus {
  ACTIVE = 'PUBLIC',
  FINISHED = 'FINISHED',
  LATER = 'LATER',
}

enum PollKind {
  OPEN_ENDED = 'OPEN_ENDED',
  MCQ = 'MCQ',
  YES_NO = 'YES_NO',
}

type PollCurrentStep =
  | 'START_POLL'
  | 'SELECT_POLL'
  | 'CREATE_POLL'
  | 'PREVIEW_POLL';

interface PollItem {
  id: string;
  type: PollKind;
  access: PollAccess; // remove it as poll are not private or public but the response will be public or private
  status: PollStatus;
  question: string;
  answers:
    | [
        {
          uid: number;
          response: string;
          timestamp: number;
        },
      ]
    | null;
  options: Array<{
    text: string;
    value: string;
    votes: [{uid: number; access: PollAccess; timestamp: number}];
  }> | null;
  multiple_response: boolean;
  share: boolean;
  duration: boolean;
  timer: number;
  createdBy: number;
}

interface Poll {
  [key: string]: PollItem[];
}

enum PollActionKind {
  ADD_POLL_ITEM = 'ADD_POLL_ITEM',
  LAUNCH_POLL = 'LAUNCH_POLL',
}

type PollAction =
  | {
      type: PollActionKind.ADD_POLL_ITEM;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.LAUNCH_POLL;
      payload: {pollID: string};
    };

function pollReducer(state: Poll, action: PollAction): Poll {
  switch (action.type) {
    case PollActionKind.ADD_POLL_ITEM: {
      const userUid = action.payload.item.createdBy;
      const pollId = action.payload.item.id;
      return {
        ...state,
        [userUid]: {
          [pollId]: {...action.payload.item},
        },
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
  startPollForm: () => void;
  savePollItem: (item: PollItem) => void;
  currentStep: PollCurrentStep;
  setCurrentStep: (item: PollCurrentStep) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [currentStep, setCurrentStep] = useState<PollCurrentStep>(null);
  const {sendPoll} = usePollEvents();
  const [polls, dispatch] = useReducer(pollReducer, {});
  console.log('supriya polls state: ', polls);

  const startPollForm = () => {
    setCurrentStep('SELECT_POLL');
  };

  const savePollItem = (item: PollItem) => {
    if (item.status === PollStatus.ACTIVE) {
      dispatch({
        type: PollActionKind.ADD_POLL_ITEM,
        payload: {
          item: {...item},
        },
      });
      sendPoll(item);
    } else {
      dispatch({
        type: PollActionKind.ADD_POLL_ITEM,
        payload: {
          item: {...item},
        },
      });
    }
  };

  const value = {
    polls,
    dispatch,
    savePollItem,
    currentStep,
    setCurrentStep,
    startPollForm,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

function usePoll() {
  const context = React.useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
}

export {
  PollProvider,
  usePoll,
  PollActionKind,
  PollKind,
  PollStatus,
  PollAccess,
};

export type {PollItem, PollCurrentStep};
