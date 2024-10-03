import React, {createContext, useReducer, useEffect, useState} from 'react';
import {usePollEvents} from './poll-events';
import {useLocalUid, useRoomInfo, filterObject, Toast} from 'customization-api';
import {
  getPollExpiresAtTime,
  POLL_DURATION,
} from '../components/form/form-config';
import {
  addVote,
  arrayToCsv,
  calculatePercentage,
  downloadCsv,
  hasUserVoted,
  log,
  mergePolls,
} from '../helpers';

enum PollStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  LATER = 'LATER',
}

enum PollKind {
  OPEN_ENDED = 'OPEN_ENDED',
  MCQ = 'MCQ',
  YES_NO = 'YES_NO',
  NONE = 'NONE',
}

enum PollModalState {
  DRAFT_POLL = 'DRAFT_POLL',
  RESPOND_TO_POLL = 'RESPOND_TO_POLL',
  VIEW_POLL_RESULTS = 'VIEW_POLL_RESULTS',
}

enum PollTaskRequestTypes {
  SEND = 'SEND',
  PUBLISH = 'PUBLISH',
  EXPORT = 'EXPORT',
  FINISH = 'FINISH',
  VIEW_DETAILS = 'VIEW_DETAILS',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
}

interface PollItemOptionItem {
  text: string;
  value: string;
  votes: Array<{uid: number; timestamp: number}>;
  percent: string;
}
interface PollItem {
  id: string;
  type: PollKind;
  status: PollStatus;
  question: string;
  answers: Array<{
    uid: number;
    response: string;
    timestamp: number;
  }> | null;
  options: Array<PollItemOptionItem> | null;
  multiple_response: boolean;
  share_attendee: boolean;
  share_host: boolean;
  anonymous: boolean;
  duration: boolean;
  expiresAt: number;
  createdBy: number;
  createdAt: number;
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
  RESET = 'RESET',
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
    }
  | {
      type: PollActionKind.RESET;
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
    case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES: {
      const {id: pollId, uid, responses, timestamp} = action.payload;
      const poll = state[pollId];
      if (poll.type === PollKind.OPEN_ENDED && typeof responses === 'string') {
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
      if (
        (poll.type === PollKind.MCQ || poll.type === PollKind.YES_NO) &&
        Array.isArray(responses)
      ) {
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
      return state;
    }
    case PollActionKind.RECEIVE_POLL_ITEM_RESPONSES: {
      const {id: pollId, uid, responses, timestamp} = action.payload;
      const poll = state[pollId];
      if (poll.type === PollKind.OPEN_ENDED && typeof responses === 'string') {
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
      if (
        (poll.type === PollKind.MCQ || poll.type === PollKind.YES_NO) &&
        Array.isArray(responses)
      ) {
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
      return state;
    }
    case PollActionKind.PUBLISH_POLL_ITEM:
      // No action need just return the state
      return state;
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
      return state;
    case PollActionKind.EXPORT_POLL_ITEM:
      {
        const pollId = action.payload.pollId;
        if (pollId && state[pollId]) {
          const data = state[pollId].options || []; // Provide a fallback in case options is null
          let csv = arrayToCsv(data);
          downloadCsv(csv, 'polls.csv');
        }
      }
      return state;
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
      return state;
    case PollActionKind.RESET: {
      return {};
    }
    default: {
      return state;
    }
  }
}

interface PollContextValue {
  polls: Poll;
  currentModal: PollModalState | null;
  startPollForm: () => void;
  editFormObject: PollItem;
  editPollForm: (pollId: string) => void;
  savePoll: (item: PollItem) => void;
  sendPoll: (pollId: string) => void;
  onPollReceived: (
    polls: Poll,
    pollId: string,
    task: PollTaskRequestTypes,
  ) => void;
  sendResponseToPoll: (item: PollItem, responses: string | string[]) => void;
  onPollResponseReceived: (
    pollId: string,
    responses: string | string[],
    uid: number,
    timestamp: number,
  ) => void;
  launchPollId: string | null;
  viewResultPollId: string | null;
  sendPollResults: (pollId: string) => void;
  closeCurrentModal: () => void;
  isHost: boolean;
  handlePollTaskRequest: (task: PollTaskRequestTypes, pollId: string) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [currentModal, setCurrentModal] = useState<PollModalState | null>(null);
  const [editFormObject, setEditFormObject] = useState<PollItem | null>(null);
  const [launchPollId, setLaunchPollId] = useState<string | null>(null);
  const [viewResultPollId, setViewResultPollId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<PollAction | null>(null);
  const {
    data: {isHost},
  } = useRoomInfo();

  const enhancedDispatch = (action: PollAction) => {
    dispatch(action);
    setLastAction(action);
  };

  const localUid = useLocalUid();

  const {sendPollEvt, sendResponseToPollEvt, savePollEvt} = usePollEvents();

  useEffect(() => {
    if (lastAction) {
      switch (lastAction.type) {
        case PollActionKind.SAVE_POLL_ITEM:
          if (lastAction.payload.item.status === PollStatus.LATER) {
            const {id: pollId} = lastAction.payload.item;
            savePollEvt(polls, pollId);
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SEND_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId, PollTaskRequestTypes.SEND);
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES:
          const {id, responses, uid, timestamp} = lastAction.payload;
          sendResponseToPollEvt(id, responses, uid, timestamp);
          break;
        case PollActionKind.PUBLISH_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId, PollTaskRequestTypes.PUBLISH);
          }
          break;
        case PollActionKind.FINISH_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId, PollTaskRequestTypes.FINISH);
          }
          break;
        case PollActionKind.DELETE_POLL_ITEM:
          {
            const {pollId} = lastAction.payload;
            sendPollEvt(polls, pollId, PollTaskRequestTypes.DELETE);
          }
          break;
        default:
          break;
      }
    }
  }, [lastAction, polls, sendPollEvt, savePollEvt, sendResponseToPollEvt]);

  const startPollForm = () => {
    setCurrentModal(PollModalState.DRAFT_POLL);
  };

  const editPollForm = (pollId: string) => {
    setCurrentModal(PollModalState.DRAFT_POLL);
    setEditFormObject({...polls[pollId]});
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
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Cannot publish poll now as there is already one poll active',
        text2: '',
        visibilityTime: 1000 * 3,
      });
      return;
    }
    enhancedDispatch({
      type: PollActionKind.SEND_POLL_ITEM,
      payload: {
        pollId,
      },
    });
  };

  const onPollReceived = (
    newPoll: Poll,
    pollId: string,
    task: PollTaskRequestTypes,
  ) => {
    log('onPollReceived task', task);
    const mergedPolls = mergePolls(newPoll, polls);
    if (Object.keys(mergedPolls).length === 0) {
      enhancedDispatch({
        type: PollActionKind.RESET,
      });
      return;
    }
    if (isHost) {
      log('i am host');
      Object.entries(mergedPolls).forEach(([_, pollItem]) => {
        savePoll(pollItem);
      });
    } else {
      log('i am attendee');
      Object.entries(mergedPolls).forEach(([_, pollItem]) => {
        if (pollItem.status === PollStatus.LATER) {
          return;
        }
        savePoll(pollItem);
        if (pollItem.status === PollStatus.ACTIVE) {
          // If status is active but voted
          if (hasUserVoted(pollItem?.options || [], localUid)) {
            return;
          }
          // if status is active but not voted
          setLaunchPollId(pollId);
          setCurrentModal(PollModalState.RESPOND_TO_POLL);
        }
      });
    }
  };

  const sendResponseToPoll = (item: PollItem, responses: string | string[]) => {
    if (
      (item.type === PollKind.OPEN_ENDED && typeof responses === 'string') ||
      (item.type !== PollKind.OPEN_ENDED && Array.isArray(responses))
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
    sendPollEvt(polls, pollId, PollTaskRequestTypes.SHARE);
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
        closeCurrentModal();
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
    editFormObject,
    editPollForm,
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
  PollModalState,
  PollTaskRequestTypes,
};

export type {Poll, PollItem, PollFormErrors, PollItemOptionItem};
