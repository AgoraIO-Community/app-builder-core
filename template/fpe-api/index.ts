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
import React from 'react';
import fpeConfig from 'test-fpe';
import { FpeApiInterface } from './typeDef';
import createHook from './utils';

const FpeContext: React.Context<FpeApiInterface> = React.createContext(fpeConfig);

const useFpe = createHook(FpeContext);

export {
  createHook,
  useFpe,
};

export * from './context';
export * from './components';
export * from './typeDef';

export {default as useIsScreenShare} from '../src/utils/isScreenShareUser';
export {default as useIsHost} from '../src/utils/isHostUser';
export {default as useIsAttendee} from '../src/utils/IsAttendeeUser';
export {default as useIsPSTN} from '../src/utils/isPSTNUser';
export {default as useUserList} from '../src/utils/getUserList';
export {default as useGroupMessages} from '../src/utils/getGroupMessages';
export {default as usePrivateMessages} from '../src/utils/getPrivateMessages';
export {default as useIsAudioEnabled} from '../src/utils/isAudioEnabled';
export {default as useIsVideoEnabled} from '../src/utils/isVideoEnabled';