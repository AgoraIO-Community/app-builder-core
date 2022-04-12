import {ChannelProfile, ClientRole} from '../../agora-rn-uikit';

export type BaseI18nType<T = {}> = string | ((template: T) => string);
export type DynamicStringI18nType = BaseI18nType<string>;
export type ConditionalStringI18nType = BaseI18nType<boolean>;
export interface i18nInterface {
  locale: string;
  label?: string;
  data: TextDataType;
}
export type TextDataType = {
  meetingNameInputPlaceholder?: BaseI18nType;
  usePSTN?: BaseI18nType;
  loadingWithDots?: BaseI18nType;
  createMeetingButton?: BaseI18nType;
  haveMeetingID?: BaseI18nType;
  meetingIdInputPlaceholder?: BaseI18nType;
  enterMeetingButton?: BaseI18nType;
  attendeeUrlLabel?: BaseI18nType;
  hostUrlLabel?: BaseI18nType;
  enterMeetingAfterCreateButton?: BaseI18nType;
  copyInvite?: BaseI18nType;
  pstnLabel?: BaseI18nType;
  pstnNumberLabel?: BaseI18nType;
  meetingUrlLabel?: BaseI18nType;
  hostIdLabel?: BaseI18nType;
  meetingIdLabel?: BaseI18nType;
  attendeeIdLabel?: BaseI18nType;
  copiedToClipboardNotificationLabel?: BaseI18nType;
  PSTNNumber?: BaseI18nType;
  PSTNPin?: BaseI18nType;
  meeting?: BaseI18nType;
  URLForAttendee?: BaseI18nType;
  URLForHost?: BaseI18nType;
  attendeeMeetingID?: BaseI18nType;
  hostMeetingID?: BaseI18nType;
  precallLabel?: BaseI18nType;
  selectInputDeviceLabel?: BaseI18nType;
  userNamePlaceholder?: BaseI18nType;
  fetchingNamePlaceholder?: BaseI18nType;
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
  goBackButton?: BaseI18nType;
  logoutButton?: BaseI18nType;
  googleAuthButton?: BaseI18nType;
  microsoftAuthButton?: BaseI18nType;
  slackAuthButton?: BaseI18nType;
  appleAuthButton?: BaseI18nType;
  pin?: BaseI18nType;
  language?: BaseI18nType;
  screensharingActiveOverlayLabel?: BaseI18nType;
  hostControlsToggle?: ConditionalStringI18nType;
  joinRoomButton?: BaseI18nType<joinRoomButtonTextInterface>;
  recordingButton?: ConditionalStringI18nType;
  screenshareUserName?: DynamicStringI18nType;
  messageSenderNotificationLabel?: DynamicStringI18nType;
  networkQualityLabel?: BaseI18nType<keyof NetworkQualityStatusInterface>;
  meetingInviteText?: BaseI18nType<MeetingInviteParam>;
  noOneJoinedLabel?: BaseI18nType;
  noLiveStreamingRequests?: BaseI18nType;
  liveStreamingRequest?: BaseI18nType;
  hostLabel?: BaseI18nType;
  audienceLabel?: BaseI18nType;
  raiseHandStatusText?: ConditionalStringI18nType;
  noUserFoundLabel?: BaseI18nType;
  raiseHandRequestMessage?: BaseI18nType;
  raiseHandRequestReceivedMessage?: ConditionalStringI18nType;
  raiseHandRequestAcceptedMessage?: BaseI18nType;
  raiseHandRequestRejectedMessage?: BaseI18nType;
  raiseHandRequestRecallMessage?: ConditionalStringI18nType;
  raiseHandRequestRecallLocalMessage?: BaseI18nType;
  raiseHandApprovedRequestRecallMessage?: BaseI18nType;
};
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
export interface joinRoomButtonTextInterface {
  ready: boolean;
  mode: ChannelProfile;
  role?: ClientRole;
}
