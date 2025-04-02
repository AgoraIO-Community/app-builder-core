import {useContext} from 'react';
import {useRoomInfo} from 'customization-api';
import StorageContext from '../components/StorageContext';
import getUniqueID from '../utils/getUniqueID';
import {logger, LogSource} from '../logger/AppBuilderLogger';
import {UidType} from '../../agora-rn-uikit/src';

export type BanUserPrivilegesResponse = {
  success: boolean;
  message: string;
  data?: any;
};

interface BanUserOptions {
  uid: UidType;
  duration: number;
  hostMeetingId?: string;
}

/**
 * @param options - The options for banning a user.
 * @returns A promise that resolves to the result of the ban operation.
 */
const useUserBan = (): ((
  options: BanUserOptions,
) => Promise<BanUserPrivilegesResponse>) => {
  const {store} = useContext(StorageContext);
  const {
    data: {roomId, channel},
  } = useRoomInfo();

  return async ({uid, duration, hostMeetingId}: BanUserOptions) => {
    if (!uid || !duration || duration < 1 || duration > 1440) {
      logger.error(
        LogSource.NetworkRest,
        'ban_user',
        `Invalid parameters: uid=${uid}, duration=${duration}`,
      );
      return {success: false, message: 'Invalid user ID or duration'};
    }

    const passphrase = hostMeetingId || roomId?.host;
    if (!passphrase) {
      logger.error(LogSource.NetworkRest, 'ban_user', 'Missing passphrase');
      return {
        success: false,
        message: 'Host Passphrase is required to ban user',
      };
    }

    const requestId = getUniqueID();
    const BAN_API_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/user/ban`;

    const payload = {
      passphrase,
      uid,
      channel_name: channel,
      duration,
      privileges: ['join_channel'],
    };

    console.log('Ban User payload', payload);

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

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          LogSource.NetworkRest,
          'ban_user',
          'API Error:',
          errorText,
        );
        return {success: false, message: errorText};
      }

      logger.log(
        LogSource.NetworkRest,
        'ban_user',
        `Successfully banned user ${uid} in channel: ${channel}`,
      );

      return {
        success: true,
        message: 'User banned successfully',
      };
    } catch (error) {
      logger.error(LogSource.NetworkRest, 'ban_user', 'Exception:', error);
      return {success: false, message: 'Unexpected error during ban request'};
    }
  };
};

export default useUserBan;
