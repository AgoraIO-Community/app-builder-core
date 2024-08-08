import React, {createContext, useReducer, Dispatch, useState} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useLiveStreamDataContext} from '../../../components/contexts/LiveStreamDataContext';
import {
  getPollExpiresAtTime,
  POLL_DURATION,
} from '../components/form/form-config';

enum PollAccess {
  PUBLIC = 'PUBLIC',
}

enum PollStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  LATER = 'LATER',
}

enum PollKind {
  OPEN_ENDED = 'OPEN_ENDED',
  MCQ = 'MCQ',
  YES_NO = 'YES_NO',
}

type PollCurrentStep = 'CREATE_POLL' | 'RESPOND_TO_POLL' | 'SHARE_POLL';

interface PollItem {
  id: string;
  type: PollKind;
  access: PollAccess; // remove it as poll are not private or public but the response will be public or private
  status: PollStatus;
  question: string;
  answers:
    | {
        uid: number;
        response: string;
        timestamp: number;
      }[]
    | null;
  options: Array<{
    text: string;
    value: string;
    votes: [{uid: number; access: PollAccess; timestamp: number}];
  }> | null;
  multiple_response: boolean;
  share: boolean;
  duration: boolean;
  expiresAt: number;
  createdBy: number;
}

type Poll = Record<string, PollItem>;

interface PollFormErrors {
  question?: {
    message: string;
  };
  options?: {
    message: string;
  };
}

enum PollActionKind {
  ADD_OR_UPDATE_POLL_ITEM = 'ADD_OR_UPDATE_POLL_ITEM',
  LAUNCH_POLL_ITEM = 'LAUNCH_POLL_ITEM',
  SUBMIT_POLL_OPEN_ENDED_RESPONSE = 'SUBMIT_POLL_OPEN_ENDED_RESPONSE',
  START_POLL_TIMER = 'START_POLL_TIMER',
}

type PollAction =
  | {
      type: PollActionKind.ADD_OR_UPDATE_POLL_ITEM;
      payload: {item: PollItem; pollId?: string};
    }
  | {
      type: PollActionKind.START_POLL_TIMER;
      payload: {item: PollItem};
    };
// | {
//     type: PollActionKind.SUBMIT_POLL_OPEN_ENDED_RESPONSE;
//     payload: {
//       pollId: string;
//       answerItem: {
//         uid: number;
//         response: string;
//         timestamp: number;
//       };
//     };
//   };

function pollReducer(state: Poll, action: PollAction): Poll {
  switch (action.type) {
    case PollActionKind.ADD_OR_UPDATE_POLL_ITEM: {
      const pollId = action.payload.item.id;
      return {
        ...state,
        [pollId]: {...action.payload.item},
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
  savePollForm: (item: PollItem) => void;
  sendPollForm: (item: PollItem) => void;
  currentStep: PollCurrentStep;
  launchPollForm: (item: PollItem, launchId: string) => void;
  launchPollId: string;
  onSubmitPollResponse: (item: PollItem, response: any) => void;
  goToShareResponseModal: () => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [currentStep, setCurrentStep] = useState<PollCurrentStep>(null);
  const [launchPollId, setLaunchPollId] = useState<string>(null);
  const localUid = useLocalUid();
  const {audienceUids, hostUids} = useLiveStreamDataContext();

  const {sendPollEvt, sendPollResponseEvt} = usePollEvents();

  const startPollForm = () => {
    setCurrentStep('CREATE_POLL');
  };

  const savePollForm = (item: PollItem) => {
    addOrUpdatePollItem(item);
    setCurrentStep(null);
  };

  const sendPollForm = (item: PollItem) => {
    if (item.status === PollStatus.ACTIVE) {
      item.expiresAt = getPollExpiresAtTime(POLL_DURATION);
      sendPollEvt(item);
      setCurrentStep(null);
    } else {
      console.error('Poll: Cannot send poll as the status is not active');
    }
  };

  const launchPollForm = (item: PollItem, launchId: string) => {
    addOrUpdatePollItem(item);
    if (audienceUids.includes(localUid)) {
      setLaunchPollId(launchId);
      setCurrentStep('RESPOND_TO_POLL');
    }
  };

  const onSubmitPollResponse = (item: PollItem, response: any) => {
    if (item.type === PollKind.OPEN_ENDED) {
      sendPollResponseEvt({
        ...item,
        answers: [
          ...(Array.isArray(item.answers) ? item.answers : []),
          {uid: localUid, response, timestamp: Date.now()},
        ],
      });
      // setLaunchPollId(null);
    }
  };

  const addOrUpdatePollItem = (item: PollItem) => {
    dispatch({
      type: PollActionKind.ADD_OR_UPDATE_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
  };

  const goToShareResponseModal = () => {
    setCurrentStep('SHARE_POLL');
  };

  const value = {
    polls,
    dispatch,
    startPollForm,
    savePollForm,
    sendPollForm,
    launchPollForm,
    currentStep,
    launchPollId,
    onSubmitPollResponse,
    goToShareResponseModal,
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

export type {PollItem, PollCurrentStep, PollFormErrors};
