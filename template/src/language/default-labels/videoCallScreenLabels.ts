import {I18nBaseType, I18nConditionalType} from '../i18nTypes';
import {room} from './createScreenLabels';
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
export const toolbarItemLayoutOptionGridText =
  'toolbarItemLayoutOptionGridText';
export const toolbarItemLayoutOptionSidebarText =
  'toolbarItemLayoutOptionSidebarText';
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

export const inviteTileWelcomeText = 'inviteTileWelcomeText';
export const inviteTileNoElseJoinedYetText = 'inviteTileNoElseJoinedYetText';
export const inviteTileCopyInviteBtnText = 'inviteTileCopyInviteBtnText';

export const settingPanelNameCantbeChangedInfo =
  'settingPanelNameCantbeChangedInfo';
export const settingPanelNameInputLabel = 'settingPanelNameInputLabel';

export const invitePopupHeading = 'invitePopupHeading';
export const invitePopupPrimaryBtnText = 'invitePopupPrimaryBtnText';

export const PSTNUserLabel = 'pstnUserLabel';

export const vbPanelApplyBtnText = 'vbPanelApplyBtnText';
export const vbPanelAppliedBtnText = 'vbPanelAppliedBtnText';

export const videoTileNetworkQuailtyLabel = 'videoTileNetworkQuailtyLabel';

export const nativeScreensharePopupHeading = 'nativeScreensharePopupHeading';
export const nativeScreensharePopupSubHeading =
  'nativeScreensharePopupSubHeading';
export const nativeScreensharePopupPrimaryBtnText =
  'nativeScreensharePopupPrimaryBtnText';
export const nativeScreensharePopupIncludeDeviceAudioText =
  'nativeScreensharePopupIncludeDeviceAudioText';

export const nativeStopScreensharePopupHeading =
  'nativeStopScreensharePopupHeading';
export const nativeStopScreensharePopupSubHeading =
  'nativeStopScreensharePopupSubHeading';
export const nativeStopScreensharePopupPrimaryBtnText =
  'nativeStopScreensharePopupPrimaryBtnText';

export const stopRecordingPopupHeading = 'stopRecordingPopupHeading';
export const stopRecordingPopupSubHeading = 'stopRecordingPopupSubHeading';
export const stopRecordingPopupPrimaryBtnText =
  'stopRecordingPopupPrimaryBtnText';

export const clearAllWhiteboardPopupHeading = 'clearAllWhiteboardPopupHeading';
export const clearAllWhiteboardPopupSubHeading =
  'clearAllWhiteboardPopupSubHeading';
export const clearAllWhiteboardPopupPrimaryBtnText =
  'clearAllWhiteboardPopupPrimaryBtnText';

export const leavePopupHeading = `leave${room}PopupHeading`;
export const leavePopupSubHeading = `leave${room}PopupSubHeading`;
export const leavePopupPrimaryBtnText = `leave${room}PopupPrimaryBtnText`;

export const removeFromRoomPopupHeading = `removeFrom${room}PopupHeading`;
export const removeFromRoomPopupSubHeading = `removeFrom${room}PopupSubHeading`;
export const removeFromRoomPopupPrimaryBtnText = `removeFrom${room}PopupPrimaryBtnText`;

export const removeScreenshareFromRoomPopupHeading = `removeScreenshareFrom${room}PopupHeading`;
export const removeScreenshareFromRoomPopupSubHeading = `removeScreenshareFrom${room}PopupSubHeading`;
export const removeScreenshareFromRoomPopupPrimaryBtnText = `removeScreenshareFrom${room}PopupPrimaryBtnText`;

export const stt = 'stt';

export const sttChangeLanguagePopupHeading = `${stt}ChangeSpokenLanguagePopupHeading`;
export const sttChangeLanguagePopupSubHeading = `${stt}ChangeSpokenLanguagePopupSubHeading`;
export const sttChangeLanguagePopupDropdownError = `${stt}ChangeSpokenLanguagePopupDropdownError`;
export const sttChangeLanguagePopupDropdownInfo = `${stt}ChangeSpokenLanguagePopupDropdownInfo`;
export const sttChangeLanguagePopupPrimaryBtnText = `${stt}ChangeSpokenLanguagePopupPrimaryBtnText`;

export const sttChangeSpokenLanguageText = `${stt}ChangeSpokenLanguageText`;
export const sttSettingSpokenLanguageText = `${stt}SettingSpokenLanguageText`;
export const sttTranscriptPanelHeaderText = `${stt}TranscriptPanelHeaderText`;
export const sttDownloadBtnText = `${stt}DownloadBtnText`;
export const sttDownloadTranscriptBtnText = `${stt}DownloadTranscriptBtnText`;
export const sttLanguageChangeInProgress = `${stt}LanguageChangeInProgress`;

export const chatPanelGroupTabText = 'chatPanelGroupTabText';
export const chatPanelPrivateTabText = 'chatPanelPrivateTabText';

export const groupChatWelcomeContent = 'groupChatWelcomeContent';

export const peoplePanelHeaderText = 'peoplePanelHeaderText';

export const groupChatInputPlaceHolderText = 'groupChatInputPlaceHolderText';
export const privateChatInputPlaceHolderText =
  'privateChatInputPlaceHolderText';

export const peoplePanelTurnoffAllCameraBtnText =
  'peoplePanelTurnoffAllCameraBtnText';
export const peoplePanelMuteAllMicBtnText = 'peoplePanelMuteAllMicBtnText';

export const peoplePanelHostSectionHeaderText =
  'peoplePanelHostSectionHeaderText';
export const peoplePanelAudienceSectionHeaderText =
  'peoplePanelAudienceSectionHeaderText';

export const peoplePanelInThisMeetingLabel = 'peoplePanelInThisMeetingLabel';
export const peoplePanelNoHostJoinedContent = 'peoplePanelNoHostJoinedContent';
export const peoplePanelNoUsersJoinedContent =
  'peoplePanelNoUsersJoinedContent';
export const peoplePanelNoAudienceJoinedContent =
  'peoplePanelNoAudienceJoinedContent';

export const moreBtnViewWhiteboard = 'moreBtnViewWhiteboard';
export const moreBtnViewInLarge = 'moreBtnViewInLarge';
export const moreBtnRemoveFromLarge = 'moreBtnRemoveFromLarge';
export const moreBtnPinToTop = 'moreBtnPinToTop';
export const moreBtnRemoveFromTop = 'moreBtnRemoveFromTop';
export const moreBtnMessagePrivately = 'moreBtnMessagePrivately';

export const moreBtnAudio = 'moreBtnAudio';
export const moreBtnVideo = 'moreBtnVideo';

export const moreBtnAddAsPresenter = 'moreBtnAddAsPresenter';
export const moreBtnRemoveAsPresenter = 'moreBtnRemoveAsPresenter';

export const moreBtnRemoveFromRoom = 'moreBtnRemoveFromRoom';
export const moreBtnChangeName = 'moreBtnChangeName';
export const moreBtnStopScreenShare = 'moreBtnStopScreenShare';
export const moreBtnRemoveScreenShare = 'moreBtnRemoveScreenShare';

export const muteAllConfirmationPopoverContent =
  'muteAllConfirmationPopoverContent';
export const muteAllConfirmationPopoverPrimaryBtnText =
  'muteAllConfirmationPopoverPrimaryBtnText';

export const muteConfirmationPopoverContent = 'muteConfirmationPopoverContent';
export const muteConfirmationPopoverPrimaryBtnText =
  'muteConfirmationPopoverPrimaryBtnText';

export const requestConfirmationPopoverContent =
  'requestConfirmationPopoverContent';
export const requestConfirmationPopoverPrimaryBtnText =
  'requestConfirmationPopoverPrimaryBtnText';

export const peoplePanelWantToJoinText = 'peoplePanelWantToJoinText';
export const peoplePanelWaitingText = 'peoplePanelWaitingText';

export const livestreamingAttendeeRaiseHandInfoHeading =
  'livestreamingAttendeeRaiseHandInfoHeading';
export const livestreamingAttendeeRaiseHandInfoSubHeading =
  'livestreamingAttendeeRaiseHandInfoSubHeading';

export const livestreamingAttendeeChatWithOthersInfoHeading =
  'livestreamingAttendeeChatWithOthersInfoHeading';
export const livestreamingAttendeeChatWithOthersInfoSubHeading =
  'livestreamingAttendeeChatWithOthersInfoSubHeading';

export const livestreamingAttendeePresentYourScreenInfoHeading =
  'livestreamingAttendeePresentYourScreenInfoHeading';
export const livestreamingAttendeePresentYourScreenInfoSubHeading =
  'livestreamingAttendeePresentYourScreenInfoSubHeading';

export const livestreamingAttendeeJoinWithActivitiesInfoHeading =
  'livestreamingAttendeeJoinWithActivitiesInfoHeading';
export const livestreamingAttendeeJoinWithActivitiesInfoSubHeading =
  'livestreamingAttendeeJoinWithActivitiesInfoSubHeading';

export const livestreamingAttendeeInviteOthersText =
  'livestreamingAttendeeInviteOthersText';

export const livestreamingAttendeeWhatYouCanDoText =
  'livestreamingAttendeeWhatYouCanDoText';

export const livestreamingAttendeeWaitingForHostToJoinText =
  'livestreamingAttendeeWaitingForHostToJoinText';

export const publicChatToastHeading = 'publicChatToastHeading';

export const multiplePublicChatToastHeading = 'multiplePublicChatToastHeading';
export const multiplePublicChatToastSubHeading =
  'multiplePublicChatToastSubHeading';

export const privateChatToastHeading = 'privateChatToastHeading';
export const multiplePrivateChatToastHeading =
  'multiplePrivateChatToastHeading';

export const multiplePublicAndPrivateChatToastHeading =
  'multiplePublicAndPrivateChatToastHeading';
export const multiplePublicAndPrivateChatToastSubHeading =
  'multiplePublicAndPrivateChatToastSubHeading';

export const livestreamToastApprovalBtnText = 'livestreamApprovalBtnText';
export const livestreamToastDenyBtnText = 'livestreamToastDenyBtnText';

export const livestreamRaiseHandRequestToastHeading =
  'livestreamRaiseHandRequestToastHeading';

export const livestreamRaiseHandRequestToastSubHeading =
  'livestreamRaiseHandRequestToastSubHeading';

export const livestreamRaiseHandRequestReceivedToastHeading =
  'livestreamRaiseHandRequestReceivedToastHeading';

export const livestreamRaiseHandRequestReceivedToastSubHeading =
  'livestreamRaiseHandRequestReceivedToastSubHeading';

export const livestreamRaiseHandRequestAcceptedToastHeading =
  'livestreamRaiseHandRequestAcceptedToastHeading';
export const livestreamRaiseHandRequestAcceptedToastSubHeading =
  'livestreamRaiseHandRequestAcceptedToastSubHeading';

export const livestreamRaiseHandRequestRejectedToastHeading =
  'livestreamRaiseHandRequestRejectedToastHeading';

export const livestreamRaiseHandRequestRecallToastHeading =
  'livestreamRaiseHandRequestRecallToastHeading';

export const livestreamRaiseHandRequestRecallLocalToastHeading =
  'livestreamRaiseHandRequestRecallLocalToastHeading';

export const livestreamRaiseHandApprovedRequestRecallToastHeading =
  'livestreamRaiseHandApprovedRequestRecallToastHeading';

export const livestreamPromoteAsCoHostToastHeading =
  'livestreamPromoteAsCoHostToastHeading';

export const livestreamRequestAlreadyProcessed =
  'livestreamRequestAlreadyProcessed';

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

  [inviteTileWelcomeText]?: I18nBaseType;
  [inviteTileNoElseJoinedYetText]?: I18nBaseType;
  [inviteTileCopyInviteBtnText]?: I18nBaseType;

  [settingPanelNameCantbeChangedInfo]?: I18nBaseType;
  [settingPanelNameInputLabel]?: I18nBaseType;

  [invitePopupHeading]?: I18nBaseType;
  [invitePopupPrimaryBtnText]?: I18nBaseType;

  [PSTNUserLabel]?: I18nBaseType; //

  [vbPanelApplyBtnText]?: I18nBaseType;
  [vbPanelAppliedBtnText]?: I18nBaseType;

  [videoTileNetworkQuailtyLabel]?: I18nBaseType<NetworkQualities>; //

  [toolbarItemLayoutOptionGridText]?: I18nBaseType;
  [toolbarItemLayoutOptionSidebarText]?: I18nBaseType;

  [nativeScreensharePopupHeading]?: I18nBaseType;
  [nativeScreensharePopupSubHeading]?: I18nConditionalType;
  [nativeScreensharePopupPrimaryBtnText]?: I18nBaseType;
  [nativeScreensharePopupIncludeDeviceAudioText]?: I18nBaseType;

  [nativeStopScreensharePopupHeading]?: I18nBaseType;
  [nativeStopScreensharePopupSubHeading]?: I18nBaseType;
  [nativeStopScreensharePopupPrimaryBtnText]?: I18nBaseType;

  [stopRecordingPopupHeading]?: I18nBaseType;
  [stopRecordingPopupSubHeading]?: I18nBaseType;
  [stopRecordingPopupPrimaryBtnText]?: I18nBaseType;

  [clearAllWhiteboardPopupHeading]?: I18nBaseType;
  [clearAllWhiteboardPopupSubHeading]?: I18nBaseType;
  [clearAllWhiteboardPopupPrimaryBtnText]?: I18nBaseType;

  [leavePopupHeading]?: I18nBaseType;
  [leavePopupSubHeading]?: I18nConditionalType;
  [leavePopupPrimaryBtnText]?: I18nBaseType;

  [removeFromRoomPopupHeading]?: I18nBaseType;
  [removeFromRoomPopupSubHeading]?: I18nBaseType;
  [removeFromRoomPopupPrimaryBtnText]?: I18nBaseType;

  [removeScreenshareFromRoomPopupHeading]?: I18nBaseType;
  [removeScreenshareFromRoomPopupSubHeading]?: I18nBaseType;
  [removeScreenshareFromRoomPopupPrimaryBtnText]?: I18nBaseType;

  [sttChangeLanguagePopupHeading]?: I18nConditionalType;
  [sttChangeLanguagePopupSubHeading]?: I18nBaseType;
  [sttChangeLanguagePopupDropdownError]?: I18nBaseType;
  [sttChangeLanguagePopupDropdownInfo]?: I18nBaseType;
  [sttChangeLanguagePopupPrimaryBtnText]?: I18nBaseType;

  [sttChangeSpokenLanguageText]?: I18nBaseType;
  [sttSettingSpokenLanguageText]?: I18nBaseType;
  [sttTranscriptPanelHeaderText]?: I18nBaseType;
  [sttDownloadBtnText]?: I18nBaseType;
  [sttDownloadTranscriptBtnText]?: I18nBaseType;
  [sttLanguageChangeInProgress]?: I18nBaseType;

  [peoplePanelHeaderText]?: I18nBaseType;

  [chatPanelGroupTabText]?: I18nBaseType;
  [chatPanelPrivateTabText]?: I18nBaseType;

  [groupChatWelcomeContent]?: I18nConditionalType;

  [groupChatInputPlaceHolderText]?: I18nBaseType;
  [privateChatInputPlaceHolderText]?: I18nBaseType;

  [peoplePanelTurnoffAllCameraBtnText]?: I18nBaseType;
  [peoplePanelMuteAllMicBtnText]?: I18nBaseType;

  [peoplePanelHostSectionHeaderText]?: I18nBaseType;
  [peoplePanelAudienceSectionHeaderText]?: I18nBaseType;
  [peoplePanelInThisMeetingLabel]?: I18nBaseType;
  [peoplePanelNoHostJoinedContent]?: I18nBaseType;
  [peoplePanelNoUsersJoinedContent]?: I18nBaseType;
  [peoplePanelNoAudienceJoinedContent]?: I18nBaseType;

  [moreBtnViewWhiteboard]?: I18nBaseType;
  [moreBtnViewInLarge]?: I18nBaseType;
  [moreBtnRemoveFromLarge]?: I18nBaseType;
  [moreBtnPinToTop]?: I18nBaseType;
  [moreBtnRemoveFromTop]?: I18nBaseType;
  [moreBtnMessagePrivately]?: I18nBaseType;
  [moreBtnAudio]?: I18nConditionalType;
  [moreBtnVideo]?: I18nConditionalType;
  [moreBtnAddAsPresenter]?: I18nBaseType;
  [moreBtnRemoveAsPresenter]?: I18nBaseType;
  [moreBtnRemoveFromRoom]?: I18nBaseType;
  [moreBtnChangeName]?: I18nBaseType;
  [moreBtnStopScreenShare]?: I18nBaseType;
  [moreBtnRemoveScreenShare]?: I18nBaseType;

  [muteAllConfirmationPopoverContent]: I18nBaseType<I18nMuteType>;
  [muteAllConfirmationPopoverPrimaryBtnText]?: I18nBaseType;

  [requestConfirmationPopoverContent]?: I18nBaseType<I18nRequestConfirmation>;
  [requestConfirmationPopoverPrimaryBtnText]?: I18nBaseType;

  [muteConfirmationPopoverContent]?: I18nBaseType<I18nMuteConfirmation>;
  [muteConfirmationPopoverPrimaryBtnText]?: I18nBaseType;

  [peoplePanelWantToJoinText]?: I18nBaseType;
  [peoplePanelWaitingText]?: I18nBaseType;

  [livestreamingAttendeeRaiseHandInfoHeading]?: I18nBaseType;
  [livestreamingAttendeeRaiseHandInfoSubHeading]?: I18nBaseType;
  [livestreamingAttendeeChatWithOthersInfoHeading]?: I18nBaseType;
  [livestreamingAttendeeChatWithOthersInfoSubHeading]?: I18nBaseType;
  [livestreamingAttendeePresentYourScreenInfoHeading]?: I18nBaseType;
  [livestreamingAttendeePresentYourScreenInfoSubHeading]?: I18nBaseType;
  [livestreamingAttendeeJoinWithActivitiesInfoHeading]?: I18nBaseType;
  [livestreamingAttendeeJoinWithActivitiesInfoSubHeading]?: I18nBaseType;

  [livestreamingAttendeeWaitingForHostToJoinText]?: I18nBaseType;
  [livestreamingAttendeeWhatYouCanDoText]: I18nBaseType;
  [livestreamingAttendeeInviteOthersText]?: I18nBaseType;

  [publicChatToastHeading]?: I18nBaseType;
  [multiplePublicChatToastHeading]?: I18nBaseType;
  [multiplePublicChatToastSubHeading]?: I18nBaseType<{
    count: number;
    from: string;
  }>;

  [privateChatToastHeading]?: I18nBaseType;
  [multiplePrivateChatToastHeading]?: I18nBaseType<{count: number}>;

  [multiplePublicAndPrivateChatToastHeading]?: I18nBaseType;
  [multiplePublicAndPrivateChatToastSubHeading]?: I18nBaseType<{
    publicChatCount: number;
    privateChatCount: number;
    from: string;
  }>;

  [livestreamToastApprovalBtnText]?: I18nBaseType;
  [livestreamToastDenyBtnText]?: I18nBaseType;

  [livestreamRaiseHandRequestToastHeading]?: I18nBaseType;
  [livestreamRaiseHandRequestToastSubHeading]?: I18nBaseType;

  [livestreamRaiseHandRequestReceivedToastHeading]?: I18nBaseType;
  [livestreamRaiseHandRequestReceivedToastSubHeading]?: I18nBaseType;

  [livestreamRaiseHandRequestAcceptedToastHeading]?: I18nBaseType;
  [livestreamRaiseHandRequestAcceptedToastSubHeading]?: I18nBaseType;

  [livestreamRaiseHandRequestRejectedToastHeading]?: I18nBaseType;

  [livestreamRaiseHandRequestRecallToastHeading]?: I18nBaseType;

  [livestreamRaiseHandRequestRecallLocalToastHeading]?: I18nBaseType;

  [livestreamRaiseHandApprovedRequestRecallToastHeading]?: I18nBaseType;

  [livestreamPromoteAsCoHostToastHeading]?: I18nBaseType;

  [livestreamRequestAlreadyProcessed]?: I18nBaseType;
  whiteboardInitializing?: I18nBaseType;
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

  [inviteTileWelcomeText]: 'Welcome',
  [inviteTileNoElseJoinedYetText]: 'No one else has joined yet.',
  [inviteTileCopyInviteBtnText]: 'COPY INVITATION',

  [settingPanelNameCantbeChangedInfo]: `Name can't be changed while whiteboard is active`,
  [settingPanelNameInputLabel]: 'Your Name',

  [invitePopupHeading]: 'Invite others to join this room',
  [invitePopupPrimaryBtnText]: 'COPY INVITATION',

  [PSTNUserLabel]: 'PSTN User',
  [videoTileNetworkQuailtyLabel]: (quality: NetworkQualities) => {
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

  [vbPanelAppliedBtnText]: 'Applied',
  [vbPanelApplyBtnText]: 'Apply',
  [toolbarItemLayoutOptionGridText]: 'Grid',
  [toolbarItemLayoutOptionSidebarText]: 'Sidebar',

  [nativeScreensharePopupHeading]: 'Screen Share',
  [nativeScreensharePopupSubHeading]: camActive =>
    camActive
      ? 'NOTE: Camera and all incoming videos will be turned OFF for an optimised performance, do you wish to proceed?'
      : 'NOTE: All incoming videos will be turned OFF for an optimised performance, do you wish to proceed?',
  [nativeScreensharePopupPrimaryBtnText]: 'PROCEED',
  [nativeScreensharePopupIncludeDeviceAudioText]: 'Include device audio',

  [nativeStopScreensharePopupHeading]: 'Stop Screen Share?',
  [nativeStopScreensharePopupSubHeading]:
    'You need to stop sharing your screen in order to turn the camera ON',
  [nativeStopScreensharePopupPrimaryBtnText]: 'STOP SHARE & TURN CAMERA ON',

  [stopRecordingPopupHeading]: 'Stop Recording?',
  [stopRecordingPopupSubHeading]:
    'Are you sure you want to stop recording? You can’t undo this action.',
  [stopRecordingPopupPrimaryBtnText]: 'END RECORDING',

  [clearAllWhiteboardPopupHeading]: 'Clear Whiteborad?',
  [clearAllWhiteboardPopupSubHeading]:
    'Are you sure you want to clear the whiteboard?',
  [clearAllWhiteboardPopupPrimaryBtnText]: 'CLEAR ALL',

  [leavePopupHeading]: 'Leave Room?',
  [leavePopupSubHeading]: transcriptDownloadAvailable =>
    transcriptDownloadAvailable
      ? `Sure you want to leave? You haven't downloaded your transcripts yet.`
      : 'Are you sure you want to leave this meeting?',
  [leavePopupPrimaryBtnText]: 'LEAVE',

  [removeFromRoomPopupHeading]: name => `Remove ${name}?`,
  [removeFromRoomPopupSubHeading]: name =>
    `Once removed, ${name} will still be able to rejoin the room later.`,
  [removeFromRoomPopupPrimaryBtnText]: 'REMOVE',

  [removeScreenshareFromRoomPopupHeading]: 'Remove Screenshare?',
  [removeScreenshareFromRoomPopupSubHeading]: name =>
    `Once removed, ${name} will still be able to screen share later.`,
  [removeScreenshareFromRoomPopupPrimaryBtnText]: 'REMOVE',

  [sttChangeLanguagePopupHeading]: isFirstTimeOpened =>
    isFirstTimeOpened ? 'Set Spoken Language' : 'Change Spoken Language',
  [sttChangeLanguagePopupSubHeading]:
    'What language(s) are being spoken by everyone in this meeting?',
  [sttChangeLanguagePopupPrimaryBtnText]: 'CONFIRM',
  [sttChangeLanguagePopupDropdownInfo]:
    'Choose at least one language to proceed',
  [sttChangeLanguagePopupDropdownError]:
    'You can choose a maximum of two languages',
  [sttChangeSpokenLanguageText]: 'Change Spoken Language',

  [sttTranscriptPanelHeaderText]: 'Meeting Transcript',
  [sttDownloadBtnText]: 'Download',
  [sttDownloadTranscriptBtnText]: 'Download Transcript',
  [sttSettingSpokenLanguageText]: 'Setting Spoken Language',
  [sttLanguageChangeInProgress]: 'Language Change is in progress...',

  [peoplePanelHeaderText]: 'People',

  [chatPanelGroupTabText]: 'Group',
  [chatPanelPrivateTabText]: 'Private',

  [groupChatWelcomeContent]: noMessage =>
    noMessage
      ? 'Welcome to Chat!\nAll messages are deleted when call ends.'
      : 'All messages are deleted when call ends.',

  [groupChatInputPlaceHolderText]: name => `Chat publicy as ${name}...`,
  [privateChatInputPlaceHolderText]: name => `Private Message to ${name}`,

  [peoplePanelTurnoffAllCameraBtnText]: 'Turn off all cameras',
  [peoplePanelMuteAllMicBtnText]: 'Mute All',

  [peoplePanelHostSectionHeaderText]: 'HOST',
  [peoplePanelAudienceSectionHeaderText]: 'AUDIENCE',
  [peoplePanelInThisMeetingLabel]: 'IN THIS MEETING',
  [peoplePanelNoHostJoinedContent]: 'No Host has joined yet.',
  [peoplePanelNoAudienceJoinedContent]: 'No Audience has joined yet.',
  [peoplePanelNoUsersJoinedContent]: 'No Users has joined yet.',

  [moreBtnViewWhiteboard]: 'View Whiteboard',
  [moreBtnRemoveFromLarge]: 'Remove from large',
  [moreBtnViewInLarge]: 'View in large',
  [moreBtnPinToTop]: 'Pin to top',
  [moreBtnRemoveFromTop]: 'Remove from top',
  [moreBtnMessagePrivately]: 'Message Privately',
  [moreBtnAudio]: audio => (audio ? 'Mute Audio' : 'Request Audio'),
  [moreBtnVideo]: video => (video ? 'Mute Video' : 'Request Video'),
  [moreBtnAddAsPresenter]: 'Add as Presenter',
  [moreBtnRemoveAsPresenter]: 'Remove as Presenter',
  [moreBtnRemoveFromRoom]: 'Remove from Room',
  [moreBtnChangeName]: 'Change Name',
  [moreBtnStopScreenShare]: 'Stop Screenshare',
  [moreBtnRemoveScreenShare]: 'Remove Screenshare',

  [muteAllConfirmationPopoverContent]: (type: I18nMuteType) =>
    `Mute everyone's ${type} on the call?`,
  [requestConfirmationPopoverContent]: ({
    name,
    type,
  }: I18nRequestConfirmation) =>
    `Request ${name} to turn on their ${
      type === I18nMuteType.audio ? 'microphone' : 'camera'
    }?`,
  [muteConfirmationPopoverContent]: ({name, type}: I18nMuteConfirmation) =>
    `Mute ${name}'s ${type} for everyone on the call? Only ${name} can unmute themselves.`,

  [muteAllConfirmationPopoverPrimaryBtnText]: 'Mute All',
  [muteConfirmationPopoverPrimaryBtnText]: 'Mute',
  [requestConfirmationPopoverPrimaryBtnText]: 'Request',

  [peoplePanelWantToJoinText]: 'WANT TO JOIN',
  [peoplePanelWaitingText]: 'WAITING',

  [livestreamingAttendeeRaiseHandInfoHeading]: 'Raise Your hand',
  [livestreamingAttendeeRaiseHandInfoSubHeading]:
    "Let everyone know that you've something to say",
  [livestreamingAttendeeChatWithOthersInfoHeading]: 'Chat with others',
  [livestreamingAttendeeChatWithOthersInfoSubHeading]:
    'Message fellow attendees or the hosts',
  [livestreamingAttendeePresentYourScreenInfoHeading]: 'Present Your screen',
  [livestreamingAttendeePresentYourScreenInfoSubHeading]:
    'Be a presenter post the host’s approval',
  [livestreamingAttendeeJoinWithActivitiesInfoHeading]: 'Join in activities',
  [livestreamingAttendeeJoinWithActivitiesInfoSubHeading]:
    'Jam with everyone on a whiteboard',

  [livestreamingAttendeeInviteOthersText]: 'INVITE OTHER ATTENDEES',
  [livestreamingAttendeeWaitingForHostToJoinText]:
    'Waiting for the host to join',
  [livestreamingAttendeeWhatYouCanDoText]: "Here's what you can do here :",

  [publicChatToastHeading]: (name: string) =>
    `${name} commented in the public chat`,

  [multiplePublicChatToastHeading]: 'New comments in Public Chat',
  [multiplePublicChatToastSubHeading]: ({count, from}) =>
    `You have ${count} new messages from ${from}`,

  [privateChatToastHeading]: 'You’ve received a private message',

  [multiplePrivateChatToastHeading]: ({count}) =>
    `You’ve received ${count} private messages`,

  [multiplePublicAndPrivateChatToastHeading]:
    'New comments in Public & Private Chat',
  [multiplePublicAndPrivateChatToastSubHeading]: ({
    publicChatCount,
    privateChatCount,
    from,
  }) =>
    `You have ${publicChatCount} new messages from ${from} and ${privateChatCount} Private chat`,

  [livestreamToastApprovalBtnText]: 'ALLOW TO BE A PRESENTER',
  [livestreamToastDenyBtnText]: 'DENY',

  [livestreamRaiseHandRequestToastHeading]: 'You’ve raised your hand.',
  [livestreamRaiseHandRequestToastSubHeading]:
    'Waiting for host to approve the request',

  [livestreamRaiseHandRequestReceivedToastHeading]: name =>
    `${name} has raised their hand to be a Presenter`,
  [livestreamRaiseHandRequestReceivedToastSubHeading]:
    'Once approved they will be able to speak, share their video and present during this call.',

  [livestreamRaiseHandRequestAcceptedToastHeading]:
    'Host has approved your request.',
  [livestreamRaiseHandRequestAcceptedToastSubHeading]:
    'You are now a Presenter',

  [livestreamRaiseHandRequestRejectedToastHeading]:
    'Your request was rejected by the host',

  [livestreamRaiseHandRequestRecallToastHeading]: name =>
    `${name} has lowered their hand`,

  [livestreamRaiseHandRequestRecallLocalToastHeading]:
    'You’ve lowered your hand.',

  [livestreamRaiseHandApprovedRequestRecallToastHeading]:
    'Host has revoked streaming permissions.',

  [livestreamPromoteAsCoHostToastHeading]: 'Host promoted you as a Presenter',
  [livestreamRequestAlreadyProcessed]: 'Request already processed.',

  whiteboardInitializing: 'Whiteboard is initializing',
};
