import React, {createContext, useReducer, Dispatch, useState} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid, useLiveStreamDataContext} from 'customization-api';

import {
  getPollExpiresAtTime,
  POLL_DURATION,
} from '../components/form/form-config';
import {PollTaskRequestTypes} from '../components/PollCardMoreActions';

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

enum PollModalState {
  DRAFT_POLL = 'DRAFT_POLL',
  RESPOND_TO_POLL = 'RESPOND_TO_POLL',
  VIEW_POLL_RESULTS = 'VIEW_POLL_RESULTS',
}

interface PollItemOptionItem {
  text: string;
  value: string;
  votes: Array<{uid: number; access: PollAccess; timestamp: number}> | [];
  percent: string;
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
  UPDATE_POLL_ITEM = 'UPDATE_POLL_ITEM',
  UPDATE_POLL_ITEM_RESPONSES = 'UPDATE_POLL_ITEM_RESPONSES',
  START_POLL_TIMER = 'START_POLL_TIMER',
}

type PollAction =
  | {
      type: PollActionKind.ADD_POLL_ITEM;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.UPDATE_POLL_ITEM;
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

function addVote(
  responses: string[],
  options: PollItemOptionItem[],
  uid: number,
  timestamp: number,
): PollItemOptionItem[] {
  return options.map((option: PollItemOptionItem) => {
    // Count how many times the value appears in the strings array
    const exists = responses.includes(option.value);
    if (exists) {
      // Creating a new object explicitly
      const newOption: PollItemOptionItem = {
        ...option,
        ...option,
        votes: [
          ...option.votes,
          {
            uid,
            access: PollAccess.PUBLIC,
            timestamp,
          },
        ],
      };
      return newOption;
    }
    // If no matches, return the option as is
    return option;
  });
}

function calculatePercentage(
  options: PollItemOptionItem[],
): PollItemOptionItem[] {
  const totalVotes = options.reduce(
    (total, item) => total + item.votes.length,
    0,
  );
  if (totalVotes === 0) {
    // As none of the users have voted, there is no need to calulate the percentage,
    // we can return the options as it is
    return options;
  }
  return options.map((option: PollItemOptionItem) => {
    let percentage = 0;
    if (option.votes.length > 0) {
      percentage = (option.votes.length / totalVotes) * 100;
    }
    // Creating a new object explicitly
    const newOption: PollItemOptionItem = {
      ...option,
      percent: percentage.toFixed(0),
    };
    return newOption;
  }) as PollItemOptionItem[];
}
function pollReducer(state: Poll, action: PollAction): Poll {
  switch (action.type) {
    case PollActionKind.ADD_POLL_ITEM: {
      const pollId = action.payload.item.id;
      return {
        ...state,
        [pollId]: {...action.payload.item},
      };
    }
    case PollActionKind.UPDATE_POLL_ITEM: {
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
          const newCopyOptions = state[pollId].options.map(item => ({...item}));
          const withVotesOptions = addVote(
            responses,
            newCopyOptions,
            uid,
            timestamp,
          );
          const withPercentOptions = calculatePercentage(withVotesOptions);
          return {
            ...state,
            [pollId]: {
              ...state[pollId],
              options: [...withPercentOptions],
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
  currentModal: PollModalState;
  dispatch: Dispatch<PollAction>;
  startPollForm: () => void;
  savePoll: (item: PollItem) => void;
  sendPoll: (item: PollItem) => void;
  onPollReceived: (item: PollItem, launchId: string) => void;
  sendResponseToPoll: (item: PollItem, responses: string | string[]) => void;
  onPollResponseReceived: (
    id: string,
    type: PollKind,
    responses: string | string[],
    sender: number,
    ts: number,
  ) => void;
  launchPollId: string;
  viewResultPollId: string;
  sendPollResults: (item: PollItem) => void;
  onPollResultsReceived: (item: PollItem) => void;
  closeCurrentModal: () => void;
  isHost: () => boolean;
  handlePollTaskRequest: (task: PollTaskRequestTypes, pollId: string) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [currentModal, setCurrentModal] = useState<PollModalState>(null);
  const [launchPollId, setLaunchPollId] = useState<string>(null);
  const [viewResultPollId, setViewResultPollId] = useState<string>(null);

  const localUid = useLocalUid();
  const {audienceUids, hostUids} = useLiveStreamDataContext();

  const {sendPollEvt, sendResponseToPollEvt, sendPollResultsEvt} =
    usePollEvents();
  const isHost = () => {
    if (hostUids.includes(localUid)) {
      return true;
    }
    return false;
  };

  const startPollForm = () => {
    setCurrentModal(PollModalState.DRAFT_POLL);
  };

  const savePoll = (item: PollItem) => {
    addPollItem(item);
    setCurrentModal(null);
  };

  const sendPoll = (item: PollItem) => {
    if (item.status === PollStatus.ACTIVE) {
      item.expiresAt = getPollExpiresAtTime(POLL_DURATION);
      sendPollEvt(item);
      setCurrentModal(null);
    } else {
      console.error('Poll: Cannot send poll as the status is not active');
    }
  };

  const onPollReceived = (item: PollItem, launchId: string) => {
    addPollItem(item);
    if (!isHost()) {
      setLaunchPollId(launchId);
      setCurrentModal(PollModalState.RESPOND_TO_POLL);
    }
  };

  const sendResponseToPoll = (item: PollItem, responses: string | string[]) => {
    if (
      (item.type === PollKind.OPEN_ENDED && typeof responses === 'string') ||
      (item.type === PollKind.MCQ && Array.isArray(responses))
    ) {
      dispatch({
        type: PollActionKind.UPDATE_POLL_ITEM_RESPONSES,
        payload: {
          id: item.id,
          type: item.type,
          responses,
          uid: localUid,
          timestamp: Date.now(),
        },
      });
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

  const sendPollResults = (item: PollItem) => {
    sendPollResultsEvt(item);
  };

  const onPollResultsReceived = (item: PollItem) => {
    updatePollItem(item);
  };

  const addPollItem = (item: PollItem) => {
    dispatch({
      type: PollActionKind.ADD_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
  };

  const updatePollItem = (item: PollItem) => {
    dispatch({
      type: PollActionKind.UPDATE_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
  };

  const handlePollTaskRequest = (
    task: PollTaskRequestTypes,
    pollId: string,
  ) => {
    switch (task) {
      case PollTaskRequestTypes.PUBLISH:
        sendPollResults({...polls[pollId]});
        break;
      case PollTaskRequestTypes.SHARE:
        // No user case so far
        break;
      case PollTaskRequestTypes.VIEW_DETAILS:
        setViewResultPollId(pollId);
        setCurrentModal(PollModalState.VIEW_POLL_RESULTS);
        break;
      case PollTaskRequestTypes.DELETE:
        break;
      case PollTaskRequestTypes.CLOSE:
        break;
      case PollTaskRequestTypes.EXPORT:
        break;
      default:
        break;
    }
  };

  const closeCurrentModal = () => {
    if (currentModal === PollModalState.RESPOND_TO_POLL) {
      setLaunchPollId(null);
    }
    if (currentModal === PollModalState.VIEW_POLL_RESULTS) {
      setViewResultPollId(null);
    }
    setCurrentModal(null);
  };

  const value = {
    polls,
    dispatch,
    startPollForm,
    savePoll,
    sendPoll,
    onPollReceived,
    onPollResponseReceived,
    currentModal,
    launchPollId,
    viewResultPollId,
    sendResponseToPoll,
    sendPollResults,
    onPollResultsReceived,
    handlePollTaskRequest,
    closeCurrentModal,
    isHost,
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
  PollModalState,
};

export type {PollItem, PollFormErrors, PollItemOptionItem};
