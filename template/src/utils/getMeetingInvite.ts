const GetMeetingInviteURL = (
  baseUrl: string,
  isHost: boolean,
  roomId: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${baseUrl}/${roomId.host}`,
        attendee: `${baseUrl}/${roomId.attendee}`,
      };
    } else {
      return {
        host: `${baseUrl}/${roomId.host}`,
      };
    }
  } else {
    return {
      attendee: `${baseUrl}/${roomId.attendee}`,
    };
  }
};
const GetMeetingInviteID = (
  isHost: boolean,
  roomId: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${roomId.host}`,
        attendee: `${roomId.attendee}`,
      };
    } else {
      return {
        host: `${roomId.host}`,
      };
    }
  } else {
    return {
      attendee: `${roomId.attendee}`,
    };
  }
};

export {GetMeetingInviteURL, GetMeetingInviteID};
