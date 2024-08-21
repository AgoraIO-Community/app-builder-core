import React, {createContext, useReducer, Dispatch, useState} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid, useLiveStreamDataContext} from 'customization-api';
import {
  getPollExpiresAtTime,
  POLL_DURATION,
} from '../components/form/form-config';
import {PollTaskRequestTypes} from '../components/PollCardMoreActions';
import {
  addVote,
  arrayToCsv,
  calculatePercentage,
  downloadCsv,
} from '../helpers';

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
  votes: Array<{uid: number; access: PollAccess; timestamp: number}>;
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
  DELETE_POLL_ITEM = 'DELETE_POLL_ITEM',
  EXPORT_POLL_ITEM = 'EXPORT_POLL_ITEM',
  FINISH_POLL_ITEM = 'FINISH_POLL_ITEM',
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
      type: PollActionKind.UPDATE_POLL_ITEM_RESPONSES;
      payload: {
        id: string;
        type: PollKind;
        responses: string | string[];
        uid: number;
        timestamp: number;
      };
    }
  | {
      type: PollActionKind.FINISH_POLL_ITEM;
      payload: {pollId: string};
    }
  | {
      type: PollActionKind.EXPORT_POLL_ITEM;
      payload: {pollId: string};
    }
  | {
      type: PollActionKind.DELETE_POLL_ITEM;
      payload: {pollId: string};
    };

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
        const poll = state[pollId];
        if (type === PollKind.OPEN_ENDED && typeof responses === 'string') {
          return {
            ...state,
            [pollId]: {
              ...poll,
              answers: poll.answers
                ? [
                    ...poll.answers,
                    {
                      uid,
                      response: responses,
                      timestamp,
                    },
                  ]
                : [{uid, response: responses, timestamp}],
            },
          };
        }
        if (type === PollKind.MCQ && Array.isArray(responses)) {
          const newCopyOptions = poll.options?.map(item => ({...item})) || [];
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
              ...poll,
              options: withPercentOptions,
            },
          };
        }
      }
      break;
    case PollActionKind.FINISH_POLL_ITEM:
      {
        const pollId = action.payload.pollId;
        if (pollId) {
          return {
            ...state,
            [pollId]: {...state[pollId], status: PollStatus.FINISHED},
          };
        }
      }
      break;
    case PollActionKind.EXPORT_POLL_ITEM:
      {
        const pollId = action.payload.pollId;
        if (pollId) {
          let csv = arrayToCsv(state[pollId].options);
          downloadCsv(csv, 'polls.csv');
        }
      }
      break;
    case PollActionKind.DELETE_POLL_ITEM:
      {
        const pollId = action.payload.pollId;
        if (pollId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {[pollId]: _, ...newItems} = state;
          return {
            ...newItems,
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
  const {hostUids} = useLiveStreamDataContext();

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
        dispatch({
          type: PollActionKind.DELETE_POLL_ITEM,
          payload: {
            pollId,
          },
        });
        break;
      case PollTaskRequestTypes.FINISH:
        dispatch({
          type: PollActionKind.FINISH_POLL_ITEM,
          payload: {
            pollId,
          },
        });
        break;
      case PollTaskRequestTypes.EXPORT:
        dispatch({
          type: PollActionKind.EXPORT_POLL_ITEM,
          payload: {
            pollId,
          },
        });
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
