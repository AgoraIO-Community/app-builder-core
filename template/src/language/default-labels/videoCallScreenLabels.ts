import {i18nInterface} from '../i18nTypes';

export const VideoCallScreenLabels: i18nInterface['data'] = {
  video: 'Video',
  audio: 'Audio',
  screenShareButton: 'Share',
  record: 'Record',
  recording: 'Recording',
  switchCameraButton: 'Switch',
  recordingNotificationLabel: 'Recording Started',
  endCallButton: 'Hang Up',
  participantsLabel: 'Participants',
  groupChatLabel: 'Group',
  privateChatLabel: 'Private',
  chatMessageInputPlaceholder: 'Type your message..',
  meeting: 'Meeting',
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
  pin: 'Pin',
  language: 'Language',
  hostControlsLabel: 'Host Controls',
  muteAllAudioButton: 'Mute all audios',
  muteAllVideoButton: 'Mute all videos',
  screensharingActiveOverlayLabel: 'Your screen share is active.',
  noOneJoinedLabel: 'No one has joined yet',
  noLiveStreamingRequests: 'No streaming request(s)',
  liveStreamingRequest: 'Streaming Request',
  hostLabel: 'Host',
  audienceLabel: 'Audience',
  noUserFoundLabel: 'User not found',
  raiseHandRequestMessage:
    'You have raised your hand. Request sent to host for approval',
  raiseHandRequestReceivedMessage: (name) => `${name} has raised their hand`,
  raiseHandRequestAcceptedMessage:
    'Your request was approved, unmute to start talking',
  raiseHandRequestRejectedMessage: 'Your request was rejected by the host',
  raiseHandRequestRecallMessage: (name) => `${name} has lowered their hand`,
  raiseHandRequestRecallLocalMessage: 'You have lowered your hand',
  raiseHandApprovedRequestRecallMessage:
    'The host has revoked streaming permissions',
  screenshareUserName: (name) => `${name}'s screenshare`,
  recordingButton: (recording) => (recording ? 'Recording' : 'Record'),
  raiseHandStatusText: (handStatus) =>
    handStatus ? 'Lower hand' : 'Raise Hand',
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
