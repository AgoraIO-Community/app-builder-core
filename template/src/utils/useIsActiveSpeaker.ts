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
import {useRender} from 'customization-api';
import {UidType} from '../../agora-rn-uikit';

/**
 * Returns a function that checks whether the given uid is a active speaker and returns true/false
 * @returns function
 */
function useIsActiveSpeaker() {
  const {activeSpeaker, renderList} = useRender();
  const isActiveSpeaker = (uid: UidType) => {
    return renderList[uid].audio && activeSpeaker === uid;
  };
  return isActiveSpeaker;
}

export default useIsActiveSpeaker;
