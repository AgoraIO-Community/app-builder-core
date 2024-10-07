import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {usePollEvents} from './poll-events';
import {
  useLocalUid,
  useRoomInfo,
  filterObject,
  Toast,
  useSidePanel,
  SidePanelType,
} from 'customization-api';
import {
  getPollExpiresAtTime,
  POLL_DURATION,
} from '../components/form/form-config';
import {
  addVote,
  arrayToCsv,
  calculatePercentage,
  debounce,
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
  SAVE = 'SAVE',
  SEND = 'SEND',
  PUBLISH = 'PUBLISH',
  EXPORT = 'EXPORT',
  FINISH = 'FINISH',
  VIEW_DETAILS = 'VIEW_DETAILS',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  SYNC_COMPLETE = 'SYNC_COMPLETE',
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
  ADD_POLL_ITEM = 'ADD_POLL_ITEM',
  SEND_POLL_ITEM = 'SEND_POLL_ITEM',
  SUBMIT_POLL_ITEM_RESPONSES = 'SUBMIT_POLL_ITEM_RESPONSES',
  RECEIVE_POLL_ITEM_RESPONSES = 'RECEIVE_POLL_ITEM_RESPONSES',
  PUBLISH_POLL_ITEM = 'PUBLISH_POLL_ITEM',
  DELETE_POLL_ITEM = 'DELETE_POLL_ITEM',
  EXPORT_POLL_ITEM = 'EXPORT_POLL_ITEM',
  FINISH_POLL_ITEM = 'FINISH_POLL_ITEM',
  RESET = 'RESET',
  SYNC_COMPLETE = 'SYNC_COMPLETE',
}

type PollAction =
  | {
      type: PollActionKind.ADD_POLL_ITEM;
      payload: {
        item: PollItem;
      };
    }
  | {
      type: PollActionKind.SAVE_POLL_ITEM;
      payload: {item: PollItem};
    }
  | {
      type: PollActionKind.SEND_POLL_ITEM;
      payload: {pollId: string};
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
    }
  | {
      type: PollActionKind.SYNC_COMPLETE;
      payload: {
        latestTask: PollTaskRequestTypes;
        latestPollId: string;
      };
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
    case PollActionKind.ADD_POLL_ITEM: {
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
    isInitialized: boolean,
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
  const {setSidePanel} = useSidePanel();

  const {
    data: {isHost},
  } = useRoomInfo();
  const localUid = useLocalUid();
  const {syncPollEvt, sendResponseToPollEvt} = usePollEvents();

  const enhancedDispatch = (action: PollAction) => {
    log(`Dispatching action: ${action.type} with payload:`, action.payload);
    dispatch(action);
    setLastAction(action);
  };

  useEffect(() => {
    log('useEffect for lastAction triggered', lastAction);

    if (lastAction) {
      switch (lastAction.type) {
        case PollActionKind.SAVE_POLL_ITEM:
          log('Handling SAVE_POLL_ITEM');
          if (lastAction.payload.item.status === PollStatus.LATER) {
            const {item} = lastAction.payload;
            syncPollEvt(polls, item.id, PollTaskRequestTypes.SAVE);
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SEND_POLL_ITEM:
          {
            log('Handling SEND_POLL_ITEM');
            const {pollId} = lastAction.payload;
            syncPollEvt(polls, pollId, PollTaskRequestTypes.SEND);
            setCurrentModal(null);
          }
          break;
        case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES:
          log('Handling SUBMIT_POLL_ITEM_RESPONSES');
          const {id, responses, uid, timestamp} = lastAction.payload;
          if (localUid === polls[id]?.createdBy) {
            log('No need to send event. User is the poll creator.');
            return;
          }
          sendResponseToPollEvt(polls[id], responses, uid, timestamp);
          break;
        case PollActionKind.RECEIVE_POLL_ITEM_RESPONSES:
          {
            log('Handling RECEIVE_POLL_ITEM_RESPONSES');
            const {id: pollId} = lastAction.payload;
            const pollCreator = polls[pollId]?.createdBy;
            if (localUid === pollCreator) {
              log('Received poll response, user is the creator. Syncing...');
              callDebouncedSyncPoll(polls, pollId, PollTaskRequestTypes.SAVE);
            }
          }
          break;
        case PollActionKind.PUBLISH_POLL_ITEM:
          log('Handling PUBLISH_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(polls, pollId, PollTaskRequestTypes.PUBLISH);
          }
          break;
        case PollActionKind.FINISH_POLL_ITEM:
          log('Handling FINISH_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(polls, pollId, PollTaskRequestTypes.FINISH);
          }
          break;
        case PollActionKind.DELETE_POLL_ITEM:
          log('Handling DELETE_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(polls, pollId, PollTaskRequestTypes.DELETE);
          }
          break;
        case PollActionKind.SYNC_COMPLETE:
          log('Handling SYNC_COMPLETE');
          const {latestTask, latestPollId} = lastAction.payload;
          if (
            latestPollId &&
            latestTask &&
            polls[latestPollId] &&
            latestTask === PollTaskRequestTypes.SEND
          ) {
            setSidePanel(SidePanelType.None);
            setLaunchPollId(latestPollId);
            setCurrentModal(PollModalState.RESPOND_TO_POLL);
          }
          break;
        default:
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAction]);

  const startPollForm = () => {
    log('Opening draft poll modal.');
    setCurrentModal(PollModalState.DRAFT_POLL);
  };

  const editPollForm = (pollId: string) => {
    log(`Editing poll form for pollId: ${pollId}`);
    setCurrentModal(PollModalState.DRAFT_POLL);
    setEditFormObject({...polls[pollId]});
  };

  const savePoll = (item: PollItem) => {
    log('Saving poll item:', item);
    enhancedDispatch({
      type: PollActionKind.SAVE_POLL_ITEM,
      payload: {item: {...item}},
    });
  };

  const addPoll = (item: PollItem) => {
    log('Adding poll item:', item);
    enhancedDispatch({
      type: PollActionKind.ADD_POLL_ITEM,
      payload: {item: {...item}},
    });
  };

  const sendPoll = (pollId: string) => {
    log(`Sending poll with id: ${pollId}`);
    enhancedDispatch({
      type: PollActionKind.SEND_POLL_ITEM,
      payload: {pollId},
    });
  };

  const onPollReceived = (
    newPoll: Poll,
    pollId: string,
    task: PollTaskRequestTypes,
    initialLoad: boolean,
  ) => {
    log('onPollReceived', newPoll, pollId, task);

    const {mergedPolls, deletedPollIds} = mergePolls(newPoll, polls);

    log('Merged polls:', mergedPolls);
    log('Deleted poll IDs:', deletedPollIds);

    if (Object.keys(mergedPolls).length === 0) {
      log('No polls left after merge. Resetting state.');
      enhancedDispatch({type: PollActionKind.RESET});
      return;
    }

    if (localUid === newPoll[pollId]?.createdBy) {
      log('I am the creator, no further action needed.');
      return;
    }

    deletedPollIds?.forEach((id: string) => {
      log(`Deleting poll ID: ${id}`);
      handlePollTaskRequest(PollTaskRequestTypes.DELETE, id);
    });

    log('Updating state with merged polls.');
    Object.values(mergedPolls)
      .filter(pollItem => pollItem.status !== PollStatus.LATER)
      .forEach(pollItem => {
        log(`Adding poll ID ${pollItem.id} with status ${pollItem.status}`);
        addPoll(pollItem);
      });

    log('Is it an initial load ?:', initialLoad);
    if (!initialLoad) {
      enhancedDispatch({
        type: PollActionKind.SYNC_COMPLETE,
        payload: {
          latestTask: task,
          latestPollId: pollId,
        },
      });
    }
  };

  const sendResponseToPoll = (item: PollItem, responses: string | string[]) => {
    log('Sending response to poll:', item, responses);
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
    log('Received poll response:', {pollId, responses, uid, timestamp});
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
    log(`Sending poll results for pollId: ${pollId}`);
    syncPollEvt(polls, pollId, PollTaskRequestTypes.SHARE);
  };

  const handlePollTaskRequest = (
    task: PollTaskRequestTypes,
    pollId: string,
  ) => {
    log(`Handling poll task request: ${task} for pollId: ${pollId}`);
    switch (task) {
      case PollTaskRequestTypes.SEND:
        sendPoll(pollId);
        break;
      case PollTaskRequestTypes.SHARE:
        break;
      case PollTaskRequestTypes.VIEW_DETAILS:
        closeCurrentModal();
        setViewResultPollId(pollId);
        setCurrentModal(PollModalState.VIEW_POLL_RESULTS);
        break;
      case PollTaskRequestTypes.PUBLISH:
        enhancedDispatch({
          type: PollActionKind.PUBLISH_POLL_ITEM,
          payload: {pollId},
        });
        break;
      case PollTaskRequestTypes.DELETE:
        enhancedDispatch({
          type: PollActionKind.DELETE_POLL_ITEM,
          payload: {pollId},
        });
        break;
      case PollTaskRequestTypes.FINISH:
        enhancedDispatch({
          type: PollActionKind.FINISH_POLL_ITEM,
          payload: {pollId},
        });
        break;
      case PollTaskRequestTypes.EXPORT:
        enhancedDispatch({
          type: PollActionKind.EXPORT_POLL_ITEM,
          payload: {pollId},
        });
        break;
      default:
        break;
    }
  };

  const callDebouncedSyncPoll = useMemo(
    () => debounce(syncPollEvt, 2000),
    [syncPollEvt],
  );

  const closeCurrentModal = () => {
    log('Closing current modal.');
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
