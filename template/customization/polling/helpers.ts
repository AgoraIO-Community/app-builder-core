import {Poll, PollItemOptionItem, PollKind} from './context/poll-context';

function log(...args: any[]) {
  console.log('[CustomPolling::] ', ...args);
}

function addVote(
  responses: string[],
  options: PollItemOptionItem[],
  uid: number,
  timestamp: number,
): PollItemOptionItem[] {
  return options.map((option: PollItemOptionItem) => {
    // Count how many times the value appears in the strings array
    const exists = responses.includes(option.value);
    const isVoted = option.votes.find(item => item.uid === uid);
    if (exists && !isVoted) {
      // Creating a new object explicitly
      const newOption: PollItemOptionItem = {
        ...option,
        ...option,
        votes: [
          ...option.votes,
          {
            uid,
            timestamp,
          },
        ],
      };
      return newOption;
    }
    // If no matches, return the option as is
    return option;
  });
}

function calculatePercentage(
  options: PollItemOptionItem[],
): PollItemOptionItem[] {
  const totalVotes = options.reduce(
    (total, item) => total + item.votes.length,
    0,
  );
  if (totalVotes === 0) {
    // As none of the users have voted, there is no need to calulate the percentage,
    // we can return the options as it is
    return options;
  }
  return options.map((option: PollItemOptionItem) => {
    let percentage = 0;
    if (option.votes.length > 0) {
      percentage = (option.votes.length / totalVotes) * 100;
    }
    // Creating a new object explicitly
    const newOption: PollItemOptionItem = {
      ...option,
      percent: percentage.toFixed(0),
    };
    return newOption;
  }) as PollItemOptionItem[];
}

function arrayToCsv(data: PollItemOptionItem[]): string {
  const headers = ['text', 'value', 'votes', 'percent']; // Define the headers
  const rows = data.map(item => {
    const voteIds = item.votes.map(vote => vote.uid).join(', '); // Combine vote uids into a single string
    return `${item.text},${voteIds}`;
  });

  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(data: string, filename: string = 'data.csv'): void {
  const blob = new Blob([data], {type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function hasUserVoted(options: PollItemOptionItem[], uid: number): boolean {
  // Loop through each option and check the votes array
  return options.some(option => option.votes.some(vote => vote.uid === uid));
}

function mergePolls(newPoll: Poll, oldPoll: Poll) {
  // Merge and discard absent properties

  // 1. Start with a copy of the current polls state
  const mergedPolls: Poll = {...oldPoll};
  // 2. Add or update polls from newPolls
  Object.keys(newPoll).forEach(pollId => {
    mergedPolls[pollId] = newPoll[pollId]; // Add or update each poll from newPolls
  });
  // 3. Remove polls that are not in newPolls
  Object.keys(mergedPolls).forEach(pollId => {
    if (!(pollId in newPoll)) {
      delete mergedPolls[pollId]; // Delete polls that are no longer present in newPolls
    }
  });

  return mergedPolls;
}

function getPollTypeDesc(type: PollKind): string {
  if (type === PollKind.OPEN_ENDED) {
    return 'Open Ended';
  }
  if (type === PollKind.YES_NO) {
    return 'Select Any One';
  }
  if (type === PollKind.MCQ) {
    return 'Select One or More';
  }
  return 'None';
}

export {
  log,
  mergePolls,
  hasUserVoted,
  downloadCsv,
  arrayToCsv,
  addVote,
  calculatePercentage,
  capitalizeFirstLetter,
  getPollTypeDesc,
};
