import {backOff} from 'exponential-backoff';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {
  type GetUserMetadataResponse as NativeGetUserMetadataResponse,
  type GetOnlineUsersResponse as NativeGetOnlineUsersResponse,
  type RTMClient,
} from 'agora-react-native-rtm';
import {RTMUserData} from './RTMGlobalStateProvider';
import {RECORDING_BOT_UID} from '../utils/constants';

export async function fetchAllOnlineMembersWithRetries(
  client: RTMClient,
  channelName: string,
  {
    maxPageRetries = 5, // how many times to retry a single page
    outerBackoffCap = 30000, // cap outer retry at 30s
  } = {},
) {
  let allMembers: any[] = [];
  let nextPage: string | undefined;
  let totalOccupancy = 0;

  const fetchPage = async (pageNumber?: string) => {
    return backOff(
      async () => {
        const result: NativeGetOnlineUsersResponse =
          await client.presence.getOnlineUsers(
            channelName,
            1, // page size
            {page: pageNumber}, // cursor for pagination
          );
        return result;
      },
      {
        startingDelay: 500,
        timeMultiple: 2,
        maxDelay: 5000,
        numOfAttempts: maxPageRetries,
        retry: (e, attempt) => {
          console.warn(
            `[RTM] Page fetch failed (attempt ${attempt}). Retrying…`,
            e,
          );
          return true;
        },
      },
    );
  };

  const runLoop = async () => {
    do {
      const result = await fetchPage(nextPage);
      const {totalOccupancy: total, occupants, nextPage: next} = result;

      if (occupants) {
        allMembers = allMembers.concat(occupants);
      }

      totalOccupancy = total;
      nextPage = next;

      console.log(
        `[RTM] Fetched ${allMembers.length}/${totalOccupancy} users, nextPage=${nextPage}`,
      );
    } while (nextPage && nextPage.trim() !== '');

    return {allMembers, totalOccupancy};
  };

  // Outer retry for the whole loop
  return backOff(runLoop, {
    startingDelay: 2000,
    timeMultiple: 2,
    maxDelay: outerBackoffCap,
    numOfAttempts: Infinity,
    retry: (e, attempt) => {
      console.warn(
        `[RTM] Outer loop failed (attempt ${attempt}). Retrying whole fetch…`,
        e,
      );
      return true;
    },
  });
}

export const fetchUserAttributesWithBackoffRetry = async (
  client: RTMClient,
  userId: string,
  opts?: {
    isMounted?: () => boolean; // <-- injected check
    onNameFound?: (attr: NativeGetUserMetadataResponse) => void;
    retryTimeoutMs?: number;
  },
  // onNameFound?: (attr: NativeGetUserMetadataResponse) => void,
): Promise<NativeGetUserMetadataResponse> => {
  const start = Date.now();
  const timeout = opts?.retryTimeoutMs ?? 30000;

  return backOff(
    async () => {
      console.log(
        'rudra-core-client: RTM fetching getUserMetadata for member',
        userId,
      );

      if (Date.now() - start > 30000) {
        throw new Error(
          `Timeout: name not found for user ${userId} within 30s`,
        );
      }

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
            if (Date.now() - start > timeout) {
              throw new Error(`Timeout: name not found for ${userId}`);
            }
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
            startingDelay: 500,
            timeMultiple: 2,
            maxDelay: 30000,
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
      startingDelay: 500,
      timeMultiple: 2,
      maxDelay: 30000,
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

/**
 * Process RTM user attributes and update state.
 *
 * @param attr - Agora RTM user metadata response
 * @param userId - User's Agora RTM ID
 * @param setUsers - React state setter (e.g., setMainRoomRTMUsers)
 */
export const processUserUidAttributes = (
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
