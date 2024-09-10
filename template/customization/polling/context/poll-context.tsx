import React, {createContext, useReducer, useEffect, useState} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid, useRoomInfo, filterObject} from 'customization-api';
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
  SAVE_POLL_ITEM = 'SAVE_POLL_ITEM',
  SEND_POLL_ITEM = 'SEND_POLL_ITEM',
  UPDATE_POLL_ITEM = 'UPDATE_POLL_ITEM',
  SUBMIT_POLL_ITEM_RESPONSES = 'SUBMIT_POLL_ITEM_RESPONSES',
  RECEIVE_POLL_ITEM_RESPONSES = 'RECEIVE_POLL_ITEM_RESPONSES',
  PUBLISH_POLL_ITEM = 'PUBLISH_POLL_ITEM',
  DELETE_POLL_ITEM = 'DELETE_POLL_ITEM',
  EXPORT_POLL_ITEM = 'EXPORT_POLL_ITEM',
  FINISH_POLL_ITEM = 'FINISH_POLL_ITEM',
}

type PollAction =
  | {
      type: PollActionKind.SAVE_POLL_ITEM;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.SEND_POLL_ITEM;
      payload: {pollId: string};
    }
  | {
      type: PollActionKind.UPDATE_POLL_ITEM;
      payload: {pollId: string; partialItem: Partial<PollItem>};
    }
  | {
      type: PollActionKind.SUBMIT_POLL_ITEM_RESPONSES;
      payload: {
        id: string;
        responses: string | string[];
        uid: number;
        timestamp: number;
      };
    }
  | {
      type: PollActionKind.RECEIVE_POLL_ITEM_RESPONSES;
      payload: {
        id: string;
        responses: string | string[];
        uid: number;
        timestamp: number;
      };
    }
  | {
      type: PollActionKind.PUBLISH_POLL_ITEM;
      payload: {pollId: string};
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
    case PollActionKind.SAVE_POLL_ITEM: {
      const pollId = action.payload.item.id;
      return {
        ...state,
        [pollId]: {...action.payload.item},
      };
    }
    case PollActionKind.SEND_POLL_ITEM: {
      const pollId = action.payload.pollId;
      return {
        ...state,
        [pollId]: {
          ...state[pollId],
          status: PollStatus.ACTIVE,
          expiresAt: getPollExpiresAtTime(POLL_DURATION),
        },
      };
    }
    case PollActionKind.UPDATE_POLL_ITEM: {
      const pollId = action.payload.pollId;
      return {
        ...state,
        [pollId]: {...state[pollId], ...action.payload.partialItem},
      };
    }
    case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES:
      {
        const {id: pollId, uid, responses, timestamp} = action.payload;
        const poll = state[pollId];
        if (
          poll.type === PollKind.OPEN_ENDED &&
          typeof responses === 'string'
        ) {
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
        if (poll.type === PollKind.MCQ && Array.isArray(responses)) {
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
    case PollActionKind.RECEIVE_POLL_ITEM_RESPONSES:
      {
        const {id: pollId, uid, responses, timestamp} = action.payload;
        const poll = state[pollId];
        if (
          poll.type === PollKind.OPEN_ENDED &&
          typeof responses === 'string'
        ) {
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
        if (poll.type === PollKind.MCQ && Array.isArray(responses)) {
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
    case PollActionKind.PUBLISH_POLL_ITEM:
      // No action neeed
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
  startPollForm: () => void;
  savePoll: (item: PollItem) => void;
  sendPoll: (pollId: string) => void;
  onPollReceived: (polls: Poll, launchId: string) => void;
  sendResponseToPoll: (item: PollItem, responses: string | string[]) => void;
  onPollResponseReceived: (
    pollId: string,
    responses: string | string[],
    uid: number,
    timestamp: number,
  ) => void;
  launchPollId: string;
  viewResultPollId: string;
  sendPollResults: (pollId: string) => void;
  closeCurrentModal: () => void;
  isHost: boolean;
  handlePollTaskRequest: (task: PollTaskRequestTypes, pollId: string) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [currentModal, setCurrentModal] = useState<PollModalState>(null);
  const [launchPollId, setLaunchPollId] = useState<string>(null);
  const [viewResultPollId, setViewResultPollId] = useState<string>(null);
  const [lastAction, setLastAction] = useState<PollAction | null>(null);
  const {
    data: {isHost},
  } = useRoomInfo();

  const enhancedDispatch = (action: PollAction) => {
    dispatch(action);
    setLastAction(action);
  };

  const localUid = useLocalUid();

  const {sendPollEvt, sendResponseToPollEvt} = usePollEvents();

  useEffect(() => {
    if (lastAction) {
      switch (lastAction.type) {
        case PollActionKind.SAVE_POLL_ITEM:
          if (lastAction.payload.item.status === PollStatus.LATER) {
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SEND_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId);
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES:
          const {id, responses, uid, timestamp} = lastAction.payload;
          sendResponseToPollEvt(id, responses, uid, timestamp);
          break;
        case PollActionKind.PUBLISH_POLL_ITEM:
        case PollActionKind.FINISH_POLL_ITEM:
        case PollActionKind.DELETE_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId);
          }
          break;
        default:
          break;
      }
    }
  }, [lastAction, sendPollEvt, polls, sendResponseToPollEvt]);

  const startPollForm = () => {
    setCurrentModal(PollModalState.DRAFT_POLL);
  };

  const savePoll = (item: PollItem) => {
    enhancedDispatch({
      type: PollActionKind.SAVE_POLL_ITEM,
      payload: {
        item: {...item},
      },
    });
  };

  const sendPoll = (pollId: string) => {
    // check if there is an already launched poll
    const isAnyPollActive = Object.keys(
      filterObject(polls, ([_, v]) => v.status === PollStatus.ACTIVE),
    );
    if (isAnyPollActive.length > 0) {
      console.error(
        'Cannot publish poll now as there is already one poll active',
      );
      return;
    }
    enhancedDispatch({
      type: PollActionKind.SEND_POLL_ITEM,
      payload: {
        pollId,
      },
    });
  };

  const onPollReceived = (pollsState: Poll, pollId: string) => {
    if (isHost) {
      Object.entries(pollsState).forEach(([_, pollItem]) => {
        savePoll(pollItem);
      });
    } else {
      Object.entries(pollsState).forEach(([_, pollItem]) => {
        if (pollItem.status === PollStatus.FINISHED) {
          savePoll(pollItem);
        }
        if (pollItem.status === PollStatus.ACTIVE) {
          savePoll(pollItem);
          setLaunchPollId(pollId);
          setCurrentModal(PollModalState.RESPOND_TO_POLL);
        }
      });
    }
  };

  const sendResponseToPoll = (item: PollItem, responses: string | string[]) => {
    if (
      (item.type === PollKind.OPEN_ENDED && typeof responses === 'string') ||
      (item.type === PollKind.MCQ && Array.isArray(responses))
    ) {
      enhancedDispatch({
        type: PollActionKind.SUBMIT_POLL_ITEM_RESPONSES,
        payload: {
          id: item.id,
          responses,
          uid: localUid,
          timestamp: Date.now(),
        },
      });
    } else {
      throw new Error(
        'sendResponseToPoll received incorrect type response. Unable to send poll response',
      );
    }
  };

  const onPollResponseReceived = (
    pollId: string,
    responses: string | string[],
    uid: number,
    timestamp: number,
  ) => {
    enhancedDispatch({
      type: PollActionKind.RECEIVE_POLL_ITEM_RESPONSES,
      payload: {
        id: pollId,
        responses,
        uid,
        timestamp,
      },
    });
  };

  const sendPollResults = (pollId: string) => {
    sendPollEvt(polls, pollId);
  };

  const handlePollTaskRequest = (
    task: PollTaskRequestTypes,
    pollId: string,
  ) => {
    switch (task) {
      case PollTaskRequestTypes.SEND:
        sendPoll(pollId);
        break;

      case PollTaskRequestTypes.SHARE:
        // No user case so far
        break;
      case PollTaskRequestTypes.VIEW_DETAILS:
        setViewResultPollId(pollId);
        setCurrentModal(PollModalState.VIEW_POLL_RESULTS);
        break;
      case PollTaskRequestTypes.PUBLISH:
        enhancedDispatch({
          type: PollActionKind.PUBLISH_POLL_ITEM,
          payload: {
            pollId,
          },
        });
        break;
      case PollTaskRequestTypes.DELETE:
        enhancedDispatch({
          type: PollActionKind.DELETE_POLL_ITEM,
          payload: {
            pollId,
          },
        });
        break;
      case PollTaskRequestTypes.FINISH:
        enhancedDispatch({
          type: PollActionKind.FINISH_POLL_ITEM,
          payload: {
            pollId,
          },
        });
        break;
      case PollTaskRequestTypes.EXPORT:
        enhancedDispatch({
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
    startPollForm,
    sendPoll,
    savePoll,
    onPollReceived,
    onPollResponseReceived,
    currentModal,
    launchPollId,
    viewResultPollId,
    sendResponseToPoll,
    sendPollResults,
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

export type {Poll, PollItem, PollFormErrors, PollItemOptionItem};
