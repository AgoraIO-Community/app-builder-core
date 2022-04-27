const GetMeetingInviteURL = (
  baseUrl: string,
  attendee: string,
  host?: string,
) => {
  if (host) {
    return {
      host: `${baseUrl}/${host}`,
      attendee: `${baseUrl}/${attendee}`,
    };
  } else {
    return {
      attendee: `${baseUrl}/${attendee}`,
    };
  }
};
const GetMeetingInviteID = (attendee: string, host?: string) => {
  if (host) {
    return {
      host: `${host}`,
      attendee: `${attendee}`,
    };
  } else {
    return {
      attendee: `${attendee}`,
    };
  }
};

export {GetMeetingInviteURL, GetMeetingInviteID};
