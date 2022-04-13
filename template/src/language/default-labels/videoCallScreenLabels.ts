import {BaseI18nType, ConditionalI18nType, DynamicI18nType} from '../i18nTypes';
export interface NetworkQualityStatusInterface {
  unknown?: 'Unknown';
  excellent?: 'Excellent';
  good?: 'Good';
  bad?: 'Bad';
  veryBad?: 'Very Bad';
  unpublished?: 'Unpublished';
  loading?: 'Loading';
}
export interface MeetingInviteParam {
  meetingName?: string;
  pstn?: {
    number: string;
    pin: string;
  };
  url?: {
    host: string;
    attendee: string;
  };
  id?: {
    host: string;
    attendee: string;
  };
  hostControlCheckbox?: boolean;
  platform?: string;
  frontendEndpoint?: string;
}
export interface VideoCallScreenLabelsInterface {
  video?: BaseI18nType;
  audio?: BaseI18nType;
  screenShareButton?: BaseI18nType;
  record?: BaseI18nType;
  recording?: BaseI18nType;
  recordingNotificationLabel?: BaseI18nType;
  endCallButton?: BaseI18nType;
  participantsLabel?: BaseI18nType;
  groupChatLabel?: BaseI18nType;
  privateChatLabel?: BaseI18nType;
  chatMessageInputPlaceholder?: BaseI18nType;
  hostControlsLabel?: BaseI18nType;
  muteAllVideoButton?: BaseI18nType;
  muteAllAudioButton?: BaseI18nType;
  switchCameraButton?: BaseI18nType;
  localScreenshareDefaultLabel?: BaseI18nType;
  localUserDefaultLabel?: BaseI18nType;
  remoteUserDefaultLabel?: BaseI18nType;
  pstnUserLabel?: BaseI18nType;
  authenticationSuccessLabel?: BaseI18nType;
  meetingCreatedNotificationLabel?: BaseI18nType;
  joiningLoaderLabel?: BaseI18nType;
  oauthLoginLabel?: BaseI18nType;
  oauthProviderLabel?: BaseI18nType;
  copyMeetingInviteButton?: BaseI18nType;
  pin?: BaseI18nType;
  language?: BaseI18nType;
  screensharingActiveOverlayLabel?: BaseI18nType;
  recordingButton?: ConditionalI18nType;
  screenshareUserName?: DynamicI18nType;
  messageSenderNotificationLabel?: DynamicI18nType;
  networkQualityLabel?: BaseI18nType<keyof NetworkQualityStatusInterface>;
  meetingInviteText?: BaseI18nType<MeetingInviteParam>;
  noOneJoinedLabel?: BaseI18nType;
  noLiveStreamingRequests?: BaseI18nType;
  liveStreamingRequest?: BaseI18nType;
  hostLabel?: BaseI18nType;
  audienceLabel?: BaseI18nType;
  raiseHandStatusText?: ConditionalI18nType;
  noUserFoundLabel?: BaseI18nType;
  raiseHandRequestMessage?: BaseI18nType;
  raiseHandRequestReceivedMessage?: ConditionalI18nType;
  raiseHandRequestAcceptedMessage?: BaseI18nType;
  raiseHandRequestRejectedMessage?: BaseI18nType;
  raiseHandRequestRecallMessage?: ConditionalI18nType;
  raiseHandRequestRecallLocalMessage?: BaseI18nType;
  raiseHandApprovedRequestRecallMessage?: BaseI18nType;
}

export const VideoCallScreenLabels: VideoCallScreenLabelsInterface = {
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
