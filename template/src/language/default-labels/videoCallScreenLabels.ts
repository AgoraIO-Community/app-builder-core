import {I18nBaseType, I18nConditionalType} from '../i18nTypes';
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

export enum I18nDeviceStatus {
  PERMISSION_DENIED = -1,
  OFF = 0,
  ON = 1,
}

export interface I18nVideoCallScreenLabelsInterface {
  people?: I18nBaseType;
  chat?: I18nBaseType;
  layout?: I18nBaseType;
  invite?: I18nBaseType;
  videoButton?: I18nBaseType<I18nDeviceStatus>;
  micButton?: I18nBaseType<I18nDeviceStatus>;
  videoButtonTooltip?: I18nBaseType<I18nDeviceStatus>;
  micButtonTooltip?: I18nBaseType<I18nDeviceStatus>;
  moreButton?: I18nBaseType;
  noiseCancellation?: I18nBaseType;
  startWhiteboard?: I18nBaseType;
  hideWhiteboard?: I18nBaseType;
  showWhiteboard?: I18nBaseType;
  hideCaption?: I18nBaseType;
  showCaption?: I18nBaseType;
  hideTranscript?: I18nBaseType;
  showTranscript?: I18nBaseType;
  screenShareButton?: I18nConditionalType; //
  raiseHandButton?: I18nConditionalType; //
  recordingButton?: I18nConditionalType;
  leaveButton?: I18nBaseType; //
  switchCameraButton?: I18nBaseType;
  nameCantbeChangedInfo?: I18nBaseType;
  noOneElseJoinedYet?: I18nBaseType;
  noOneElseJoinedYetInviteOthers?: I18nBaseType;
  inviteOthersButton?: I18nBaseType;
  copyInvitationButton?: I18nBaseType;
  welcome?: I18nBaseType;
  invitePopupHeading?: I18nBaseType;
  //recordingNotificationLabel?: I18nConditionalType;
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
  meetingInviteText?: I18nBaseType<MeetingInviteInterface>; //
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

  apply?: I18nBaseType;
  applied?: I18nBaseType;
  grid?: I18nBaseType;
  sidebar?: I18nBaseType;
  nativeScreensharePopupActionButton?: I18nBaseType;
  nativeScreensharePopupHeading?: I18nBaseType;
  nativeScreensharePopupSubHeadingLocalCamOn?: I18nBaseType;
  nativeScreensharePopupSubHeadingLocalCamOff?: I18nBaseType;
  includeDeviceAudio?: I18nBaseType;
  stopRecordingPopupHeading?: I18nBaseType;
  stopRecordingPopupSubHeading?: I18nBaseType;
  stopRecordingActionButton?: I18nBaseType;
  stopScreenSharePopupHeading?: I18nBaseType;
  stopScreenSharePopupSubHeading?: I18nBaseType;
  stopScreenSharingActionButton?: I18nBaseType;
  clearAllWhiteboardPopupHeading?: I18nBaseType;
  clearAllWhiteboardPopupSubHeading?: I18nBaseType;
  clearAllWhiteboardActionButton?: I18nBaseType;
  leaveMeetingPopupHeading?: I18nBaseType;
  leaveMeetingPopupSubHeading?: I18nBaseType;
  leaveMeetingPopupSubHeadingWithTranscript?: I18nBaseType;
  leaveMeetingPopupActionButton?: I18nBaseType;

  group?: I18nBaseType;
  private?: I18nBaseType;

  groupChatWelcomeInfo?: I18nBaseType;
  groupChatWelcomeSubInfo?: I18nBaseType;
  groupChatInputPlaceHolder?: I18nBaseType;
  privateChatInputPlaceHolder?: I18nBaseType;
}

export const VideoCallScreenLabels: I18nVideoCallScreenLabelsInterface = {
  people: 'People',
  chat: 'Chat',
  layout: 'Layout',
  invite: 'Invite',
  videoButton: deviceStatus => {
    switch (deviceStatus) {
      case I18nDeviceStatus.ON:
        return 'Video On';
      case I18nDeviceStatus.OFF:
        return 'Video Off';
      case I18nDeviceStatus.PERMISSION_DENIED:
        return 'Video';
      default:
        return 'Video';
    }
  },
  micButton: deviceStatus => {
    switch (deviceStatus) {
      case I18nDeviceStatus.ON:
        return 'Mic On';
      case I18nDeviceStatus.OFF:
        return 'Mic Off';
      case I18nDeviceStatus.PERMISSION_DENIED:
        return 'Mic';
      default:
        return 'Mic';
    }
  },
  videoButtonTooltip: deviceStatus => {
    switch (deviceStatus) {
      case I18nDeviceStatus.ON:
        return 'Disable Camera';
      case I18nDeviceStatus.OFF:
        return 'Enable Camera';
      case I18nDeviceStatus.PERMISSION_DENIED:
        return 'Give Permissions';
      default:
        return 'Video';
    }
  },
  micButtonTooltip: deviceStatus => {
    switch (deviceStatus) {
      case I18nDeviceStatus.ON:
        return 'Disable Mic';
      case I18nDeviceStatus.OFF:
        return 'Enable Mic';
      case I18nDeviceStatus.PERMISSION_DENIED:
        return 'Give Permissions';
      default:
        return 'Mic';
    }
  },
  moreButton: 'More',

  noiseCancellation: 'Noise Cancellation',
  startWhiteboard: 'Start Whiteboard',
  hideWhiteboard: 'Hide Whiteboard',
  showWhiteboard: 'Show Whiteboard',
  hideTranscript: 'Hide Transcript',
  showTranscript: 'Show Transcript',
  showCaption: 'Show Caption',
  hideCaption: 'Hide Caption',
  switchCameraButton: 'Switch Camera',
  raiseHandButton: active => (active ? 'Lower Hand' : 'Raise Hand'),

  screenShareButton: active => (active ? 'Stop Share' : 'Share'),
  recordingButton: active => (active ? 'Stop Rec' : 'Record'),

  leaveButton: 'Leave',

  nameCantbeChangedInfo: `Name can't be changed while whiteboard is active`,
  noOneElseJoinedYet: 'No one else has joined yet.',
  noOneElseJoinedYetInviteOthers: 'No one else has joined yet, invite others?',

  inviteOthersButton: 'INVITE OTHERS',
  copyInvitationButton: 'COPY INVITATION',
  welcome: 'Welcome',
  invitePopupHeading: 'Invite others to join this room',
  //need to check
  //remoteScreenshareDefaultLabel - User's screenshare
  //commented for v1 release
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
  // copyMeetingInviteButton: 'Copy Room Invite',
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
  meetingInviteText: ({
    meetingName,
    id,
    url,
    pstn,
    isHost,
    isSeparateHostLink,
  }) => {
    let inviteContent = '';
    if (url) {
      //for host
      if (isHost) {
        if (isSeparateHostLink) {
          //seperate link for host and attendee
          inviteContent += `Room: ${meetingName}\n\nAttendee Link:\n${url?.attendee}\n\nHost Link:\n${url?.host}`;
        } else {
          //single link for everyone
          inviteContent += `Room: ${meetingName}\n\nMeeting Link:\n${url?.host}`;
        }
      }
      //for attendee
      else {
        inviteContent += `Room: ${meetingName}\n\nAttendee Link:\n${url?.attendee}`;
      }
    } else {
      if (isHost) {
        if (isSeparateHostLink) {
          inviteContent += `Room: ${meetingName}\n\nAttendee Room ID:\n${id?.attendee}\n\nHost Room ID:\n${id?.host}`;
        } else {
          inviteContent += `Room: ${meetingName}\n\nRoom ID:\n${id?.host}`;
        }
      } else {
        //copy this label on videocall screen
        inviteContent += `Room: ${meetingName}\n\nAttendee Room ID:\n${id?.attendee}`;
      }
    }
    // Adding pstn data into meeting data if present
    if (pstn?.number && pstn?.pin) {
      inviteContent += `\n\nPSTN Number:\n${pstn.number}\n\nPSTN Pin:\n${pstn.pin}`;
    }
    return inviteContent;
  },
  applied: 'Applied',
  apply: 'Apply',
  grid: 'Grid',
  sidebar: 'Sidebar',
  nativeScreensharePopupActionButton: 'PROCEED',
  nativeScreensharePopupHeading: 'Screen Share',
  nativeScreensharePopupSubHeadingLocalCamOff:
    'NOTE: All incoming videos will be turned OFF for an optimised performance, do you wish to proceed?',
  nativeScreensharePopupSubHeadingLocalCamOn:
    'NOTE: Camera and all incoming videos will be turned OFF for an optimised performance, do you wish to proceed?',
  includeDeviceAudio: 'Include device audio',
  stopRecordingPopupHeading: 'Stop Recording?',
  stopRecordingPopupSubHeading:
    'Are you sure you want to stop recording? You can’t undo this action.',
  stopRecordingActionButton: 'END RECORDING',
  stopScreenSharePopupHeading: 'Stop Screen Share?',
  stopScreenSharePopupSubHeading:
    'You need to stop sharing your screen in order to turn the camera ON',
  stopScreenSharingActionButton: 'STOP SHARE & TURN CAMERA ON',
  clearAllWhiteboardPopupHeading: 'Clear Whiteborad?',
  clearAllWhiteboardPopupSubHeading:
    'Are you sure you want to clear the whiteboard?',
  clearAllWhiteboardActionButton: 'CLEAR ALL',
  leaveMeetingPopupHeading: 'Leave Room?',
  leaveMeetingPopupSubHeading: 'Are you sure you want to leave this meeting?',
  leaveMeetingPopupSubHeadingWithTranscript: `Sure you want to leave? You haven't downloaded your transcripts yet.`,
  leaveMeetingPopupActionButton: 'LEAVE',

  group: 'Group',
  private: 'Private',

  groupChatWelcomeInfo: 'Welcome to Chat!',
  groupChatWelcomeSubInfo: 'All messages are deleted when call ends.',
  groupChatInputPlaceHolder: name => `Chat publicy as ${name}...`,
  privateChatInputPlaceHolder: name => `Private Message to ${name}`,
};
