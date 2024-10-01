import {nanoid} from 'nanoid';
import {PollKind, PollItem, PollStatus} from '../../context/poll-context';

const POLL_DURATION = 600; // takes seconds

const getPollExpiresAtTime = (interval: number): number => {
  const t = new Date();
  const expiresAT = t.setSeconds(t.getSeconds() + interval);
  return expiresAT;
};

const initPollForm = (kind: PollKind, localUid: number): PollItem => {
  if (kind === PollKind.OPEN_ENDED) {
    return {
      id: nanoid(4),
      type: PollKind.OPEN_ENDED,
      status: PollStatus.LATER,
      question: '',
      answers: null,
      options: null,
      multiple_response: false,
      share_attendee: true,
      share_host: true,
      anonymous: false,
      duration: false,
      expiresAt: 0,
      createdBy: localUid,
    };
  }
  if (kind === PollKind.MCQ) {
    return {
      id: nanoid(4),
      type: PollKind.MCQ,
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
      share_attendee: true,
      share_host: true,
      anonymous: false,
      duration: false,
      expiresAt: 0,
      createdBy: localUid,
    };
  }
  if (kind === PollKind.YES_NO) {
    return {
      id: nanoid(4),
      type: PollKind.YES_NO,
      status: PollStatus.LATER,
      question: '',
      answers: null,
      options: [
        {
          text: 'Yes',
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
      share_attendee: true,
      share_host: true,
      anonymous: false,
      duration: false,
      expiresAt: 0,
      createdBy: localUid,
    };
  }
  // If none of the above conditions are met, throw an error or return a default value
  throw new Error(`Unknown PollKind: ${kind}`);
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
