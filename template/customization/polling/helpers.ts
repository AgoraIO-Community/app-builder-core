import {isMobileUA, isWeb} from 'customization-api';
import {Poll, PollItemOptionItem, PollKind} from './context/poll-context';
import pollIcons from './poll-icons';

function log(...args: any[]) {
  console.log('[Custom-Polling::] supriya ', ...args);
}

function addVote(
  responses: string[],
  options: PollItemOptionItem[],
  user: {name: string; uid: number},
  timestamp: number,
): PollItemOptionItem[] {
  return options.map((option: PollItemOptionItem) => {
    // Count how many times the value appears in the strings array
    const exists = responses.includes(option.value);
    const isVoted = option.votes.find(item => item.uid === user.uid);
    if (exists && !isVoted) {
      // Creating a new object explicitly
      const newOption: PollItemOptionItem = {
        ...option,
        ...option,
        votes: [
          ...option.votes,
          {
            ...user,
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

function arrayToCsv(question: string, data: PollItemOptionItem[]): string {
  const headers = ['Option', 'Votes', 'Percent']; // Define the headers
  const rows = data.map(item => {
    const count = item.votes.length;
    // Handle missing or undefined value
    const voteText = item.text ? `"${item.text}"` : '""';
    const votesCount = count !== undefined ? count : '0';
    const votePercent = item.percent !== undefined ? `${item.percent}%` : '0%';

    return `${voteText},${votesCount},${votePercent}`;
  });
  // Include poll question at the top
  const pollQuestion = `Poll Question: "${question}"`;
  return [pollQuestion, '', headers.join(','), ...rows].join('\n');
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

function capitalizeFirstLetter(sentence: string): string {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
}

function hasUserVoted(options: PollItemOptionItem[], uid: number): boolean {
  // Loop through each option and check the votes array
  return options.some(option => option.votes.some(vote => vote.uid === uid));
}

type MergePollsResult = {
  mergedPolls: Poll;
  deletedPollIds: string[];
};

function mergePolls(newPoll: Poll, oldPoll: Poll): MergePollsResult {
  // Merge and discard absent properties

  // 1. Start with a copy of the current polls state
  const mergedPolls: Poll = {...oldPoll};

  // 2. Array to track deleted poll IDs
  const deletedPollIds: string[] = [];

  // 3. Add or update polls from newPolls
  Object.keys(newPoll).forEach(pollId => {
    mergedPolls[pollId] = newPoll[pollId]; // Add or update each poll from newPolls
  });

  // 4. Remove polls that are not in newPolls and track deleted poll IDs
  Object.keys(oldPoll).forEach(pollId => {
    if (!(pollId in newPoll)) {
      delete mergedPolls[pollId]; // Delete polls that are no longer present in newPolls
      deletedPollIds.push(pollId); // Track deleted poll ID
    }
  });

  // 5. Return the merged polls and deleted poll IDs
  return {mergedPolls, deletedPollIds};
}

function getPollTypeIcon(type: PollKind): string {
  if (type === PollKind.OPEN_ENDED) {
    return pollIcons.question;
  }
  if (type === PollKind.YES_NO) {
    return pollIcons['like-dislike'];
  }
  if (type === PollKind.MCQ) {
    return pollIcons.mcq;
  }
  return pollIcons.question;
}

function getPollTypeDesc(type: PollKind, multiple_response?: boolean): string {
  if (type === PollKind.OPEN_ENDED) {
    return 'Open Ended';
  }
  if (type === PollKind.YES_NO) {
    return 'Select Any One';
  }
  if (type === PollKind.MCQ) {
    if (multiple_response) {
      return 'MCQ - Select One or More';
    }
    return 'MCQ - Select Any One';
  }
  return 'None';
}

function formatTimestampToTime(timestamp: number): string {
  // Create a new Date object using the timestamp
  const date = new Date(timestamp);
  // Get hours and minutes from the Date object
  let hours = date.getHours();
  const minutes = date.getMinutes();
  // Determine if it's AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  // Format minutes to always have two digits
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  // Construct the formatted time string
  return `${hours}:${formattedMinutes} ${ampm}`;
}

function calculateTotalVotes(options: Array<PollItemOptionItem>): number {
  // Use reduce to sum up the length of the votes array for each option
  return options.reduce((total, option) => total + option.votes.length, 0);
}

const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = 300,
) => {
  let debounceTimer: ReturnType<typeof setTimeout>;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const isWebOnly = () => isWeb() && !isMobileUA();

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
  formatTimestampToTime,
  calculateTotalVotes,
  debounce,
  getPollTypeIcon,
  isWebOnly,
};
