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
import {useMaxUidContext, useMinUidContext} from 'fpe-api';
import {ToggleState} from '../../agora-rn-uikit/src/Contexts/PropsContext';

function useIsVideoEnabled() {
  const minUsers = useMinUidContext();
  const maxUsers = useMaxUidContext();
  const users = [...minUsers, ...maxUsers];
  /**
   *
   * @param uid number | string
   * @returns boolean
   */
  const videoEnabled = (uid: number | string): boolean =>
    users.find((item) => item.uid === uid)?.video === ToggleState.enabled;
  return videoEnabled;
}
export default useIsVideoEnabled;
