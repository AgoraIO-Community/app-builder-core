import React, {
  createContext,
  useReducer,
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {usePollEvents} from './poll-events';
import {
  useLocalUid,
  useRoomInfo,
  useSidePanel,
  SidePanelType,
  useContent,
  isWeb,
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
  log,
  mergePolls,
} from '../helpers';
import {POLL_SIDEBAR_NAME} from '../../custom-ui';

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

enum PollModalType {
  NONE = 'NONE',
  DRAFT_POLL = 'DRAFT_POLL',
  PREVIEW_POLL = 'PREVIEW_POLL',
  RESPOND_TO_POLL = 'RESPOND_TO_POLL',
  VIEW_POLL_RESULTS = 'VIEW_POLL_RESULTS',
  END_POLL_CONFIRMATION = 'END_POLL_CONFIRMATION',
  DELETE_POLL_CONFIRMATION = 'DELETE_POLL_CONFIRMATION',
}

interface PollModalState {
  modalType: PollModalType;
  id: string;
}

enum PollTaskRequestTypes {
  SAVE = 'SAVE',
  SEND = 'SEND',
  PUBLISH = 'PUBLISH',
  EXPORT = 'EXPORT',
  VIEW_DETAILS = 'VIEW_DETAILS',
  FINISH = 'FINISH',
  FINISH_CONFIRMATION = 'FINISH_CONFIRMATION',
  DELETE = 'DELETE',
  DELETE_CONFIRMATION = 'DELETE_CONFIRMATION',
  SHARE = 'SHARE',
  SYNC_COMPLETE = 'SYNC_COMPLETE',
}

interface PollItemOptionItem {
  text: string;
  value: string;
  votes: Array<{uid: number; name: string; timestamp: number}>;
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
  createdBy: {uid: number; name: string};
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
        user: {name: string; uid: number};
        timestamp: number;
      };
    }
  | {
      type: PollActionKind.RECEIVE_POLL_ITEM_RESPONSES;
      payload: {
        id: string;
        responses: string | string[];
        user: {name: string; uid: number};
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
      payload: null;
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
      const {id: pollId, user, responses, timestamp} = action.payload;
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
                    ...user,
                    response: responses,
                    timestamp,
                  },
                ]
              : [{...user, response: responses, timestamp}],
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
          user,
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
      const {id: pollId, user, responses, timestamp} = action.payload;
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
                    ...user,
                    response: responses,
                    timestamp,
                  },
                ]
              : [{...user, response: responses, timestamp}],
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
          user,
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
          let csv = arrayToCsv(state[pollId].question, data);
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
  startPollForm: () => void;
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
    user: {
      uid: number;
      name: string;
    },
    timestamp: number,
  ) => void;
  sendPollResults: (pollId: string) => void;
  modalState: PollModalState;
  closeCurrentModal: () => void;
  isHost: boolean;
  handlePollTaskRequest: (task: PollTaskRequestTypes, pollId: string) => void;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [polls, dispatch] = useReducer(pollReducer, {});
  const [modalState, setModalState] = useState<PollModalState>({
    modalType: PollModalType.NONE,
    id: null,
  });
  const [lastAction, setLastAction] = useState<PollAction | null>(null);
  const {setSidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useRoomInfo();
  const localUid = useLocalUid();
  const {defaultContent} = useContent();
  const {syncPollEvt, sendResponseToPollEvt} = usePollEvents();

  const callDebouncedSyncPoll = useMemo(
    () => debounce(syncPollEvt, 800),
    [syncPollEvt],
  );

  const pollsRef = useRef(polls);

  useEffect(() => {
    pollsRef.current = polls; // Update the ref whenever polls changes
  }, [polls]);

  useEffect(() => {
    // Delete polls created by the user
    const deleteMyPolls = () => {
      Object.values(pollsRef.current).forEach(poll => {
        if (poll.createdBy.uid === localUid) {
          enhancedDispatch({
            type: PollActionKind.DELETE_POLL_ITEM,
            payload: {pollId: poll.id},
          });
        }
      });
    };
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      deleteMyPolls();
      event.returnValue = ''; // Chrome requires returnValue to be set
    };
    if (isWeb()) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (isWeb()) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      } else {
        deleteMyPolls();
      }
    };
  }, [localUid]);

  const enhancedDispatch = (action: PollAction) => {
    log(`Dispatching action: ${action.type} with payload:`, action.payload);
    dispatch(action);
    setLastAction(action);
  };

  const closeCurrentModal = useCallback(() => {
    log('Closing current modal.');
    setModalState({
      modalType: PollModalType.NONE,
      id: null,
    });
  }, []);

  useEffect(() => {
    log('useEffect for lastAction triggered', lastAction);

    if (!lastAction) {
      log('No lastAction to process. Exiting useEffect.');
      return;
    }
    if (!pollsRef?.current) {
      log('PollsRef.current is undefined or null');
      return;
    }

    try {
      switch (lastAction.type) {
        case PollActionKind.SAVE_POLL_ITEM:
          if (lastAction?.payload?.item?.status === PollStatus.LATER) {
            log('Handling SAVE_POLL_ITEM saving poll item and syncing states');
            const {item} = lastAction.payload;
            syncPollEvt(pollsRef.current, item.id, PollTaskRequestTypes.SAVE);
            closeCurrentModal();
          }
          break;
        case PollActionKind.SEND_POLL_ITEM:
          {
            log('Handling SEND_POLL_ITEM');
            const {pollId} = lastAction.payload;
            if (pollId && pollsRef.current[pollId]) {
              syncPollEvt(pollsRef.current, pollId, PollTaskRequestTypes.SEND);
              closeCurrentModal();
            } else {
              log('Invalid pollId or poll not found in state:', pollId);
            }
          }
          break;
        case PollActionKind.SUBMIT_POLL_ITEM_RESPONSES:
          log('Handling SUBMIT_POLL_ITEM_RESPONSES');
          const {id, responses, user, timestamp} = lastAction.payload;
          if (localUid === pollsRef.current[id]?.createdBy.uid) {
            log(
              'No need to send event. User is the poll creator. We only sync data',
            );
            syncPollEvt(pollsRef.current, id, PollTaskRequestTypes.SAVE);
            return;
          }
          if (localUid && user?.uid && pollsRef.current[id]) {
            sendResponseToPollEvt(
              pollsRef.current[id],
              responses,
              user,
              timestamp,
            );
          } else {
            log('Missing uid, localUid, or poll data for submit response.');
          }
          break;
        case PollActionKind.RECEIVE_POLL_ITEM_RESPONSES:
          log('Handling RECEIVE_POLL_ITEM_RESPONSES');
          const {id: receivedPollId} = lastAction.payload;
          const pollCreator = pollsRef.current[receivedPollId]?.createdBy.uid;
          if (localUid === pollCreator) {
            log('Received poll response, user is the creator. Syncing...');
            callDebouncedSyncPoll(
              pollsRef.current,
              receivedPollId,
              PollTaskRequestTypes.SAVE,
            );
          }
          break;
        case PollActionKind.PUBLISH_POLL_ITEM:
          log('Handling PUBLISH_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(pollsRef.current, pollId, PollTaskRequestTypes.PUBLISH);
          }
          break;
        case PollActionKind.FINISH_POLL_ITEM:
          log('Handling FINISH_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(pollsRef.current, pollId, PollTaskRequestTypes.FINISH);
            closeCurrentModal();
          }
          break;
        case PollActionKind.DELETE_POLL_ITEM:
          log('Handling DELETE_POLL_ITEM');
          {
            const {pollId} = lastAction.payload;
            syncPollEvt(pollsRef.current, pollId, PollTaskRequestTypes.DELETE);
            closeCurrentModal();
          }
          break;
        case PollActionKind.SYNC_COMPLETE:
          log('Handling SYNC_COMPLETE');
          const {latestTask, latestPollId} = lastAction.payload;
          if (
            latestPollId &&
            latestTask &&
            pollsRef.current[latestPollId] &&
            latestTask === PollTaskRequestTypes.SEND
          ) {
            setSidePanel(SidePanelType.None);
            setModalState({
              modalType: PollModalType.RESPOND_TO_POLL,
              id: latestPollId,
            });
          }
          break;
        default:
          log(`Unhandled action type: ${lastAction.type}`);
          break;
      }
    } catch (error) {
      log('Error processing last action:', error);
    }
  }, [
    lastAction,
    localUid,
    setSidePanel,
    syncPollEvt,
    sendResponseToPollEvt,
    callDebouncedSyncPoll,
    closeCurrentModal,
  ]);

  const startPollForm = () => {
    log('Opening draft poll modal.');
    setModalState({
      modalType: PollModalType.DRAFT_POLL,
      id: null,
    });
  };

  const editPollForm = (pollId: string) => {
    if (polls[pollId]) {
      log(`Editing poll form for pollId: ${pollId}`);
      setModalState({
        modalType: PollModalType.DRAFT_POLL,
        id: pollId,
      });
    } else {
      log(`Poll not found for edit: ${pollId}`);
    }
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
    if (!pollId || !polls[pollId]) {
      log('Invalid pollId or poll not found for sending:', pollId);
      return;
    }
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

    if (!newPoll || !pollId) {
      log('Invalid newPoll or pollId in onPollReceived:', {newPoll, pollId});
      return;
    }
    const {mergedPolls, deletedPollIds} = mergePolls(newPoll, polls);

    log('Merged polls:', mergedPolls);
    log('Deleted poll IDs:', deletedPollIds);

    if (Object.keys(mergedPolls).length === 0) {
      log('No polls left after merge. Resetting state.');
      enhancedDispatch({type: PollActionKind.RESET, payload: null});
      return;
    }

    if (localUid === newPoll[pollId]?.createdBy.uid) {
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
    } else {
      if (Object.keys(mergedPolls).length > 0) {
        // Check if there is an active poll
        log('It is an initial load.');
        const activePoll = Object.values(mergedPolls).find(
          pollItem => pollItem.status === PollStatus.ACTIVE,
        );
        if (activePoll) {
          log('It is an initial load. There is an active poll');
          setSidePanel(POLL_SIDEBAR_NAME);
        } else {
          log('It is an initial load. There are no active poll');
        }
      }
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
          user: {
            uid: localUid,
            name: defaultContent[localUid]?.name || 'user',
          },
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
    user: {
      uid: number;
      name: string;
    },
    timestamp: number,
  ) => {
    log('Received poll response:', {pollId, responses, user, timestamp});
    enhancedDispatch({
      type: PollActionKind.RECEIVE_POLL_ITEM_RESPONSES,
      payload: {
        id: pollId,
        responses,
        user,
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
    if (!pollId || !polls[pollId]) {
      log(
        'handlePollTaskRequest: Invalid pollId  or poll not found for handling',
        pollId,
      );
      return;
    }
    if (!(task in PollTaskRequestTypes)) {
      log('handlePollTaskRequest: Invalid valid task', task);
      return;
    }
    log(`Handling poll task request: ${task} for pollId: ${pollId}`);
    switch (task) {
      case PollTaskRequestTypes.SEND:
        if (polls[pollId].status === PollStatus.LATER) {
          setModalState({
            modalType: PollModalType.PREVIEW_POLL,
            id: pollId,
          });
        } else {
          sendPoll(pollId);
        }
        break;
      case PollTaskRequestTypes.SHARE:
        break;
      case PollTaskRequestTypes.VIEW_DETAILS:
        setModalState({
          modalType: PollModalType.VIEW_POLL_RESULTS,
          id: pollId,
        });
        break;
      case PollTaskRequestTypes.PUBLISH:
        enhancedDispatch({
          type: PollActionKind.PUBLISH_POLL_ITEM,
          payload: {pollId},
        });
        break;
      case PollTaskRequestTypes.DELETE_CONFIRMATION:
        setModalState({
          modalType: PollModalType.DELETE_POLL_CONFIRMATION,
          id: pollId,
        });
        break;
      case PollTaskRequestTypes.DELETE:
        enhancedDispatch({
          type: PollActionKind.DELETE_POLL_ITEM,
          payload: {pollId},
        });
        break;
      case PollTaskRequestTypes.FINISH_CONFIRMATION:
        setModalState({
          modalType: PollModalType.END_POLL_CONFIRMATION,
          id: pollId,
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
        log(`Unhandled task type: ${task}`);
        break;
    }
  };

  const value = {
    polls,
    startPollForm,
    editPollForm,
    sendPoll,
    savePoll,
    onPollReceived,
    onPollResponseReceived,
    sendResponseToPoll,
    sendPollResults,
    handlePollTaskRequest,
    modalState,
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
  PollModalType,
  PollTaskRequestTypes,
};

export type {Poll, PollItem, PollFormErrors, PollItemOptionItem};
