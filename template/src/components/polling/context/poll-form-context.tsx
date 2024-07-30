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

enum PollFormActionKind {
  START_POLL = 'START_POLL',
  SELECT_POLL = 'SELECT_POLL',
  UPDATE_FORM_FIELD = 'UPDATE_FORM_FIELD',
  UPDATE_FORM_OPTION = 'UPDATE_FORM_OPTION',
  ADD_FORM_OPTION = 'ADD_FORM_OPTION',
  DELETE_FORM_OPTION = 'DELETE_FORM_OPTION',
  PREVIEW_FORM = 'PREVIEW_FORM',
  UPDATE_FORM = 'UPDATE_FORM',
  SAVE_FORM = 'SAVE_FORM',
  POLL_FORM_CLOSE = 'POLL_FORM_CLOSE',
}

type PollFormAction =
  | {
      type: PollFormActionKind.START_POLL;
    }
  | {
      type: PollFormActionKind.SELECT_POLL;
      payload: {
        pollType: PollKind;
      };
    }
  | {
      type: PollFormActionKind.UPDATE_FORM_FIELD;
      payload: {
        field: string;
        value: string | boolean;
      };
    }
  | {
      type: PollFormActionKind.ADD_FORM_OPTION;
    }
  | {
      type: PollFormActionKind.UPDATE_FORM_OPTION;
      payload: {
        index: number;
        value: string;
      };
    }
  | {
      type: PollFormActionKind.DELETE_FORM_OPTION;
      payload: {
        index: number;
      };
    }
  | {
      type: PollFormActionKind.PREVIEW_FORM;
    }
  | {
      type: PollFormActionKind.SAVE_FORM;
      payload: {
        launch: boolean;
        createdBy: number;
      };
    }
  | {
      type: PollFormActionKind.UPDATE_FORM;
    }
  | {
      type: PollFormActionKind.POLL_FORM_CLOSE;
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

const getPollTimer = (isDurationEnabled: boolean) => {
  if (isDurationEnabled) {
    return 10000;
  }
  return -1;
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
    case PollFormActionKind.START_POLL: {
      return {
        ...state,
        form: null,
        currentStep: 'SELECT_POLL',
      };
    }
    case PollFormActionKind.SELECT_POLL: {
      return {
        ...state,
        currentStep: 'CREATE_POLL',
        form: initPollForm(action.payload.pollType),
      };
    }
    case PollFormActionKind.UPDATE_FORM_FIELD: {
      return {
        ...state,
        form: {
          ...state.form,
          [action.payload.field]: action.payload.value,
          ...(action.payload.field === 'duration' && {
            timer: getPollTimer(action.payload.value as boolean),
          }),
        },
      };
    }
    case PollFormActionKind.ADD_FORM_OPTION: {
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
    case PollFormActionKind.UPDATE_FORM_OPTION: {
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
    case PollFormActionKind.DELETE_FORM_OPTION: {
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
    case PollFormActionKind.PREVIEW_FORM: {
      return {
        ...state,
        currentStep: 'PREVIEW_POLL',
      };
    }
    case PollFormActionKind.UPDATE_FORM: {
      return {
        ...state,
        currentStep: 'CREATE_POLL',
      };
    }
    // case PollFormActionKind.SAVE_FORM: {
    //   return {
    //     ...state,
    //     form: {
    //       ...state.form,
    //       status: action.payload.launch ? PollStatus.ACTIVE : PollStatus.LATER,
    //     },
    //     currentStep: null,
    //   };
    // }
    case PollFormActionKind.POLL_FORM_CLOSE: {
      return {
        form: null,
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
    currentStep: 'SELECT_POLL',
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

export {
  PollFormProvider,
  usePollForm,
  PollFormActionKind,
  PollKind,
  PollStatus,
};
export type {PollItem};
