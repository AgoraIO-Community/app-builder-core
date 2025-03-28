import React, {createContext, useContext} from 'react';
import {createHook} from 'customization-implementation';
import {UidType} from '../../agora-rn-uikit/src';
import {useRoomInfo} from 'customization-api';
import getUniqueID from '../utils/getUniqueID';
import {logger, LogSource} from '../logger/AppBuilderLogger';
import StorageContext from '../components/StorageContext';

export type BanUserPrivilegesResponse = {
  success: boolean;
  message: string;
  data?: any;
};

interface UserBanContextInterface {
  banUser: (
    uid: UidType,
    duration: number,
  ) => Promise<BanUserPrivilegesResponse>;
}

export const UserBanContext = createContext<UserBanContextInterface>({
  banUser: async () => ({
    success: false,
    message: 'Not initialized',
  }),
});

export const UserBanProvider = ({children}) => {
  const {store} = useContext(StorageContext);
  const {
    data: {roomId, channel},
  } = useRoomInfo();

  const banUser = async (
    uid: UidType,
    duration: number,
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
    const BAN_API_URL = `${$config.BACKEND_ENDPOINT}/v1/channel/user/ban`;

    const payload = {
      passphrase: roomId?.host,
      uid: uid,
      channel_name: channel,
      duration,
      privileges: ['join_channel'],
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
        `Successfully banned user with id ${uid} in channel : ${channel}`,
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

  return (
    <UserBanContext.Provider value={{banUser}}>
      {children}
    </UserBanContext.Provider>
  );
};

export const useUserBan = createHook(UserBanContext);
