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
import {logger, LogSource} from '../logger/AppBuilderLogger';
import {UidType} from '../../agora-rn-uikit';
import getUniqueID from './getUniqueID';
import StorageContext from '../components/StorageContext';
import {useRoomInfo} from 'customization-api';

type BanUserPrivilegesResponse = {
  success: boolean;
  message: string;
  data?: any;
};

/**
 * Bans specific user privileges in the channel.
 * @param hostMeetingId - host meeting id.
 * @param channel - channel from which to ban the user.
 * @param uid - user id to ban.
 * @param duration - how long to ban user in minutes - min 1 max 1440
 * @param privileges - list of privileges to ban. default is ['join_channel', 'publish_audio', 'publish_video']
 */

function useUserBan() {
  const {store} = React.useContext(StorageContext);
  const {
    data: {roomId},
  } = useRoomInfo();
  const BAN_API_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/user/ban`;

  // duration - how long to ban user in minutes - min 1 max 1440
  const banUserPrivileges = async (
    hostMeetingID: string,
    channel: string,
    uid: UidType,
    duration: number,
    privileges: string[] = ['join_channel', 'publish_audio', 'publish_video'],
  ): Promise<BanUserPrivilegesResponse> => {
    if (!uid || !duration || duration < 1 || duration > 1440) {
      logger.error(
        LogSource.NetworkRest,
        'ban_user',
        `Invalid parameters: uid=${uid}, duration=${duration}`,
      );
      return {success: false, message: 'Invalid user ID or duration'};
    }

    const requestId = getUniqueID();
    logger.log(
      LogSource.NetworkRest,
      'ban_user',
      `Trying to ban user with id ${uid} in channel : ${channel}`,
    );

    const payload = {
      passphrase: hostMeetingID || roomId?.host,
      uid: uid,
      channel_name: channel,
      duration: duration,
      privileges: privileges,
    };

    try {
      const response = await fetch(BAN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store?.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok && response.status != 200) {
        const errorText = await response.text();
        logger.error(
          LogSource.NetworkRest,
          'ban_user',
          `Failed to ban user with id ${uid}`,
          errorText,
        );
        return {success: false, message: errorText};
      }
      return {
        success: true,
        message: 'User privileges banned successfully',
      };
    } catch (error) {
      logger.error(
        LogSource.NetworkRest,
        'ban_user',
        `Error while trying to ban user with id ${uid}`,
        error,
      );
      return {success: false, message: 'Error while banning the user'};
    }
  };

  return banUserPrivileges;
}

export default useUserBan;
