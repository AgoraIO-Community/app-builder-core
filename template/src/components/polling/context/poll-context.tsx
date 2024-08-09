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

interface PollItemOptionItem {
  text: string;
  value: string;
  votes: Array<{uid: number; access: PollAccess; timestamp: number}> | [];
}
interface PollItem {
  id: string;
  type: PollKind;
  access: PollAccess; // remove it as poll are not private or public but the response will be public or private
  status: PollStatus;
  question: string;
  answers: Array<{
    uid: number;
    response: string;
    timestamp: number;
  }> | null;
  options: Array<PollItemOptionItem> | null;
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
  ADD_POLL_ITEM = 'ADD_POLL_ITEM',
  UPDATE_POLL_ITEM_RESPONSES = 'UPDATE_POLL_ITEM_RESPONSES',
  LAUNCH_POLL_ITEM = 'LAUNCH_POLL_ITEM',
  SUBMIT_POLL_OPEN_ENDED_RESPONSE = 'SUBMIT_POLL_OPEN_ENDED_RESPONSE',
  START_POLL_TIMER = 'START_POLL_TIMER',
}

type PollAction =
  | {
      type: PollActionKind.ADD_POLL_ITEM;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.START_POLL_TIMER;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.UPDATE_POLL_ITEM_RESPONSES;
      payload: {
        id: string;
        type: PollKind;
        responses: string | string[];
        uid: number;
        timestamp: number;
      };
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
  function addVote(
    responses: string[],
    options: PollItemOptionItem[],
  ): PollItemOptionItem[] {
    return options.map((option: PollItemOptionItem) => {
      // Count how many times the value appears in the strings array
      const exists = responses.findIndex(str => str === option.value);
      if (exists > 0) {
        // Return a new object with an updated votes array
        return {
          ...option,
          votes: [
            ...option.votes,
            {
              uid: 123,
              access: PollAccess.PUBLIC,
              timestamp: Date.now(),
            },
          ],
        };
      }
      // If no matches, return the option as is
      return option;
    });
  }
  switch (action.type) {
    case PollActionKind.ADD_POLL_ITEM: {
      const pollId = action.payload.item.id;
      return {
        ...state,
        [pollId]: {...action.payload.item},
      };
    }
    case PollActionKind.UPDATE_POLL_ITEM_RESPONSES:
      {
        const {id: pollId, uid, responses, type, timestamp} = action.payload;
        if (type === PollKind.OPEN_ENDED && typeof responses === 'string') {
          return {
            ...state,
            [pollId]: {
              ...state[pollId],
              answers: [
                ...state[pollId].answers,
                {
                  uid,
                  response: responses,
                  timestamp,
                },
              ],
            },
          };
        }
        if (type === PollKind.MCQ && Array.isArray(responses)) {
          return {
            ...state,
            [pollId]: {
              ...state[pollId],
              options: addVote(responses, state[pollId].options),
            },
          };
        }
      }
      break;
    default: {
      return state;
    }
  }
}

interface PollContextValue {
  polls: Poll;
  currentStep: PollCurrentStep;
  dispatch: Dispatch<PollAction>;
  startPollForm: () => void;
  savePoll: (item: PollItem) => void;
  sendPoll: (item: PollItem) => void;
  onPollReceived: (item: PollItem, launchId: string) => void;
  onPollResponseReceived: (
    id: string,
    type: PollKind,
    responses: string | string[],
    sender: number,
    ts: number,
  ) => void;
  launchPollId: string;
  sendResponseToPoll: (item: PollItem, responses: string | string[]) => void;
  goToShareResponseModal: () => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [currentStep, setCurrentStep] = useState<PollCurrentStep>(null);
  const [launchPollId, setLaunchPollId] = useState<string>(null);
  const localUid = useLocalUid();
  const {audienceUids} = useLiveStreamDataContext();

  const {sendPollEvt, sendResponseToPollEvt} = usePollEvents();

  const startPollForm = () => {
    setCurrentStep('CREATE_POLL');
  };

  const savePoll = (item: PollItem) => {
    addPollItem(item);
    setCurrentStep(null);
  };

  const sendPoll = (item: PollItem) => {
    if (item.status === PollStatus.ACTIVE) {
      item.expiresAt = getPollExpiresAtTime(POLL_DURATION);
      sendPollEvt(item);
      setCurrentStep(null);
    } else {
      console.error('Poll: Cannot send poll as the status is not active');
    }
  };

  const onPollReceived = (item: PollItem, launchId: string) => {
    addPollItem(item);
    if (audienceUids.includes(localUid)) {
      setLaunchPollId(launchId);
      setCurrentStep('RESPOND_TO_POLL');
    }
  };

  const sendResponseToPoll = (item: PollItem, responses: string | string[]) => {
    if (
      (item.type === PollKind.OPEN_ENDED && typeof responses === 'string') ||
      (item.type === PollKind.MCQ && Array.isArray(responses))
    ) {
      sendResponseToPollEvt(item, responses);
    } else {
      throw new Error(
        'sendResponseToPoll received incorrect type response. Unable to send poll response',
      );
    }
  };

  const onPollResponseReceived = (
    id: string,
    type: PollKind,
    responses: string | string[],
    sender: number,
    ts: number,
  ) => {
    dispatch({
      type: PollActionKind.UPDATE_POLL_ITEM_RESPONSES,
      payload: {
        id,
        type,
        responses,
        uid: sender,
        timestamp: ts,
      },
    });
  };

  const addPollItem = (item: PollItem) => {
    dispatch({
      type: PollActionKind.ADD_POLL_ITEM,
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
    savePoll,
    sendPoll,
    onPollReceived,
    onPollResponseReceived,
    currentStep,
    launchPollId,
    sendResponseToPoll,
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

export type {PollItem, PollCurrentStep, PollFormErrors, PollItemOptionItem};
