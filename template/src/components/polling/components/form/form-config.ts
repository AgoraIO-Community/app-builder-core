import {nanoid} from 'nanoid';
import {
  PollKind,
  PollItem,
  PollAccess,
  PollStatus,
} from '../../context/poll-context';

const getDefaultPollTimer = (isDurationEnabled: boolean) => {
  if (isDurationEnabled) {
    return 10000;
  }
  return -1;
};

const initPollForm = (kind: PollKind): PollItem => {
  if (kind === PollKind.OPEN_ENDED) {
    return {
      id: nanoid(4),
      type: PollKind.OPEN_ENDED,
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
      question: '',
      answers: null,
      options: null,
      multiple_response: false,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
  if (kind === PollKind.MCQ) {
    return {
      id: nanoid(4),
      type: PollKind.MCQ,
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
      question: '',
      answers: null,
      options: [
        {
          text: '',
          value: '',
          votes: null,
        },
        {
          text: '',
          value: '',
          votes: null,
        },
        {
          text: '',
          value: '',
          votes: null,
        },
      ],
      multiple_response: true,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
  if (kind === PollKind.YES_NO) {
    return {
      id: nanoid(4),
      type: PollKind.YES_NO,
      access: PollAccess.PUBLIC,
      status: PollStatus.LATER,
      question: '',
      answers: null,
      options: [
        {
          text: 'YES',
          value: 'yes',
          votes: null,
        },
        {
          text: 'No',
          value: 'no',
          votes: null,
        },
      ],
      multiple_response: false,
      share: false,
      duration: false,
      timer: -1,
      createdBy: -1,
    };
  }
};

export {getDefaultPollTimer, initPollForm};
