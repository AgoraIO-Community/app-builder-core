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

/**
 * This hook will return function to find the private message by uid
 * @returns private message
 */
function usePrivateMessages() {
  const {privateMessageStore} = useContext(ChatContext);
  const getPrivateMessage = (uid: number | string) => privateMessageStore[uid];
  return getPrivateMessage;
}

export default usePrivateMessages;
