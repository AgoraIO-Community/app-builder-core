import React, {createContext, Dispatch} from 'react';
import SelectNewPollTypeModal from './modal/SelectNewPollTypeModal';
import CreatePollModal from './modal/CreatePollModal';
import PollPreviewModal from './modal/PollPreviewModal';
import SharePollModal from './modal/SharePollModal';

enum PollKind {
  OPEN_ENDED = 'OPEN_ENDED',
  MCQ = 'MCQ',
  YES_NO = 'YES_NO',
}

type PollAccess = 'public' | 'private';
type PollStatus = 'active' | 'finished' | 'later';

interface Poll {
  type: PollKind;
  access: PollAccess;
  status: PollStatus;
  title: string;
  question: string;
  options: Array<{
    text: string;
    value: string;
    votes: [];
  }> | null;
  multiple: boolean;
  share: boolean;
  duration: boolean;
  timer: number;
  createdBy: number;
}

const initializeNewPoll = (kind: PollKind): Poll => {
  if (kind === PollKind.OPEN_ENDED) {
    return {
      type: PollKind.OPEN_ENDED,
      access: 'public',
      status: 'later',
      title: 'Open Ended Poll',
      question: '',
      options: null,
      multiple: false,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
  if (kind === PollKind.MCQ) {
    return {
      type: PollKind.MCQ,
      access: 'public',
      status: 'later',
      title: 'Multiple Choice Question',
      question: '',
      options: [
        {
          text: '',
          value: '',
          votes: [],
        },
        {
          text: '',
          value: '',
          votes: [],
        },
        {
          text: '',
          value: '',
          votes: [],
        },
      ],
      multiple: true,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
  if (kind === PollKind.YES_NO) {
    return {
      type: PollKind.YES_NO,
      access: 'public',
      status: 'later',
      title: 'Yes/No',
      question: '',
      options: [
        {
          text: 'YES',
          value: 'yes',
          votes: [],
        },
        {
          text: 'No',
          value: 'no',
          votes: [],
        },
      ],
      multiple: false,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
};

// To DO

// An interface for our actions
// interface RecordingsActions<T> {
//   type: keyof typeof RecordingsActionKind;
//   payload: T;
// }

// const initialPollsState: PollState[] = [];

type PollUserActivity =
  | 'SELECT_NEW_POLL'
  | 'CREATE_POLL'
  | 'PREVIEW_POLL'
  | 'SHARE_POLL';

interface PollObject {
  [key: string]: Poll;
}
interface PollState {
  form: Poll;
  nextUserActivity: PollUserActivity;
  poll: PollObject;
}
enum PollActionKind {
  SELECT_NEW_POLL = 'SELECT_NEW_POLL',
  EDIT_POLL_FORM_FIELD = 'EDIT_POLL_FORM_FIELD',
  EDIT_POLL_FORM_OPTION = 'EDIT_POLL_FORM_OPTION',
  ADD_POLL_FORM_OPTION = 'ADD_POLL_FORM_OPTION',
  DELETE_POLL_FORM_OPTION = 'DELETE_POLL_FORM_OPTION',
  PREVIEW_POLL_FORM = 'PREVIEW_POLL_FORM',
  EDIT_POLL_FORM = 'EDIT_POLL_FORM',
  SAVE_POLL_FORM = 'SAVE_POLL_FORM',
  LAUNCH_POLL_FORM = 'LAUNCH_POLL_FORM',
}
interface PollAction {
  type: PollActionKind;
  payload: any;
}
function pollReducer(state: PollState, action: PollAction): PollState {
  switch (action.type) {
    case PollActionKind.SELECT_NEW_POLL: {
      return {
        ...state,
        nextUserActivity: 'CREATE_POLL',
        form: initializeNewPoll(action.payload),
      };
    }
    case PollActionKind.EDIT_POLL_FORM_FIELD: {
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.field]: action.payload.value,
        },
      };
    }
    case PollActionKind.ADD_POLL_FORM_OPTION: {
      return {
        ...state,
        form: {
          ...state.form,
          options: [
            ...state.form.options,
            {
              text: '',
              value: '',
              votes: [],
            },
          ],
        },
      };
    }
    case PollActionKind.EDIT_POLL_FORM_OPTION: {
      return {
        ...state,
        form: {
          ...state.form,
          options: state.form.options.map((option, i) => {
            if (i === action.payload.key) {
              const value = action.payload.value
                .replace(/\s+/g, '-')
                .toLowerCase();
              return {
                ...option,
                text: action.payload.value,
                value,
                votes: [],
              };
            }
            return option;
          }),
        },
      };
    }
    case PollActionKind.DELETE_POLL_FORM_OPTION: {
      return {
        ...state,
        form: {
          ...state.form,
          options: state.form.options.filter(
            (option, i) => i !== action.payload.key,
          ),
        },
      };
    }
    case PollActionKind.PREVIEW_POLL_FORM: {
      return {
        ...state,
        nextUserActivity: 'PREVIEW_POLL',
      };
    }
    case PollActionKind.EDIT_POLL_FORM: {
      return {
        ...state,
        nextUserActivity: 'CREATE_POLL',
      };
    }
    case PollActionKind.SAVE_POLL_FORM: {
      return {
        ...state,
        form: {
          ...state.form,
          status: 'later',
        },
        nextUserActivity: null,
      };
    }
    case PollActionKind.LAUNCH_POLL_FORM: {
      return {
        ...state,
        form: {
          ...state.form,
          status: 'active',
        },
        nextUserActivity: null,
      };
    }
    default: {
      return state;
    }
  }
}

interface PollContextValue {
  state: PollState;
  dispatch: any;
}

const PollContext = createContext<PollContextValue | null>(null);
PollContext.displayName = 'PollContext';

function PollProvider({children}: {children: React.ReactNode}) {
  const [state, dispatch] = React.useReducer(pollReducer, {
    form: null,
    nextUserActivity: 'SELECT_NEW_POLL',
    poll: {},
  });

  const value = {state, dispatch};
  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

function usePoll() {
  const context = React.useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
}

export {PollProvider, usePoll, PollKind, PollActionKind};
