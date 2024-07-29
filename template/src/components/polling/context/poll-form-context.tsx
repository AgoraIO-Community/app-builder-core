import React, {Dispatch, createContext, useContext, useReducer} from 'react';

enum PollAccess {
  PUBLIC = 'PUBLIC',
}

enum PollStatus {
  ACTIVE = 'PUBLIC',
  FINISHED = 'FINISHED',
  LATER = 'LATER',
}

enum PollKind {
  OPEN_ENDED = 'OPEN_ENDED',
  MCQ = 'MCQ',
  YES_NO = 'YES_NO',
}

enum PollActionKind {
  START_POLL = 'START_POLL',
  SELECT_POLL = 'SELECT_POLL',
  UPDATE_FORM_FIELD = 'UPDATE_FORM_FIELD',
  UPDATE_FORM_OPTION = 'UPDATE_FORM_OPTION',
  ADD_FORM_OPTION = 'ADD_FORM_OPTION',
  DELETE_FORM_OPTION = 'DELETE_FORM_OPTION',
  PREVIEW_FORM = 'PREVIEW_FORM',
  UPDATE_FORM = 'UPDATE_FORM',
  SAVE_FORM = 'SAVE_FORM',
  LAUNCH_FORM = 'LAUNCH_FORM',
}

interface PollItem {
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

type PollFormAction =
  | {
      type: PollActionKind.START_POLL;
    }
  | {
      type: PollActionKind.SELECT_POLL;
      payload: {
        pollType: PollKind;
      };
    }
  | {
      type: PollActionKind.UPDATE_FORM_FIELD;
      payload: {
        field: string;
        value: string | boolean;
      };
    }
  | {
      type: PollActionKind.ADD_FORM_OPTION;
    }
  | {
      type: PollActionKind.UPDATE_FORM_OPTION;
      payload: {
        index: number;
        value: string;
      };
    }
  | {
      type: PollActionKind.DELETE_FORM_OPTION;
      payload: {
        index: number;
      };
    }
  | {
      type: PollActionKind.PREVIEW_FORM;
    }
  | {
      type: PollActionKind.SAVE_FORM;
    }
  | {
      type: PollActionKind.UPDATE_FORM;
    }
  | {
      type: PollActionKind.LAUNCH_FORM;
    };

const initPollForm = (kind: PollKind): PollItem => {
  if (kind === PollKind.OPEN_ENDED) {
    return {
      type: PollKind.OPEN_ENDED,
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
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
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
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
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
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

interface PollFormState {
  form: PollItem;
  currentStep: 'START_POLL' | 'SELECT_POLL' | 'CREATE_POLL' | 'PREVIEW_POLL';
}

function pollFormReducer(
  state: PollFormState,
  action: PollFormAction,
): PollFormState {
  switch (action.type) {
    case PollActionKind.START_POLL: {
      return {
        ...state,
        form: null,
        currentStep: 'SELECT_POLL',
      };
    }
    case PollActionKind.SELECT_POLL: {
      return {
        ...state,
        currentStep: 'CREATE_POLL',
        form: initPollForm(action.payload.pollType),
      };
    }
    case PollActionKind.UPDATE_FORM_FIELD: {
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.field]: action.payload.value,
        },
      };
    }
    case PollActionKind.ADD_FORM_OPTION: {
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
    case PollActionKind.UPDATE_FORM_OPTION: {
      return {
        ...state,
        form: {
          ...state.form,
          options: state.form.options.map((option, i) => {
            if (i === action.payload.index) {
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
    case PollActionKind.DELETE_FORM_OPTION: {
      return {
        ...state,
        form: {
          ...state.form,
          options: state.form.options.filter(
            (option, i) => i !== action.payload.index,
          ),
        },
      };
    }
    case PollActionKind.PREVIEW_FORM: {
      return {
        ...state,
        currentStep: 'PREVIEW_POLL',
      };
    }
    case PollActionKind.UPDATE_FORM: {
      return {
        ...state,
        currentStep: 'CREATE_POLL',
      };
    }
    case PollActionKind.SAVE_FORM: {
      return {
        ...state,
        form: {
          ...state.form,
          status: PollStatus.LATER,
        },
        currentStep: null,
      };
    }
    case PollActionKind.LAUNCH_FORM: {
      return {
        ...state,
        form: {
          ...state.form,
          status: PollStatus.ACTIVE,
        },
        currentStep: null,
      };
    }
    default: {
      return state;
    }
  }
}

interface PollFormContextValue {
  state: PollFormState;
  dispatch: Dispatch<PollFormAction>;
}

const PollFormContext = createContext<PollFormContextValue | null>(null);
PollFormContext.displayName = 'PollFormContext';

function PollFormProvider({children}: {children?: React.ReactNode}) {
  const [state, dispatch] = useReducer(pollFormReducer, {
    form: null,
    currentStep: null,
  });

  const value = {state, dispatch};

  return (
    <PollFormContext.Provider value={value}>
      {children}
    </PollFormContext.Provider>
  );
}

function usePollForm() {
  const context = useContext(PollFormContext);
  if (!context) {
    throw new Error('usePollForm must be used within PollFormProvider ');
  }
  return context;
}

export {PollFormProvider, usePollForm, PollActionKind, PollKind};
export type {PollItem};
