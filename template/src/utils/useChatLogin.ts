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

import {useRoomInfo} from '../components/room-info/useRoomInfo';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';
import {EventNames} from '../rtm-events';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import events, {PersistanceLevel} from '../rtm-events-api';
import {useChatConfigure} from '../components/chat/chatConfigure';

/**
 * Returns a function that enables users to login to agora-chat
 * @returns function
 */
function useChatLogin() {
  const {
    roomPreference: {preventChatAutoLogin},
  } = useRoomInfo();
  const {allowChatLogin} = useChatConfigure();

  const enableChatLogin = () => {
    if (preventChatAutoLogin) {
      logger.debug(LogSource.Internals, 'CONTROLS', `enable chat login`);
      // chat not signed in yet
      // send local event for current user and RTM (L3) event to others in call
      LocalEventEmitter.emit(LocalEventsEnum.ENABLE_CHAT_LOGIN);
      events.send(EventNames.ENABLE_CHAT_LOGIN, null, PersistanceLevel.Session);
    }
  };

  const enableChatLogout = () => {
    if (preventChatAutoLogin) {
      logger.debug(LogSource.Internals, 'CONTROLS', `enable chat logout`);
      // chat not signed in yet
      // send local event for current user and RTM (L3) event to others in call
      LocalEventEmitter.emit(LocalEventsEnum.ENABLE_CHAT_LOGOUT);
      events.send(
        EventNames.ENABLE_CHAT_LOGOUT,
        null,
        PersistanceLevel.Session,
      );
    }
  };
  return {allowChatLogin, enableChatLogin, enableChatLogout};
}

export default useChatLogin;
