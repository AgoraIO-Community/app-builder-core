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
import {useContext} from 'react';
import ChatContext from '../../src/components/ChatContext';
import { UserType } from '../../src/components/RTMConfigure';

/**
 * This hook will return the function to check whether the screen is shared or not
 * @returns function
 */
function useIsScreenShare() {
  const {userList} = useContext(ChatContext);
  /**
   * 
   * @param uid number | string
   * @returns boolean
   */
  const isScreenShare = (uid: number | string): boolean => userList[uid] && userList[uid].type === UserType.ScreenShare;
  return isScreenShare;
}

export default useIsScreenShare;