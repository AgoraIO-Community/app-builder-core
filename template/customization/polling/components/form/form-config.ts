import {nanoid} from 'nanoid';
import {
  PollKind,
  PollItem,
  PollAccess,
  PollStatus,
} from '../../context/poll-context';

const POLL_DURATION = 600; // takes seconds

const getPollExpiresAtTime = (interval: number): number => {
  const t = new Date();
  const expiresAT = t.setSeconds(t.getSeconds() + interval);
  return expiresAT;
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
      expiresAt: null,
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
          votes: [],
          percent: '0',
        },
        {
          text: '',
          value: '',
          votes: [],
          percent: '0',
        },
        {
          text: '',
          value: '',
          votes: [],
          percent: '0',
        },
      ],
      multiple_response: true,
      share: false,
      duration: false,
      expiresAt: null,
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
          votes: [],
          percent: '0',
        },
        {
          text: 'No',
          value: 'no',
          votes: [],
          percent: '0',
        },
      ],
      multiple_response: false,
      share: false,
      duration: false,
      expiresAt: null,
      createdBy: -1,
    };
  }
};

const getAttributeLengthInKb = (attribute: string): string => {
  const b = attribute.length * 2;
  const kb = (b / 1024).toFixed(2);
  return kb;
};

const isAttributeLengthValid = (attribute: string) => {
  if (getAttributeLengthInKb(attribute) > '8') {
    return false;
  }
  return true;
};

export {
  getPollExpiresAtTime,
  initPollForm,
  isAttributeLengthValid,
  POLL_DURATION,
};
