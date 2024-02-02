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

export enum I18nMuteType {
  audio = 'audio',
  video = 'video',
}

export interface I18nRequestConfirmation {
  name: string;
  type: I18nMuteType;
}
export interface I18nMuteConfirmation {
  name: string;
  type: I18nMuteType;
}

export enum I18nDeviceStatus {
  PERMISSION_DENIED = -1,
  OFF = 0,
  ON = 1,
}

export const toolbarItemPeopleText = 'toolbarItemPeopleText';
export const toolbarItemChatText = 'toolbarItemChatText';
export const toolbarItemSettingText = 'toolbarItemSettingText';

export const toolbarItemLayoutText = 'toolbarItemLayoutText';
export const toolbarItemInviteText = 'toolbarItemInviteText';

export const toolbarItemMicrophoneText = 'toolbarItemMicrophoneText';
export const toolbarItemMicrophoneTooltipText =
  'toolbarItemMicrophoneTooltipText';
export const toolbarItemCameraText = 'toolbarItemCameraText';
export const toolbarItemCameraTooltipText = 'toolbarItemCameraTooltipText';
export const toolbarItemSwitchCameraText = 'toolbarItemSwitchCameraText';
export const toolbarItemShareText = 'toolbarItemShareText';
export const toolbarItemRecordingText = 'toolbarItemRecordingText';
export const toolbarItemLeaveText = 'toolbarItemLeaveText';

export const toolbarItemMoreText = 'toolbarItemMoreText';
export const toolbarItemNoiseCancellationText =
  'toolbarItemNoiseCancellationText';
export const toolbarItemWhiteboardText = 'toolbarItemWhiteboardText';
export const toolbarItemCaptionText = 'toolbarItemCaptionText';
export const toolbarItemTranscriptText = 'toolbarItemTranscriptText';
export const toolbarItemVitrualBackgroundText =
  'toolbarItemVitrualBackgroundText';

export const toolbarItemRaiseHandText = 'toolbarItemRaiseHandText';

export interface I18nVideoCallScreenLabelsInterface {
  [toolbarItemPeopleText]?: I18nBaseType;
  [toolbarItemChatText]?: I18nBaseType;
  [toolbarItemSettingText]?: I18nBaseType;

  [toolbarItemLayoutText]?: I18nBaseType;
  [toolbarItemInviteText]?: I18nBaseType;

  [toolbarItemMicrophoneText]?: I18nBaseType<I18nDeviceStatus>;
  [toolbarItemMicrophoneTooltipText]?: I18nBaseType<I18nDeviceStatus>;
  [toolbarItemCameraText]?: I18nBaseType<I18nDeviceStatus>;
  [toolbarItemCameraTooltipText]?: I18nBaseType<I18nDeviceStatus>;
  [toolbarItemSwitchCameraText]?: I18nBaseType;

  [toolbarItemShareText]?: I18nConditionalType;
  [toolbarItemRecordingText]?: I18nConditionalType;
  [toolbarItemLeaveText]?: I18nBaseType;

  [toolbarItemMoreText]?: I18nBaseType;

  [toolbarItemNoiseCancellationText]?: I18nBaseType;
  [toolbarItemWhiteboardText]?: I18nConditionalType;
  [toolbarItemCaptionText]?: I18nConditionalType;
  [toolbarItemTranscriptText]?: I18nConditionalType;
  [toolbarItemVitrualBackgroundText]?: I18nBaseType;

  [toolbarItemRaiseHandText]?: I18nConditionalType;

  // people?: I18nBaseType;
  // chat?: I18nBaseType;
  // layout?: I18nBaseType;
  // invite?: I18nBaseType;
  // videoButton?: I18nBaseType<I18nDeviceStatus>;
  // micButton?: I18nBaseType<I18nDeviceStatus>;
  // videoButtonTooltip?: I18nBaseType<I18nDeviceStatus>;
  // micButtonTooltip?: I18nBaseType<I18nDeviceStatus>;
  // moreButton?: I18nBaseType;
  // noiseCancellation?: I18nBaseType;
  // startWhiteboard?: I18nBaseType;
  // hideWhiteboard?: I18nBaseType;
  // showWhiteboard?: I18nBaseType;
  // hideCaption?: I18nBaseType;
  // showCaption?: I18nBaseType;
  // hideTranscript?: I18nBaseType;
  // showTranscript?: I18nBaseType;
  // screenShareButton?: I18nConditionalType; //
  // raiseHandButton?: I18nConditionalType; //
  // recordingButton?: I18nConditionalType;
  // leaveButton?: I18nBaseType; //
  // switchCameraButton?: I18nBaseType;
  nameCantbeChangedInfo?: I18nBaseType;
  noOneElseJoinedYet?: I18nBaseType;
  noOneElseJoinedYetInviteOthers?: I18nBaseType;
  inviteOthersButton?: I18nBaseType;
  copyInvitationButton?: I18nBaseType;
  welcome?: I18nBaseType;
  invitePopupHeading?: I18nBaseType;
  pstnUserLabel?: I18nBaseType; //
  networkQualityLabel?: I18nBaseType<NetworkQualities>; //
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

  turnoffAllCameras?: I18nBaseType;
  muteAllMicrophone?: I18nBaseType;

  host?: I18nBaseType;
  audience?: I18nBaseType;
  inThisMeeting?: I18nBaseType;
  noHostJoinedYet?: I18nBaseType;
  noAudienceJoinedYet?: I18nBaseType;
  noUsersJoinedYet?: I18nBaseType;

  languageSelectionPopupHeading?: I18nConditionalType;
  languageSelectionPopupSubHeading?: I18nBaseType;
  languageSelectionPopupActionButton?: I18nBaseType;
  languageSelectionPopupDropdownError?: I18nBaseType;
  languageSelectionPopupDropdownInfo?: I18nBaseType;

  meetingTranscript?: I18nBaseType;
  download?: I18nBaseType;
  downloadTranscript?: I18nBaseType;
  settingSpokenLanguage?: I18nBaseType;
  languageChangeInProgress?: I18nBaseType;
  language?: I18nBaseType;

  whiteboardInitializing?: I18nBaseType;
  viewWhiteboard?: I18nBaseType;
  removeFromLarge?: I18nBaseType;
  viewInLarge?: I18nBaseType;
  pinToTop?: I18nBaseType;
  removeFromTop?: I18nBaseType;
  messagePrivately?: I18nBaseType;
  muteAudio?: I18nBaseType;
  requestAudio?: I18nBaseType;
  muteVideo?: I18nBaseType;
  requestVideo?: I18nBaseType;
  addAsPresenter?: I18nBaseType;
  removeAsPresenter?: I18nBaseType;
  removeFromRoom?: I18nBaseType;
  changeName?: I18nBaseType;
  stopScreenShare?: I18nBaseType;
  removeScreenShare?: I18nBaseType;

  removeFromMeetingPopupHeading?: I18nBaseType;
  removeFromMeetingPopupSubHeading?: I18nBaseType;
  removeFromMeetingPopupActionButton?: I18nBaseType;

  removeScreenshareFromMeetingPopupHeading?: I18nBaseType;
  removeScreenshareFromMeetingPopupSubHeading?: I18nBaseType;
  removeScreenshareFromMeetingPopupActionButton?: I18nBaseType;

  muteAllConfirmation?: I18nBaseType<I18nMuteType>;
  requestConfirmation?: I18nBaseType<I18nRequestConfirmation>;
  muteConfirmation?: I18nBaseType<I18nMuteConfirmation>;
  muteButton?: I18nBaseType;
  requestButton?: I18nBaseType;

  wantToJoin?: I18nBaseType;
  waiting?: I18nBaseType;

  publicChatToastHeading?: I18nBaseType;
  multiplePublicChatToastHeading?: I18nBaseType;
  multiplePublicChatToastSubHeading?: I18nBaseType<{
    count: number;
    from: string;
  }>;

  privateChatToastHeading?: I18nBaseType;
  multiplePrivateChatToastHeading?: I18nBaseType<{count: number}>;

  multiplePublicAndPrivateChatToastHeading?: I18nBaseType;
  multiplePublicAndPrivateChatToastSubHeading?: I18nBaseType<{
    publicChatCount: number;
    privateChatCount: number;
    from: string;
  }>;

  raiseYourHand?: I18nBaseType;
  raiseYourHandInfo?: I18nBaseType;
  chatWithOthers?: I18nBaseType;
  chatWithOthersInfo?: I18nBaseType;
  presentYourScreen?: I18nBaseType;
  presentYourScreenInfo?: I18nBaseType;
  joinWithActivites?: I18nBaseType;
  joinWithActivitesInfo?: I18nBaseType;

  inviteOtherAttendee?: I18nBaseType;
  waitingForHostToJoin?: I18nBaseType;
  whatYouCanDoHere?: I18nBaseType;

  allowToBePresenter?: I18nBaseType;
  deny?: I18nBaseType;

  raiseHandRequestToastHeading?: I18nBaseType;
  raiseHandRequestToastSubHeading?: I18nBaseType;

  raiseHandRequestReceivedToastHeading?: I18nBaseType;
  raiseHandRequestReceivedToastSubHeading?: I18nBaseType;

  raiseHandRequestAcceptedToastHeading?: I18nBaseType;
  raiseHandRequestAcceptedToastSubHeading?: I18nBaseType;

  raiseHandRequestRejectedToastHeading?: I18nBaseType;

  raiseHandRequestRecallToastHeading?: I18nBaseType;

  raiseHandRequestRecallLocalToastHeading?: I18nBaseType;

  raiseHandApprovedRequestRecallToastHeading?: I18nBaseType;

  promoteAsCoHostToastHeading?: I18nBaseType;

  requestAlreadyProcessed?: I18nBaseType;
}

export const VideoCallScreenLabels: I18nVideoCallScreenLabelsInterface = {
  [toolbarItemPeopleText]: 'People',
  [toolbarItemChatText]: 'Chat',
  [toolbarItemSettingText]: 'Settings',
  [toolbarItemLayoutText]: 'Layout',
  [toolbarItemInviteText]: 'Invite',

  [toolbarItemMicrophoneText]: deviceStatus => {
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
  [toolbarItemMicrophoneTooltipText]: deviceStatus => {
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
  [toolbarItemCameraText]: deviceStatus => {
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
  [toolbarItemCameraTooltipText]: deviceStatus => {
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
  [toolbarItemShareText]: active => (active ? 'Stop Share' : 'Share'),
  [toolbarItemRecordingText]: active => (active ? 'Stop Rec' : 'Record'),
  [toolbarItemLeaveText]: 'Leave',
  [toolbarItemMoreText]: 'More',

  [toolbarItemNoiseCancellationText]: 'Noise Cancellation',
  [toolbarItemVitrualBackgroundText]: 'Virtual Background',
  [toolbarItemWhiteboardText]: active =>
    active ? 'Hide Whiteboard' : 'Show Whiteboard',
  [toolbarItemCaptionText]: active =>
    active ? 'Hide Caption' : 'Show Caption',
  [toolbarItemTranscriptText]: active =>
    active ? 'Hide Transcript' : 'Show Transcript',

  [toolbarItemRaiseHandText]: active => (active ? 'Lower Hand' : 'Raise Hand'),

  nameCantbeChangedInfo: `Name can't be changed while whiteboard is active`,
  noOneElseJoinedYet: 'No one else has joined yet.',
  noOneElseJoinedYetInviteOthers: 'No one else has joined yet, invite others?',

  inviteOthersButton: 'INVITE OTHERS',
  copyInvitationButton: 'COPY INVITATION',
  welcome: 'Welcome',
  invitePopupHeading: 'Invite others to join this room',
  pstnUserLabel: 'PSTN User',
  networkQualityLabel: (quality: NetworkQualities) => {
    switch (quality) {
      case 'unknown':
        return 'Network Unsupported';
      case 'excellent':
        return 'Excellent Network';
      case 'good':
        return 'Good Network';
      case 'bad':
        return 'Bad Network';
      case 'veryBad':
        return 'Very Bad Network';
      case 'unpublished':
        return 'Network Unpublished';
      case 'loading':
        return 'Network Loading';
      default:
        return 'Loading';
    }
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

  turnoffAllCameras: 'Turn off all cameras',
  muteAllMicrophone: 'Mute All',

  host: 'HOST',
  audience: 'AUDIENCE',
  inThisMeeting: 'IN THIS MEETING',
  noHostJoinedYet: 'No Host has joined yet.',
  noAudienceJoinedYet: 'No Audience has joined yet.',
  noUsersJoinedYet: 'No Users has joined yet',

  languageSelectionPopupHeading: isFirstTimeOpened =>
    isFirstTimeOpened ? 'Set Spoken Language' : 'Change Spoken Language',
  languageSelectionPopupSubHeading:
    'What language(s) are being spoken by everyone in this meeting?',
  languageSelectionPopupActionButton: 'CONFIRM',
  languageSelectionPopupDropdownError:
    'Choose at least one language to proceed',
  languageSelectionPopupDropdownInfo:
    'You can choose a maximum of two languages',

  meetingTranscript: 'Meeting Transcript',
  download: 'Download',
  downloadTranscript: 'Download Transcript',
  settingSpokenLanguage: 'Setting Spoken Language',
  languageChangeInProgress: 'Language Change is in progress...',
  language: 'Language',

  whiteboardInitializing: 'Whiteboard is initializing',
  viewWhiteboard: 'View Whiteboard',
  removeFromLarge: 'Remove from large',
  viewInLarge: 'View in large',
  pinToTop: 'Pin to top',
  removeFromTop: 'Remove from top',
  messagePrivately: 'Message Privately',
  muteAudio: 'Mute Audio',
  requestAudio: 'Request Audio',
  muteVideo: 'Mute Video',
  requestVideo: 'Request Video',
  addAsPresenter: 'Add as Presenter',
  removeAsPresenter: 'Remove as Presenter',
  removeFromRoom: 'Remove from Room',
  changeName: 'Change Name',
  stopScreenShare: 'Stop Screenshare',
  removeScreenShare: 'Remove Screenshare',

  removeFromMeetingPopupHeading: name => `Remove ${name}?`,
  removeFromMeetingPopupSubHeading: name =>
    `Once removed, ${name} will still be able to rejoin the room later.`,
  removeFromMeetingPopupActionButton: 'REMOVE',

  removeScreenshareFromMeetingPopupHeading: 'Remove Screenshare?',
  removeScreenshareFromMeetingPopupSubHeading: name =>
    `Once removed, ${name} will still be able to screen share later.`,
  removeScreenshareFromMeetingPopupActionButton: 'REMOVE',

  muteAllConfirmation: (type: I18nMuteType) =>
    `Mute everyone's ${type} on the call?`,
  requestConfirmation: ({name, type}: I18nRequestConfirmation) =>
    `Request ${name} to turn on their ${
      type === I18nMuteType.audio ? 'microphone' : 'camera'
    }?`,
  muteConfirmation: ({name, type}: I18nMuteConfirmation) =>
    `Mute ${name}'s ${type} for everyone on the call? Only ${name} can unmute themselves.`,

  muteButton: 'Mute',
  requestButton: 'Request',
  wantToJoin: 'WANT TO JOIN',
  waiting: 'WAITING',

  publicChatToastHeading: (name: string) =>
    `${name} commented in the public chat`,

  multiplePublicChatToastHeading: 'New comments in Public Chat',
  multiplePublicChatToastSubHeading: ({count, from}) =>
    `You have ${count} new messages from ${from}`,

  privateChatToastHeading: 'You’ve received a private message',

  multiplePrivateChatToastHeading: ({count}) =>
    `You’ve received ${count} private messages`,

  multiplePublicAndPrivateChatToastHeading:
    'New comments in Public & Private Chat',
  multiplePublicAndPrivateChatToastSubHeading: ({
    publicChatCount,
    privateChatCount,
    from,
  }) =>
    `You have ${publicChatCount} new messages from ${from} and ${privateChatCount} Private chat`,

  raiseYourHand: 'Raise Your hand',
  raiseYourHandInfo: "Let everyone know that you've something to say",
  chatWithOthers: 'Chat with others',
  chatWithOthersInfo: 'Message fellow attendees or the hosts',
  presentYourScreen: 'Present Your screen',
  presentYourScreenInfo: 'Be a presenter post the host’s approval',
  joinWithActivites: 'Join in activities',
  joinWithActivitesInfo: 'Jam with everyone on a whiteboard',

  inviteOtherAttendee: 'INVITE OTHER ATTENDEES',
  waitingForHostToJoin: 'Waiting for the host to join',
  whatYouCanDoHere: "Here's what you can do here :",

  allowToBePresenter: 'ALLOW TO BE A PRESENTER',
  deny: 'DENY',

  raiseHandRequestToastHeading: 'You’ve raised your hand.',
  raiseHandRequestToastSubHeading: 'Waiting for host to approve the request',

  raiseHandRequestReceivedToastHeading: name =>
    `${name} has raised their hand to be a Presenter`,
  raiseHandRequestReceivedToastSubHeading:
    'Once approved they will be able to speak, share their video and present during this call.',

  raiseHandRequestAcceptedToastHeading: 'Host has approved your request.',
  raiseHandRequestAcceptedToastSubHeading: 'You are now a Presenter',

  raiseHandRequestRejectedToastHeading: 'Your request was rejected by the host',

  raiseHandRequestRecallToastHeading: name => `${name} has lowered their hand`,

  raiseHandRequestRecallLocalToastHeading: 'You’ve lowered your hand.',

  raiseHandApprovedRequestRecallToastHeading:
    'Host has revoked streaming permissions.',

  promoteAsCoHostToastHeading: 'Host promoted you as a Presenter',
  requestAlreadyProcessed: 'Request already processed.',
};
