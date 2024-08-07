import React, {
  createContext,
  useReducer,
  Dispatch,
  useState,
  useEffect,
} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useLiveStreamDataContext} from '../../../components/contexts/LiveStreamDataContext';

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

type PollCurrentStep =
  | 'START_POLL'
  | 'SELECT_POLL'
  | 'CREATE_POLL'
  | 'PREVIEW_POLL'
  | 'RESPONSE_POLL';

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
  timer: number;
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
  ADD_POLL_ITEM = 'ADD_POLL_ITEM',
  LAUNCH_POLL_ITEM = 'LAUNCH_POLL_ITEM',
  SUBMIT_POLL_OPEN_ENDED_RESPONSE = 'SUBMIT_POLL_OPEN_ENDED_RESPONSE',
}

type PollAction = {
  type: PollActionKind.ADD_POLL_ITEM;
  payload: {item: PollItem};
};
// | {
//     type: PollActionKind.LAUNCH_POLL_ITEM;
//     payload: {pollID: string};
//   }
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
    case PollActionKind.ADD_POLL_ITEM: {
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
  setCurrentStep: (item: PollCurrentStep) => void;
  launchPollForm: (item: PollItem, launchId: string) => void;
  launchPollId: string;
  onSubmitPollResponse: (item: PollItem, response: any) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  console.log('supriya polls: ', polls);
  const [currentStep, setCurrentStep] = useState<PollCurrentStep>(null);
  const [launchPollId, setLaunchPollId] = useState<string>(null);
  const localUid = useLocalUid();
  const {audienceUids, hostUids} = useLiveStreamDataContext();

  const {sendPollEvt, sendPollResponseEvt} = usePollEvents();

  useEffect(() => {
    if (!launchPollId) {
      return;
    }
    if (launchPollId && polls.hasOwnProperty(launchPollId)) {
      setCurrentStep('RESPONSE_POLL');
    }
  }, [launchPollId, polls]);

  const startPollForm = () => {
    setCurrentStep('SELECT_POLL');
  };

  const savePollForm = (item: PollItem) => {
    dispatch({
      type: PollActionKind.ADD_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
  };

  const sendPollForm = (item: PollItem) => {
    if (item.status === PollStatus.ACTIVE) {
      sendPollEvt(item);
    } else {
      console.error('Poll: Cannot send poll as the status is not active');
    }
  };

  const launchPollForm = (item: PollItem, launchId: string) => {
    dispatch({
      type: PollActionKind.ADD_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
    if (audienceUids.includes(localUid)) {
      setLaunchPollId(launchId);
    }
  };

  const onSubmitPollResponse = (item: PollItem, response: any) => {
    if (item.type === PollKind.OPEN_ENDED) {
      // dispatch({
      //   type: PollActionKind.SUBMIT_POLL_OPEN_ENDED_RESPONSE,
      //   payload: {
      //     pollId: id,
      //     answerItem: {
      //       uid: localUid,
      //       response,
      //       timestamp: Date.now(),
      //     },
      //   },
      // });
      sendPollResponseEvt({
        ...item,
        answers: [
          ...(Array.isArray(item.answers) ? item.answers : []),
          {uid: localUid, response, timestamp: Date.now()},
        ],
      });
      setCurrentStep(null);
      setLaunchPollId(null);
    }
  };

  const value = {
    polls,
    dispatch,
    startPollForm,
    savePollForm,
    sendPollForm,
    launchPollForm,
    currentStep,
    setCurrentStep,
    launchPollId,
    onSubmitPollResponse,
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
