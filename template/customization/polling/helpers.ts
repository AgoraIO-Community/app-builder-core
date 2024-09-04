import {PollAccess, PollItemOptionItem} from './context/poll-context';

function addVote(
  responses: string[],
  options: PollItemOptionItem[],
  uid: number,
  timestamp: number,
): PollItemOptionItem[] {
  return options.map((option: PollItemOptionItem) => {
    // Count how many times the value appears in the strings array
    const exists = responses.includes(option.value);
    if (exists) {
      // Creating a new object explicitly
      const newOption: PollItemOptionItem = {
        ...option,
        ...option,
        votes: [
          ...option.votes,
          {
            uid,
            access: PollAccess.PUBLIC,
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
  console.log(
    'supriya name',
    string.charAt(0).toUpperCase() + string.slice(1).toLowerCase(),
  );
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function iVoted(options: PollItemOptionItem[], myUid: number): boolean {
  return options.some(optionItem =>
    optionItem.votes.some(item => item.uid === myUid),
  );
}

export {
  iVoted,
  downloadCsv,
  arrayToCsv,
  addVote,
  calculatePercentage,
  capitalizeFirstLetter,
};
