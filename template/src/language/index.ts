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

export interface NetworkQualityTextInterface {
  unknown?: 'Unknown',
  excellent?: 'Excellent',
  good?: 'Good',
  bad?: 'Bad',
  veryBad?: 'Very Bad',
  unpublished?: 'Unpublished',
  loading?: 'Loading',
}
export interface meetingInviteInterface {
  meetingName?: string,
  pstn?: {
    number: string,
    pin: string,
  },
  url?: {
    host: string,
    attendee: string,
  },
  id?: {
    host: string,
    attendee: string
  },
  hostControlCheckbox?: boolean,
  platform?: string,
  frontendEndpoint?: string
}
export interface TextWithFunctionObjectInterface{
  meetingInviteText?: (invite: meetingInviteInterface) => string
}

export interface TextWithFunctionInterface {
  screenshareUserName?: (name?: string) => string;
  hostControlsToggle?: (toggle?: boolean) => string;
  joinRoomButton?: (ready?: boolean) => string;
  recordingButton?: (recording?: boolean) => string;
  messageSenderNotificationLabel?: (name?: string) => string,
  networkQualityLabel?: (quality: keyof NetworkQualityTextInterface) => string,
}
export interface TextInterface extends TextWithFunctionInterface,TextWithFunctionObjectInterface {
  meetingNameInputPlaceholder?: string;
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
  joiningLoaderLabel?: string;
  oauthLoginLabel?: string;
  oauthProviderLabel?: string;
  copyMeetingInviteButton?: string;
  goBackButton?: string;
  logoutButton?: string;
  googleAuthButton?: string;
  microsoftAuthButton?: string;
  slackAuthButton?: string;
  appleAuthButton?: string;
  pin?: string;
  language?: string;
  screensharingActiveOverlayLabel?: string
}

export const TEXTS: TextInterface = {
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
  hostControlsToggle: (toggle) => toggle ? 'Restrict Host Controls (Separate host link)' : 'Restrict Host Controls (Everyone is a Host)',
  joinRoomButton: (ready) => ready ? 'Join Room' : 'Loading...',
  recordingButton: (recording) => recording ? 'Recording' : 'Record',
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
  meetingInviteText: ({ meetingName, id, url, pstn, hostControlCheckbox, platform }) => {
    let inviteContent = '';
    if($config.FRONTEND_ENDPOINT){
      if(hostControlCheckbox){
        inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${$config.FRONTEND_ENDPOINT}/${url?.attendee}\nURL for Host: ${$config.FRONTEND_ENDPOINT}/${url?.host}`
      }else{
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${$config.FRONTEND_ENDPOINT}/${url?.host}`
      }  
    }else if(platform === 'web'){
      if(hostControlCheckbox){
        inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${window.location.origin}/${url?.attendee}\nURL for Host: ${window.location.origin}/${url?.host}`
      }else{
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${window.location.origin}/${url?.host}`
      }
    }else{
      if(hostControlCheckbox){
        inviteContent += `Meeting - ${meetingName}\nAttendee Meeting ID: ${id?.attendee}\nHost Meeting ID: ${id?.host}`
      }else{
        inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${url?.host}`
      }
    }
    if(pstn){
      inviteContent += `\nPSTN Number: ${pstn.number}\nPSTN Pin: ${pstn.pin}`
    }
    return inviteContent;
  }
}

export const DEFAULT_I18_DATA: i18nInterface = {
  label: 'English US',
  locale: 'en-us',
  data: TEXTS
}