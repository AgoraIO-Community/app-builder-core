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
  nameYourMeeting?: string;
  restrictHostControls?: string;
  everyOneIsAHost?: string;
  seperateHostLink?: string;
  usePSTN?: string;
  loadingWithDots?: string;
  createMeeting?: string;
  haveMeetingID?: string;
  enterMeetingID?: string;
  enterMeeting?: string;
  createAMeeting?: string;
  attendeeURL?: string;
  hostURL?: string;
  startMeeting?: string;
  copyInviteToClipboard?: string;
  PSTN?: string;
  number?: string;
  meetingURL?: string;
  hostID?: string;
  meetingID?: string;
  attendeeID?: string;
  copiedToClipboard?: string;
  PSTNNumber?: string;
  PSTNPin?: string;
  meeting?: string;
  URLForAttendee?: string;
  URLForHost?: string;
  attendeeMeetingID?: string;
  hostMeetingID?: string;
  joinRoom?: string;
  precall?: string;
  selectInputDevice?: string;
  displayName?: string;
  gettingName?: string;
  video?: string;
  audio?: string;
  share?: string;
  record?: string;
  recording?: string;
  recordingStarted?: string;
  hangUp?: string;
  participants?: string;
  group?: string;
  private?: string;
  typeYourMessage?: string;
  hostControls?: string;
  muteAllVideos?: string;
  muteAllAudios?: string;
  switch?: string;
  yourScreenshare?: string;
  you?: string;
  user?: string;
  PSTNUser?: string;
  authenticated?: string;
  created?: string;
  from?: string;
  startingCall?: string;
  loginOAuth?: string;
  loginOAuthMessage?: string;
  copyMeetingInvite?: string;
  goBack?: string;
  logout?: string;
  openInDesktop?: string;
  google?: string;
  microsoft?: string;
  slack?: string;
  apple?: string;
  pin?: string;
  language?: string;
}

export const TEXTS: TextInterface = {
  nameYourMeeting: 'Name your Meeting',
  restrictHostControls: 'Restrict Host Controls',
  everyOneIsAHost: 'Everyone is a Host',
  seperateHostLink: 'Separate host link',
  usePSTN: 'Use PSTN (Join by dialing a number)',
  loadingWithDots: 'Loading...',
  createMeeting: 'Create a Meeting',
  haveMeetingID: 'Have a Meeting ID?',
  enterMeetingID: 'Enter Meeting ID',
  enterMeeting: 'Enter Meeting',
  createAMeeting: 'Create a meeting',
  attendeeURL: 'Attendee URL',
  hostURL: 'Host URL',
  startMeeting: 'Start Meeting (as host)',
  copyInviteToClipboard: 'Copy invite to clipboard',
  PSTN: 'PSTN',
  number: 'Number',
  meetingURL: 'Meeting URL',
  hostID: 'Host ID',
  meetingID: 'Meeting ID',
  attendeeID: 'Attendee ID',
  copiedToClipboard: 'Copied to Clipboard',
  PSTNNumber: 'PSTN Number',
  PSTNPin: 'PSTN Pin',
  meeting: 'Meeting',
  URLForAttendee: 'URL for Attendee',
  URLForHost: 'URL for Host',
  attendeeMeetingID: 'Attendee Meeting ID',
  hostMeetingID: 'Host Meeting ID',
  joinRoom: 'Join Room',
  precall: 'Precall',
  selectInputDevice: 'Select Input Device',
  displayName: 'Display name*',
  gettingName: 'Getting name...',
  video: 'Video',
  audio: 'Audio',
  share: 'Share',
  record: 'Record',
  recording: 'Recording',
  recordingStarted: 'Recording Started',
  hangUp: 'Hang Up',
  participants: 'Participants',
  group: 'Group',
  private: 'Private',
  typeYourMessage: 'Type your message..',
  hostControls: 'Host Controls',
  muteAllAudios: 'Mute all audios',
  muteAllVideos: 'Mute all videos',
  switch: 'Switch',
  yourScreenshare: 'Your screenshare',
  you: 'You',
  user: 'User',
  PSTNUser: 'PSTN User',
  authenticated: 'Authenticated Successfully!',
  created: 'Created',
  from: 'From',
  startingCall: 'Starting Call. Just a second.',
  loginOAuth: 'Login using OAuth',
  loginOAuthMessage: 'Please select an OAuth provider to login.',
  copyMeetingInvite: 'Copy Meeting Invite',
  goBack: 'Go back',
  logout: 'Logout',
  openInDesktop: 'Open in Desktop',
  google: 'Google',
  microsoft: 'Microsoft',
  slack: 'Slack',
  apple: 'Apple',
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