const GetMeetingInviteURL = (
  baseUrl: string,
  isHost: boolean,
  meetingPassphrase: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${baseUrl}/${meetingPassphrase.host}`,
        attendee: `${baseUrl}/${meetingPassphrase.attendee}`,
      };
    } else {
      return {
        host: `${baseUrl}/${meetingPassphrase.host}`,
      };
    }
  } else {
    return {
      attendee: `${baseUrl}/${meetingPassphrase.attendee}`,
    };
  }
};
const GetMeetingInviteID = (
  isHost: boolean,
  meetingPassphrase: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${meetingPassphrase.host}`,
        attendee: `${meetingPassphrase.attendee}`,
      };
    } else {
      return {
        host: `${meetingPassphrase.host}`,
      };
    }
  } else {
    return {
      attendee: `${meetingPassphrase.attendee}`,
    };
  }
};

export {GetMeetingInviteURL, GetMeetingInviteID};
