/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import { i18nInterface } from "fpe-api";

export interface NetworkTextInterface{
  unknown?: 'Unknown',
  excellent?: 'Excellent',
  good?: 'Good',
  bad?: 'Bad',
  veryBad?: 'Very Bad',
  unpublished?: 'Unpublished',
  loading?: 'Loading',
}
export interface TextWithFunctionInterface {
  screenShareName?: (name: string) => string;
  screenName?: (name: string) => string;
  screenShareActive?: (name: string) => string;
}
export interface TextInterface extends TextWithFunctionInterface, NetworkTextInterface{
  meetingNameInputPlaceholder?: string;
  restrictHostControls?: string;
  everyOneIsAHost?: string;
  seperateHostLink?: string;
  usePSTN?: string;
  loadingWithDots?: string;
  createMeetingButton?: string;
  haveMeetingID?: string;
  meetingIdInputPlaceholder?: string;
  enterMeetingButton?: string;
  attendeeUrlLabel?: string;
  hostUrlLabel?: string;
  enterMeetingAfterCreateButton?: string;
  copyInvite?: string;
  pstnLabel?: string;
  pstnNumberLabel?: string;
  meetingUrlLabel?: string;
  hostIdLabel?: string;
  meetingIdLabel?: string;
  attendeeIdLabel?: string;
  copiedToClipboardNotificationLabel?: string;
  PSTNNumber?: string;
  PSTNPin?: string;
  meeting?: string;
  URLForAttendee?: string;
  URLForHost?: string;
  attendeeMeetingID?: string;
  hostMeetingID?: string;
  joinRoom?: string;
  precallLabel?: string;
  selectInputDeviceLabel?: string;
  userNamePlaceholder?: string;
  fetchingNamePlaceholder?: string;
  video?: string;
  audio?: string;
  screenShareButton?: string;
  record?: string;
  recording?: string;
  recordingNotificationLabel?: string;
  endCallButton?: string;
  participantsLabel?: string;
  groupChatLabel?: string;
  privateChatLabel?: string;
  chatMessageInputPlaceholder?: string;
  hostControlsLabel?: string;
  muteAllVideoButton?: string;
  muteAllAudioButton?: string;
  switchCameraButton?: string;
  localScreenshareDefaultLabel?: string;
  localUserDefaultLabel?: string;
  remoteUserDefaultLabel?: string;
  pstnUserLabel?: string;
  authenticationSuccessLabel?: string;
  meetingCreatedNotificationLabel?: string;
  from?: string;
  joiningLoaderLabel?: string;
  oauthLoginLabel?: string;
  oauthProviderLabel?: string;
  copyMeetingInviteButton?: string;
  goBackButton?: string;
  logoutButton?: string;
  openInDesktop?: string;
  googleAuthButton?: string;
  microsoftAuthButton?: string;
  slackAuthButton?: string;
  appleAuthButton?: string;
  pin?: string;
  language?: string;
}

export const TEXTS: TextInterface = {
  meetingNameInputPlaceholder: 'Name your Meeting',
  restrictHostControls: 'Restrict Host Controls',
  everyOneIsAHost: 'Everyone is a Host',
  seperateHostLink: 'Separate host link',
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
  joinRoom: 'Join Room',
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
  from: 'From',
  joiningLoaderLabel: 'Starting Call. Just a second.',
  oauthLoginLabel: 'Login using OAuth',
  oauthProviderLabel: 'Please select an OAuth provider to login.',
  copyMeetingInviteButton: 'Copy Meeting Invite',
  goBackButton: 'Go back',
  logoutButton: 'Logout',
  openInDesktop: 'Open in Desktop',
  googleAuthButton: 'Google',
  microsoftAuthButton: 'Microsoft',
  slackAuthButton: 'Slack',
  appleAuthButton: 'Apple',
  pin: 'Pin',
  language: 'Language',
  screenShareName: (name) => `${name}'s screenshare`,
  screenName: (name) => `${name}'s screen`,
  screenShareActive: (name) => `${name}s screen share is active.`,
}

export const DEFAULT_I18_DATA: i18nInterface = {
  label: 'English US',
  locale: 'en-us',
  data: TEXTS
}