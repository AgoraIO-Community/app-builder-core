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
  isHost: boolean;
  isSeparateHostLink: boolean;
  meetingName?: string;
  pstn?: {
    number: string;
    pin: string;
  };
  url?: {
    host?: string;
    attendee?: string;
  };
  id?: {
    host?: string;
    attendee?: string;
  };
}
export interface I18nVideoCallScreenLabelsInterface {
  //commented for v1 release
  // toggleVideoButton?: I18nBaseType; //
  // toggleAudioButton?: I18nBaseType; //
  // screenShareButton?: I18nBaseType; //
  // recordingNotificationLabel?: I18nConditionalType;
  // endCallButton?: I18nBaseType; //
  // participantsLabel?: I18nBaseType; //
  // groupChatLabel?: I18nBaseType; //
  // privateChatLabel?: I18nBaseType; //
  // chatMessageInputPlaceholder?: I18nBaseType; //
  // hostControlsLabel?: I18nBaseType; //
  // muteAllVideoButton?: I18nBaseType; //
  // muteAllAudioButton?: I18nBaseType; //
  // switchCameraButton?: I18nBaseType; //
  // localScreenshareDefaultLabel?: I18nBaseType; //
  // localUserDefaultLabel?: I18nBaseType; //
  // remoteUserDefaultLabel?: I18nBaseType; //
  pstnUserLabel?: I18nBaseType; //
  // commented for v1 release
  // authenticationSuccessLabel?: I18nBaseType; //
  // meetingCreatedNotificationLabel?: I18nBaseType; //
  // joiningLoaderLabel?: I18nBaseType; //
  // oauthLoginLabel?: I18nBaseType; //
  // oauthProviderLabel?: I18nBaseType; //
  // copyMeetingInviteButton?: I18nBaseType; //
  // pin?: I18nBaseType;
  // language?: I18nBaseType;
  // screensharingActiveOverlayLabel?: I18nBaseType; //
  // recordingButton?: I18nConditionalType; //
  // screenshareUserName?: I18nDynamicType; //
  // messageSenderNotificationLabel?: I18nDynamicType; //
  // networkQualityLabel?: I18nBaseType<NetworkQualities>; //
  // meetingInviteText?: I18nBaseType<MeetingInviteInterface>; //
  // participantListPlaceholder?: I18nBaseType; //
  // raisedHandsListPlaceholder?: I18nBaseType; //
  // raisedHandsListTitleLabel?: I18nBaseType; //
  // hostLabel?: I18nBaseType; //
  // audienceLabel?: I18nBaseType; //
  // raiseHandButton?: I18nConditionalType; //
  // noUserFoundLabel?: I18nBaseType;
  // userOfflineLabel?: I18nBaseType;
  // raiseHandLocalNotification?: I18nBaseType; //
  // raiseHandRemoteHostNotification?: I18nConditionalType; //
  // raiseHandApprovedLocalNotification?: I18nBaseType; //
  // raiseHandRejectedLocalNotification?: I18nBaseType; //
  // lowerHandRemoteHostNotification?: I18nConditionalType; //
  // lowerHandsLocalNotification?: I18nBaseType; //
  // raiseHandRevokedLocalNotification?: I18nBaseType; //
  // recordingLabel?: I18nBaseType;
  // settingScreenInfoMessage?: I18nBaseType;
  // chatLabel?: I18nBaseType;
  // settingsLabel?: I18nBaseType;
  // layoutLabel?: I18nBaseType;
}

export const VideoCallScreenLabels: I18nVideoCallScreenLabelsInterface = {
  //need to check
  //remoteScreenshareDefaultLabel - User's screenshare
  //commented for v1 release
  // toggleVideoButton: 'Video',
  // toggleAudioButton: 'Audio',
  // screenShareButton: 'Share',
  // switchCameraButton: 'Switch',
  // recordingLabel: 'Recording',
  // recordingNotificationLabel: (active) =>
  //   active ? 'Recording Started' : 'Recording Stopped',
  // endCallButton: 'Hang Up',
  // participantsLabel: 'Participants',
  // groupChatLabel: 'Group',
  // privateChatLabel: 'Private',
  // chatMessageInputPlaceholder: 'Type your message..',
  // localScreenshareDefaultLabel: 'Your screenshare',
  // localUserDefaultLabel: 'You',
  // remoteUserDefaultLabel: 'User',
  pstnUserLabel: 'PSTN User',
  //commented for v1 release
  // authenticationSuccessLabel: 'Authenticated Successfully!',
  // meetingCreatedNotificationLabel: 'Created',
  // joiningLoaderLabel: 'Starting Call. Just a second.',
  // oauthLoginLabel: 'Login using OAuth',
  // oauthProviderLabel: 'Please select an OAuth provider to login.',
  // copyMeetingInviteButton: 'Copy Meeting Invite',
  // pin: 'Pin',
  // language: 'Language',
  // hostControlsLabel: 'Host Controls',
  // muteAllAudioButton: 'Mute all audios',
  // muteAllVideoButton: 'Mute all videos',
  // screensharingActiveOverlayLabel: 'Your screen share is active.',
  // participantListPlaceholder: 'No one has joined yet',
  // raisedHandsListPlaceholder: 'No streaming request(s)',
  // raisedHandsListTitleLabel: 'Streaming Request',
  // hostLabel: 'Host',
  // audienceLabel: 'Audience',
  // noUserFoundLabel: 'User not found',
  // userOfflineLabel: 'User is offline',
  // chatLabel: 'Chat',
  // settingsLabel: 'Settings',
  // layoutLabel: 'Layouts',
  // raiseHandLocalNotification:
  //   'You have raised your hand. Request sent to host for approval',
  // raiseHandRemoteHostNotification: (name) => `${name} has raised their hand`,
  // raiseHandApprovedLocalNotification:
  //   'Your request was approved, unmute to start talking',
  // raiseHandRejectedLocalNotification: 'Your request was rejected by the host',
  // lowerHandRemoteHostNotification: (name) => `${name} has lowered their hand`,
  // lowerHandsLocalNotification: 'You have lowered your hand',
  // raiseHandRevokedLocalNotification:
  //   'The host has revoked streaming permissions',
  // settingScreenInfoMessage:
  //   'Video and Audio sharing is disabled for attendees. Raise hand to request permission to share.',
  // screenshareUserName: (name) => `${name}'s screenshare`, //
  // recordingButton: (recording) => (recording ? 'Recording' : 'Record'),
  // raiseHandButton: (toggle) => (toggle ? 'Lower hand' : 'Raise Hand'),
  // messageSenderNotificationLabel: (name) => `From : ${name}`,
  // networkQualityLabel: (quality) => {
  //   switch (quality) {
  //     case 'unknown':
  //       return 'Unknown';
  //     case 'excellent':
  //       return 'Excellent';
  //     case 'good':
  //       return 'Good';
  //     case 'bad':
  //       return 'Bad';
  //     case 'veryBad':
  //       return 'Very Bad';
  //     case 'unpublished':
  //       return 'Unpublished';
  //     case 'loading':
  //       return 'Loading';
  //     default:
  //       return 'Loading';
  //   }
  // },
  // meetingInviteText: ({meetingName, id, url, pstn}) => {
  //   let inviteContent = '';
  //   if (url) {
  //     // if host data is present generate links for both host and attendee
  //     if (url?.host) {
  //       inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${url?.attendee}\nURL for Host: ${url?.host}`;
  //     }
  //     // if host data is not present then generate link for attendee alone
  //     else {
  //       inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${url?.attendee}`;
  //     }
  //   } else {
  //     // if host data is present generate meeting ID for both host and attendee
  //     if (id?.host) {
  //       inviteContent += `Meeting - ${meetingName}\nAttendee Meeting ID: ${id?.attendee}\nHost Meeting ID: ${id?.host}`;
  //     }
  //     // if host data is not present then generate meeting ID for attendee alone
  //     else {
  //       inviteContent += `Meeting - ${meetingName}\nMeeting ID: ${id?.attendee}`;
  //     }
  //   }
  //   // Adding pstn data into meeting data if present
  //   if (pstn?.number && pstn?.pin) {
  //     inviteContent += `\nPSTN Number: ${pstn.number}\nPSTN Pin: ${pstn.pin}`;
  //   }
  //   return inviteContent;
  // },
};
