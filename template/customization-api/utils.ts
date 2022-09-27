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
//export {default as useIsScreenShare} from '../src/utils/useIsScreenShare';

//hooks used to check user type
export {default as useIsHost} from '../src/utils/useIsHost';
export {default as useIsAttendee} from '../src/utils/useIsAttendee';
export {default as useIsPSTN} from '../src/utils/useIsPSTN';

//hook used to get/set username
export {default as useUserName} from '../src/utils/useUserName';

export {controlMessageEnum} from '../src/components/ChatContext';

//hook to manage audio/video states
export {default as useIsAudioEnabled} from '../src/utils/useIsAudioEnabled';
export {default as useIsVideoEnabled} from '../src/utils/useIsVideoEnabled';
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

//
export type {SidePanelType} from '../src/subComponents/SidePanelEnum';
export {useSidePanel} from '../src/utils/useSidePanel';

//hooks used for navigation
export {useHistory, useParams} from '../src/components/Router';

//hooks used for manage meeting data
export {default as useCreateMeeting} from '../src/utils/useCreateMeeting';
export {default as useJoinMeeting} from '../src/utils/useJoinMeeting';

//export common function
export {
  useIsWeb,
  useIsIOS,
  useIsAndroid,
  useIsDestop,
  useHasBrandLogo,
} from '../src/utils/common';
export {default as useIsMobileOrTablet} from '../src/utils/useIsMobileOrTablet';
export {useLocalUid} from '../agora-rn-uikit';
