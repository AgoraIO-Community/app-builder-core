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
 * This hook will return the function to check whether the current user is a PSTN user or not
 * @returns function
 */
function useIsPSTN() {
  const {renderList} = useRender();
  /**
   *
   * @param uid number
   * @returns boolean
   */
  const isPSTN = (uid: UidType) =>
    !renderList[uid] && String(uid)[0] === '1' ? true : false;
  return isPSTN;
}

export default useIsPSTN;
