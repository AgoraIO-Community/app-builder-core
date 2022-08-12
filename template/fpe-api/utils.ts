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
// commented for v1 release
//export {default as useIsScreenShare} from '../src/utils/isScreenShareUser';
export {default as useIsHost} from '../src/utils/isHostUser';
export {default as useIsAttendee} from '../src/utils/IsAttendeeUser';
export {default as useIsPSTN} from '../src/utils/isPSTNUser';
export {default as useUserList} from '../src/utils/useUserList';
export {default as useGroupMessages} from '../src/utils/useGroupMessages';
export {default as usePrivateMessages} from '../src/utils/usePrivateMessages';
export {default as useIsAudioEnabled} from '../src/utils/isAudioEnabled';
export {default as useIsVideoEnabled} from '../src/utils/isVideoEnabled';
export {default as useSetName} from '../src/utils/useSetName';
export {default as useGetName} from '../src/utils/useGetName';
export {useSidePanel} from '../src/utils/useSidePanel';
export {
  default as useUnreadMessageCount,
  UNREAD_MESSAGE_COUNT_TYPE,
} from '../src/utils/useUnreadMessageCount';
export {
  default as useSetUnreadMessageCount,
  SET_UNREAD_MESSAGE_COUNT_TYPE,
} from '../src/utils/useSetUnreadMessageCount';
export {default as useNavigateTo} from '../src/utils/useNavigateTo';
export {default as useNavParams} from '../src/utils/useNavParams';
export {default as useCreateMeeting} from '../src/utils/useCreateMeeting';
export {default as useJoinMeeting} from '../src/utils/useJoinMeeting';
export {
  default as useSendMessage,
  MESSAGE_TYPE,
} from '../src/utils/useSendMessage';
export {controlMessageEnum} from '../src/components/ChatContext';
export {
  default as useSendControlMessage,
  CONTROL_MESSAGE_TYPE,
} from '../src/utils/useSendControlMessage';
export {
  MUTE_LOCAL_TYPE,
  default as useMuteToggleLocal,
} from '../src/utils/useMuteToggleLocal';
export {default as useRemoteEndcall} from '../src/utils/useRemoteEndCall';
export {
  default as useRemoteMute,
  MUTE_REMOTE_TYPE,
} from '../src/utils/useRemoteMute';
export {ToggleState} from '../agora-rn-uikit/src/Contexts/PropsContext';

//export common function
export * from '../src/utils/common';
