import {i18nInterface} from './i18nTypes';

//split below data by screenwise
export const DEFAULT_TEXTS: i18nInterface['data'] = {
  meetingNameInputPlaceholder: 'Name your Meeting',
  usePSTN: 'Use PSTN (Join by dialing a number)',
  loadingWithDots: 'Loading...',
  createMeetingButton: 'Create Meeting',
  haveMeetingID: 'Have a Meeting ID?',
  meetingIdInputPlaceholder: 'Enter Meeting ID',
  enterMeetingButton: 'Enter Meeting',
  attendeeUrlLabel: 'Attendee URL',
  hostUrlLabel: 'Host URL',
  enterMeetingAfterCreateButton: 'Start Meeting (as host)',
  copyInvite: 'Copy invite to clipboard',
  pstnLabel: 'PSTN',
  pstnNumberLabel: 'Number',
  meetingUrlLabel: 'Meeting URL',
  hostIdLabel: 'Host ID',
  meetingIdLabel: 'Meeting ID',
  attendeeIdLabel: 'Attendee ID',
  copiedToClipboardNotificationLabel: 'Copied to Clipboard',
  PSTNNumber: 'PSTN Number',
  PSTNPin: 'PSTN Pin',
  meeting: 'Meeting',
  URLForAttendee: 'URL for Attendee',
  URLForHost: 'URL for Host',
  attendeeMeetingID: 'Attendee Meeting ID',
  hostMeetingID: 'Host Meeting ID',
  precallLabel: 'Precall',
  selectInputDeviceLabel: 'Select Input Device',
  userNamePlaceholder: 'Display name*',
  fetchingNamePlaceholder: 'Getting name...',
  video: 'Video',
  audio: 'Audio',
  screenShareButton: 'Share',
  record: 'Record',
  recording: 'Recording',
  recordingNotificationLabel: 'Recording Started',
  endCallButton: 'Hang Up',
  participantsLabel: 'Participants',
  groupChatLabel: 'Group',
  privateChatLabel: 'Private',
  chatMessageInputPlaceholder: 'Type your message..',
  hostControlsLabel: 'Host Controls',
  muteAllAudioButton: 'Mute all audios',
  muteAllVideoButton: 'Mute all videos',
  switchCameraButton: 'Switch',
  localScreenshareDefaultLabel: 'Your screenshare',
  localUserDefaultLabel: 'You',
  remoteUserDefaultLabel: 'User',
  pstnUserLabel: 'PSTN User',
  authenticationSuccessLabel: 'Authenticated Successfully!',
  meetingCreatedNotificationLabel: 'Created',
  joiningLoaderLabel: 'Starting Call. Just a second.',
  oauthLoginLabel: 'Login using OAuth',
  oauthProviderLabel: 'Please select an OAuth provider to login.',
  copyMeetingInviteButton: 'Copy Meeting Invite',
  goBackButton: 'Go back',
  logoutButton: 'Logout',
  googleAuthButton: 'Google',
  microsoftAuthButton: 'Microsoft',
  slackAuthButton: 'Slack',
  appleAuthButton: 'Apple',
  pin: 'Pin',
  language: 'Language',
  screensharingActiveOverlayLabel: 'Your screen share is active.',
  screenshareUserName: (name) => `${name}'s screenshare`,
  hostControlsToggle: (toggle) =>
    toggle
      ? 'Restrict Host Controls (Separate host link)'
      : 'Restrict Host Controls (Everyone is a Host)',
  joinRoomButton: (ready) => (ready ? 'Join Room' : 'Loading...'),
  recordingButton: (recording) => (recording ? 'Recording' : 'Record'),
  messageSenderNotificationLabel: (name) => `From : ${name}`,
  networkQualityLabel: (quality) => {
    switch (quality) {
      case 'unknown':
        return 'Unknown';
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'bad':
        return 'Bad';
      case 'veryBad':
        return 'Very Bad';
      case 'unpublished':
        return 'Unpublished';
      case 'loading':
        return 'Loading';
      default:
        return 'Loading';
    }
  },
  meetingInviteText: ({
    frontendEndpoint,
    meetingName,
    id,
    url,
    pstn,
    hostControlCheckbox,
    platform,
  }) => {
    let inviteContent = '';
    if (frontendEndpoint) {
      if (hostControlCheckbox) {
        inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${frontendEndpoint}/${url?.attendee}\nURL for Host: ${frontendEndpoint}/${url?.host}`;
      } else {
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${frontendEndpoint}/${url?.host}`;
      }
    } else if (platform === 'web') {
      if (hostControlCheckbox) {
        inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${window.location.origin}/${url?.attendee}\nURL for Host: ${window.location.origin}/${url?.host}`;
      } else {
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${window.location.origin}/${url?.host}`;
      }
    } else {
      if (hostControlCheckbox) {
        inviteContent += `Meeting - ${meetingName}\nAttendee Meeting ID: ${id?.attendee}\nHost Meeting ID: ${id?.host}`;
      } else {
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${url?.host}`;
      }
    }
    if (pstn) {
      inviteContent += `\nPSTN Number: ${pstn.number}\nPSTN Pin: ${pstn.pin}`;
    }
    return inviteContent;
  },
};
