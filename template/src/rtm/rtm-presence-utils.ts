import React from 'react';
import {backOff} from 'exponential-backoff';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {
  type GetUserMetadataResponse as NativeGetUserMetadataResponse,
  type GetOnlineUsersResponse as NativeGetOnlineUsersResponse,
  type GetChannelMetadataResponse,
  type RTMClient,
  type UserState,
  type MetadataItem,
} from 'agora-react-native-rtm';
import {RTMUserData} from './RTMGlobalStateProvider';
import {RECORDING_BOT_UID} from '../utils/constants';
import {hasJsonStructure, stripRoomPrefixFromEventKey} from '../rtm/utils';
import {nativeChannelTypeMapping} from '../../bridge/rtm/web/Types';
import {PersistanceLevel} from '../rtm-events-api';

export const fetchOnlineMembersWithRetries = async (
  client: RTMClient,
  channelName: string,
  {
    onPage, // 👈 callback so caller can process each page as soon as it's ready
  }: {
    onPage?: (page: {
      occupants: UserState[];
      total: number;
      pageToken?: string;
    }) => void | Promise<void>;
  } = {},
) => {
  let allMembers: any[] = [];
  let nextPage: string | undefined;
  let totalOccupancy = 0;

  const fetchPage = async (pageNumber?: string) => {
    return backOff(
      async () => {
        const result: NativeGetOnlineUsersResponse =
          await client.presence.getOnlineUsers(
            channelName,
            nativeChannelTypeMapping.MESSAGE,
            {page: pageNumber}, // cursor for pagination
          );
        return result;
      },
      {
        numOfAttempts: 3,
        retry: (e, attempt) => {
          console.warn(
            `[RTM] Page fetch failed (attempt ${attempt}/3). Retrying…`,
            e,
          );
          return attempt < 3; // 👈 stop retrying after 3rd attempt
        },
      },
    );
  };

  do {
    try {
      const result = await fetchPage(nextPage);
      const {totalOccupancy: total, occupants, nextPage: next} = result;
      if (occupants) {
        allMembers = allMembers.concat(occupants);
        // process this page immediately
        await onPage?.({occupants, total, pageToken: nextPage});
      }
      totalOccupancy = total;
      nextPage = next;
      console.log(
        `[RTM] Fetched ${allMembers.length}/${totalOccupancy} users, nextPage=${nextPage}`,
      );
    } catch (fetchPageError) {
      console.error(`[RTM] Page ${nextPage || 'first'} failed`, fetchPageError);
      // 👉 Skip to next page if this one keeps failing
      nextPage = undefined;
    }
  } while (nextPage && nextPage.trim() !== '');

  return {allMembers, totalOccupancy};
};

export const fetchUserAttributesWithRetries = async (
  client: RTMClient,
  userId: string,
  opts?: {
    isMounted?: () => boolean; // <-- injected check
    onNameFound?: (attr: NativeGetUserMetadataResponse) => void;
  },
): Promise<NativeGetUserMetadataResponse> => {
  return backOff(
    async () => {
      console.log(
        'rudra-core-client: RTM fetching getUserMetadata for member',
        userId,
      );

      // Fetch attributes
      const attr: NativeGetUserMetadataResponse =
        await client.storage.getUserMetadata({userId});
      console.log('[user attributes', attr);

      // 1. Check if attributes exist
      if (!attr || !attr.items || attr.items.length === 0) {
        console.log('rudra-core-client: RTM attributes for member not found');
        throw new Error('No attribute items found');
      }
      console.log('sup-attribute-check attributes', attr);

      // 2. Partial update allowed (screenUid, isHost, etc.)
      const hasAny = attr.items.some(i => i.value);
      if (!hasAny) {
        throw new Error('No usable attributes yet');
      }
      console.log('sup-attribute-check hasAny', hasAny);

      // 3. If name exists, return immediately
      const hasNameAttribute = attr.items.find(
        i => i.key === 'name' && i.value,
      );
      console.log('sup-attribute-check name', hasNameAttribute);
      if (hasNameAttribute) {
        return attr;
      }
      // 4. Background retry for name only
      (async () => {
        await backOff(
          async () => {
            // 🔒 Stop if unmounted
            if (opts?.isMounted && !opts?.isMounted) {
              throw new Error(`Component unmounted while retrying ${userId}`);
            }
            console.log('sup-attribute-check inside name backoff');

            const retriedAttributes: NativeGetUserMetadataResponse =
              await client.storage.getUserMetadata({userId});
            console.log(
              'sup-attribute-check retriedAttributes',
              retriedAttributes,
            );

            const hasNameAttributeRetry = retriedAttributes.items.find(
              i => i.key === 'name' && i.value,
            );
            console.log(
              'sup-attribute-check hasNameAttributeRetry',
              hasNameAttributeRetry,
            );

            if (!hasNameAttributeRetry) {
              throw new Error('Name still not found');
            }

            if (opts?.isMounted) {
              console.log('sup-attribute-check onNameFound');
              opts?.onNameFound?.(retriedAttributes);
            }
            return retriedAttributes;
          },
          {
            retry: () => true,
          },
        ).catch(() => {
          console.log(
            `Name not found for ${userId} within 30s, giving up further retries`,
          );
        });
      })();

      return attr;
    },
    {
      retry: (e, idx) => {
        logger.debug(
          LogSource.AgoraSDK,
          'Log',
          `[retrying] Attempt ${idx}. Fetching ${userId}'s name`,
          e,
        );
        return true;
      },
    },
  );
};

export const mapUserAttributesToState = (
  attr: NativeGetUserMetadataResponse,
  userId: string,
  updateFn: (uid: number, userData: Partial<RTMUserData>) => void,
) => {
  try {
    const uid = parseInt(userId, 10);
    const screenUidItem = attr?.items?.find(item => item.key === 'screenUid');
    const isHostItem = attr?.items?.find(item => item.key === 'isHost');
    const nameItem = attr?.items?.find(item => item.key === 'name');
    const screenUid = screenUidItem?.value
      ? parseInt(screenUidItem.value, 10)
      : undefined;

    let userName = '';
    if (nameItem?.value) {
      try {
        const parsedValue = JSON.parse(nameItem.value);
        const payloadString = parsedValue.payload;
        if (payloadString) {
          const payload = JSON.parse(payloadString);
          userName = payload.name;
        }
      } catch {
        // ignore parse errors
      }
    }

    // --- Update main user RTM data
    const userData: RTMUserData = {
      uid,
      type: uid === parseInt(RECORDING_BOT_UID, 10) ? 'bot' : 'rtc',
      screenUid,
      name: userName,
      offline: false,
      isHost: isHostItem?.value || 'false',
      lastMessageTimeStamp: 0,
    };

    updateFn(uid, userData);

    // --- Update screenshare RTM data if present
    if (screenUid) {
      const screenShareData: RTMUserData = {
        type: 'screenshare',
        parentUid: uid,
      };
      updateFn(screenUid, screenShareData);
    }
  } catch (e) {
    console.log('RTM Failed to process user data for', userId, e);
  }
};

export const fetchChannelAttributesWithRetries = async (
  client: RTMClient,
  channelName: string,
  updateFn?: (eventData: {data: any; uid: string; ts: number}) => void,
) => {
  try {
    await client.storage
      .getChannelMetadata(channelName, nativeChannelTypeMapping.MESSAGE)
      .then(async (data: GetChannelMetadataResponse) => {
        console.log('supriya-channel-attributes: ', data);
        for (const item of data.items) {
          try {
            const {key, value, authorUserId, updateTs} = item;
            if (hasJsonStructure(value as string)) {
              const evtData = {
                evt: key,
                value,
              };
              updateFn?.({
                data: evtData,
                uid: authorUserId,
                ts: updateTs,
              });
            }
          } catch (error) {
            logger.error(
              LogSource.AgoraSDK,
              'Log',
              `RTM Failed to process channel attribute item: ${JSON.stringify(
                item,
              )}`,
              {error},
            );
          }
        }
      });
  } catch (error) {}
};

export const clearRoomScopedUserAttributes = async (
  client: RTMClient,
  attributeKeys: readonly string[],
) => {
  try {
    await client?.storage.removeUserMetadata({
      data: {
        items: attributeKeys.map(key => ({
          key,
          value: '',
        })),
      },
    });
  } catch (error) {
    logger.error(
      LogSource.AgoraSDK,
      'RTMConfigure',
      'Failed to clear room-scoped attributes',
      {error},
    );
  }
};

export const processUserAttributeForQueue = (
  item: MetadataItem,
  userId: string,
  currentRoomKey: string,
  onProcessedEvent: (eventKey: string, value: string, userId: string) => void,
) => {
  try {
    if (hasJsonStructure(item.value as string)) {
      let eventKey = item.key;
      try {
        // const parsedValue = JSON.parse(item.value);
        // if (parsedValue.persistLevel === PersistanceLevel.Session) {
        //   const strippedKey = stripRoomPrefixFromEventKey(
        //     item.key,
        //     currentRoomKey,
        //   );
        //   if (strippedKey === null) {
        //     console.log(
        //       'Skipping SESSION attribute for different room:',
        //       item.key,
        //     );
        //     return;
        //   }
        //   eventKey = strippedKey;
        // }

        onProcessedEvent(eventKey, item.value, userId);
      } catch (e) {}
    }
  } catch (error) {
    logger.error(
      LogSource.AgoraSDK,
      'Log',
      'RTM Failed to process user attribute item',
      {error},
    );
  }
};
