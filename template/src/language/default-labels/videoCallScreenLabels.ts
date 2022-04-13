import {I18nBaseType, I18nConditionalType, I18nDynamicType} from '../i18nTypes';
interface NetworkQualityStatusInterface {
  unknown?: 'Unknown';
  excellent?: 'Excellent';
  good?: 'Good';
  bad?: 'Bad';
  veryBad?: 'Very Bad';
  unpublished?: 'Unpublished';
  loading?: 'Loading';
}
export type NetworkQualities = keyof NetworkQualityStatusInterface;
export interface MeetingInviteInterface {
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
export interface I18nVideoCallScreenLabelsInterface {
  video?: I18nBaseType;
  audio?: I18nBaseType;
  screenShareButton?: I18nBaseType;
  record?: I18nBaseType;
  recording?: I18nBaseType;
  recordingNotificationLabel?: I18nBaseType;
  endCallButton?: I18nBaseType;
  participantsLabel?: I18nBaseType;
  groupChatLabel?: I18nBaseType;
  privateChatLabel?: I18nBaseType;
  chatMessageInputPlaceholder?: I18nBaseType;
  hostControlsLabel?: I18nBaseType;
  muteAllVideoButton?: I18nBaseType;
  muteAllAudioButton?: I18nBaseType;
  switchCameraButton?: I18nBaseType;
  localScreenshareDefaultLabel?: I18nBaseType;
  localUserDefaultLabel?: I18nBaseType;
  remoteUserDefaultLabel?: I18nBaseType;
  pstnUserLabel?: I18nBaseType;
  authenticationSuccessLabel?: I18nBaseType;
  meetingCreatedNotificationLabel?: I18nBaseType;
  joiningLoaderLabel?: I18nBaseType;
  oauthLoginLabel?: I18nBaseType;
  oauthProviderLabel?: I18nBaseType;
  copyMeetingInviteButton?: I18nBaseType;
  pin?: I18nBaseType;
  language?: I18nBaseType;
  screensharingActiveOverlayLabel?: I18nBaseType;
  recordingButton?: I18nConditionalType;
  screenshareUserName?: I18nDynamicType;
  messageSenderNotificationLabel?: I18nDynamicType;
  networkQualityLabel?: I18nBaseType<NetworkQualities>;
  meetingInviteText?: I18nBaseType<MeetingInviteInterface>;
  noOneJoinedLabel?: I18nBaseType;
  noLiveStreamingRequests?: I18nBaseType;
  liveStreamingRequest?: I18nBaseType;
  hostLabel?: I18nBaseType;
  audienceLabel?: I18nBaseType;
  raiseHandStatusText?: I18nConditionalType;
  noUserFoundLabel?: I18nBaseType;
  raiseHandRequestMessage?: I18nBaseType;
  raiseHandRequestReceivedMessage?: I18nConditionalType;
  raiseHandRequestAcceptedMessage?: I18nBaseType;
  raiseHandRequestRejectedMessage?: I18nBaseType;
  raiseHandRequestRecallMessage?: I18nConditionalType;
  raiseHandRequestRecallLocalMessage?: I18nBaseType;
  raiseHandApprovedRequestRecallMessage?: I18nBaseType;
}

export const VideoCallScreenLabels: I18nVideoCallScreenLabelsInterface = {
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
