import {
  type Metadata as NativeMetadata,
  type MetadataItem as NativeMetadataItem,
  type GetUserMetadataOptions as NativeGetUserMetadataOptions,
  type RtmChannelType as NativeRtmChannelType,
  type SetUserMetadataResponse,
  type LoginOptions as NativeLoginOptions,
  type RTMClientEventMap as NativeRTMClientEventMap,
  type GetUserMetadataResponse as NativeGetUserMetadataResponse,
  type GetChannelMetadataResponse as NativeGetChannelMetadataResponse,
  type SetOrUpdateUserMetadataOptions as NativeSetOrUpdateUserMetadataOptions,
  type RemoveUserMetadataOptions as NativeRemoveUserMetadataOptions,
  type RemoveUserMetadataResponse as NativeRemoveUserMetadataResponse,
  type IMetadataOptions as NativeIMetadataOptions,
  type StorageEvent as NativeStorageEvent,
  type PresenceEvent as NativePresenceEvent,
  type MessageEvent as NativeMessageEvent,
  type SubscribeOptions as NativeSubscribeOptions,
  type PublishOptions as NativePublishOptions,
} from 'agora-react-native-rtm';
import AgoraRTM, {
  RTMClient,
  GetUserMetadataResponse,
  GetChannelMetadataResponse,
  PublishOptions,
  ChannelType,
  MetaDataDetail,
  RemoveUserMetadataOptions,
} from 'agora-rtm-sdk';
import {
  linkStatusReasonCodeMapping,
  nativeChannelTypeMapping,
  nativeLinkStateMapping,
  nativeMessageEventTypeMapping,
  nativePresenceEventTypeMapping,
  nativeStorageEventTypeMapping,
  nativeStorageTypeMapping,
  webChannelTypeMapping,
} from './Types';

type CallbackType = (args?: any) => void;

// Conversion function
const convertWebToNativeMetadata = (webMetadata: any): NativeMetadata => {
  // Convert object entries to MetadataItem array
  const items: NativeMetadataItem[] =
    Object.entries(webMetadata.metadata).map(
      ([key, metadataItem]: [string, MetaDataDetail]) => {
        return {
          key: key,
          value: metadataItem.value,
          revision: metadataItem.revision,
          authorUserId: metadataItem.authorUid,
          updateTs: metadataItem.updated,
        };
      },
    ) || [];

  // Create native Metadata object
  const nativeMetadata: NativeMetadata = {
    majorRevision: webMetadata?.revision || -1, // Use first item's revision as major revision
    items: items,
    itemCount: webMetadata?.totalCount || 0,
  };

  return nativeMetadata;
};

export class RTMWebClient {
  private client: RTMClient;
  private appId: string;
  private userId: string;
  private eventsMap = new Map<keyof NativeRTMClientEventMap, CallbackType>([
    ['linkState', () => null],
    ['storage', () => null],
    ['presence', () => null],
    ['message', () => null],
  ]);

  constructor(appId: string, userId: string) {
    this.appId = appId;
    this.userId = `${userId}`;
    try {
      // Create the actual web RTM client
      this.client = new AgoraRTM.RTM(this.appId, this.userId);

      this.client.addEventListener('linkState', data => {
        const nativeState = {
          ...data,
          currentState:
            nativeLinkStateMapping[data.currentState] ||
            nativeLinkStateMapping.IDLE,
          previousState:
            nativeLinkStateMapping[data.previousState] ||
            nativeLinkStateMapping.IDLE,
          reasonCode: linkStatusReasonCodeMapping[data.reasonCode] || 0,
        };
        (this.eventsMap.get('linkState') ?? (() => {}))(nativeState);
      });

      this.client.addEventListener('storage', data => {
        const nativeStorageEvent: NativeStorageEvent = {
          channelType: nativeChannelTypeMapping[data.channelType],
          storageType: nativeStorageTypeMapping[data.storageType],
          eventType: nativeStorageEventTypeMapping[data.eventType],
          data: convertWebToNativeMetadata(data.data),
          timestamp: data.timestamp,
        };
        (this.eventsMap.get('storage') ?? (() => {}))(nativeStorageEvent);
      });

      this.client.addEventListener('presence', data => {
        const nativePresenceEvent: NativePresenceEvent = {
          channelName: data.channelName,
          channelType: nativeChannelTypeMapping[data.channelType],
          type: nativePresenceEventTypeMapping[data.eventType],
          publisher: data.publisher,
          timestamp: data.timestamp,
        };
        (this.eventsMap.get('presence') ?? (() => {}))(nativePresenceEvent);
      });

      this.client.addEventListener('message', data => {
        const nativeMessageEvent: NativeMessageEvent = {
          ...data,
          channelType: nativeChannelTypeMapping[data.channelType],
          messageType: nativeMessageEventTypeMapping[data.messageType],
          message: `${data.message}`,
        };
        (this.eventsMap.get('message') ?? (() => {}))(nativeMessageEvent);
      });
    } catch (error) {
      const contextError = new Error(
        `Failed to create RTMWebClient for appId: ${this.appId}, userId: ${
          this.userId
        }. Error: ${error.message || error}`,
      );
      console.error('RTMWebClient constructor error:', contextError);
      throw contextError;
    }
  }

  // Storage methods
  get storage() {
    return {
      setUserMetadata: (
        data: NativeMetadata,
        options?: NativeSetOrUpdateUserMetadataOptions,
      ): Promise<SetUserMetadataResponse> => {
        // 1. Validate input parameters
        if (!data) {
          throw new Error('setUserMetadata: data parameter is required');
        }
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error(
            'setUserMetadata: data.items must be a non-empty array',
          );
        }
        if (data.items.length === 0) {
          throw new Error('setUserMetadata: data.items cannot be empty');
        }
        // 2. Make sure key is present as this is mandatory
        // https://docs.agora.io/en/signaling/reference/api?platform=web#storagesetuserpropsag_platform
        const validatedItems = data.items.map((item, index) => {
          if (!item.key || typeof item.key !== 'string') {
            throw new Error(
              `setUserMetadata: item at index ${index} missing required 'key' property`,
            );
          }
          return {
            key: item.key,
            value: item.value || '', // Default to empty string if not provided
            revision: item.revision || -1, // Default to -1 if not provided
          };
        });
        // Map native signature to web signature
        return this.client.storage.setUserMetadata(validatedItems, {
          addTimeStamp: options?.addTimeStamp || true,
          addUserId: options?.addUserId || true,
        });
      },

      getUserMetadata: async (options: NativeGetUserMetadataOptions) => {
        // Validate input parameters
        if (!options) {
          throw new Error('getUserMetadata: options parameter is required');
        }
        if (
          !options.userId ||
          typeof options.userId !== 'string' ||
          options.userId.trim() === ''
        ) {
          throw new Error(
            'getUserMetadata: options.userId must be a non-empty string',
          );
        }
        const webResponse: GetUserMetadataResponse =
          await this.client.storage.getUserMetadata({
            userId: options.userId,
          });
        /**
         * majorRevision : 13483783553
         * metadata :
         *    {
         *     isHost: {authorUid: "", revision: 13483783553, updated: 0, value : "true"},
         *     screenUid: {…}}
         *    }
         * timestamp: 0
         * totalCount: 2
         * userId: "xxx"
         */
        const items = Object.entries(webResponse.metadata).map(
          ([key, metadataItem]) => ({
            key: key,
            value: metadataItem.value,
          }),
        );
        const nativeResponse: NativeGetUserMetadataResponse = {
          items: [...items],
          itemCount: webResponse.totalCount,
          userId: webResponse.userId,
          timestamp: webResponse.timestamp,
        };
        return nativeResponse;
      },

      removeUserMetadata: async (
        options?: NativeRemoveUserMetadataOptions,
      ): Promise<NativeRemoveUserMetadataResponse> => {
        // Build the options object for the web SDK call
        const webOptions: RemoveUserMetadataOptions = {};

        // Add userId if provided (for removing another user's metadata, defaults to self if not provided)
        if (options?.userId && typeof options.userId === 'string') {
          webOptions.userId = options.userId;
        }

        // Convert native Metadata to web MetadataItem[] format if provided
        if (
          options?.data &&
          options.data.items &&
          Array.isArray(options.data.items) &&
          options.data.items.length > 0
        ) {
          webOptions.data = options.data.items.map(item => ({
            key: item.key,
            value: item.value || '', // Require not used for remove.we use keys
          }));
        }

        return await this.client.storage.removeUserMetadata(webOptions);
      },

      setChannelMetadata: async (
        channelName: string,
        channelType: NativeRtmChannelType,
        data: NativeMetadata,
        options?: NativeIMetadataOptions,
      ) => {
        // Validate input parameters
        if (
          !channelName ||
          typeof channelName !== 'string' ||
          channelName.trim() === ''
        ) {
          throw new Error(
            'setChannelMetadata: channelName must be a non-empty string',
          );
        }
        if (typeof channelType !== 'number') {
          throw new Error('setChannelMetadata: channelType must be a number');
        }
        if (!data) {
          throw new Error('setChannelMetadata: data parameter is required');
        }
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('setChannelMetadata: data.items must be an array');
        }
        if (data.items.length === 0) {
          throw new Error('setChannelMetadata: data.items cannot be empty');
        }
        // 2. Make sure key is present as this is mandatory
        // https://docs.agora.io/en/signaling/reference/api?platform=web#storagesetuserpropsag_platform
        const validatedItems = data.items.map((item, index) => {
          if (!item.key || typeof item.key !== 'string') {
            throw new Error(
              `setChannelMetadata: item at index ${index} missing required 'key' property`,
            );
          }
          return {
            key: item.key,
            value: item.value || '', // Default to empty string if not provided
            revision: item.revision || -1, // Default to -1 if not provided
          };
        });
        return this.client.storage.setChannelMetadata(
          channelName,
          (webChannelTypeMapping[channelType] as ChannelType) || 'MESSAGE',
          validatedItems,
          {
            addUserId: options?.addUserId || true,
            addTimeStamp: options?.addTimeStamp || true,
          },
        );
      },

      getChannelMetadata: async (
        channelName: string,
        channelType: NativeRtmChannelType,
      ) => {
        try {
          const webResponse: GetChannelMetadataResponse =
            await this.client.storage.getChannelMetadata(
              channelName,
              (webChannelTypeMapping[channelType] as ChannelType) || 'MESSAGE',
            );

          const items = Object.entries(webResponse.metadata).map(
            ([key, metadataItem]) => ({
              key: key,
              value: metadataItem.value,
            }),
          );
          const nativeResponse: NativeGetChannelMetadataResponse = {
            items: [...items],
            itemCount: webResponse.totalCount,
            timestamp: webResponse.timestamp,
            channelName: webResponse.channelName,
            channelType: nativeChannelTypeMapping.MESSAGE,
          };
          return nativeResponse;
        } catch (error) {
          const contextError = new Error(
            `Failed to get channel metadata for channel '${channelName}' with type ${channelType}: ${
              error.message || error
            }`,
          );
          console.error('BRIDGE getChannelMetadata error:', contextError);
          throw contextError;
        }
      },
    };
  }

  get presence() {
    return {
      getOnlineUsers: async (
        channelName: string,
        channelType: NativeRtmChannelType,
      ) => {
        // Validate input parameters
        if (
          !channelName ||
          typeof channelName !== 'string' ||
          channelName.trim() === ''
        ) {
          throw new Error(
            'getOnlineUsers: channelName must be a non-empty string',
          );
        }
        if (typeof channelType !== 'number') {
          throw new Error('getOnlineUsers: channelType must be a number');
        }

        try {
          // Call web SDK's presence method
          const result = await this.client.presence.getOnlineUsers(
            channelName,
            (webChannelTypeMapping[channelType] as ChannelType) || 'MESSAGE',
          );
          return result;
        } catch (error) {
          const contextError = new Error(
            `Failed to get online users for channel '${channelName}' with type ${channelType}: ${
              error.message || error
            }`,
          );
          console.error('BRIDGE presence error:', contextError);
          throw contextError;
        }
      },

      whoNow: async (
        channelName: string,
        channelType?: NativeRtmChannelType,
      ) => {
        const webChannelType = channelType
          ? (webChannelTypeMapping[channelType] as ChannelType)
          : 'MESSAGE';
        return this.client.presence.whoNow(channelName, webChannelType);
      },

      whereNow: async (userId: string) => {
        return this.client.presence.whereNow(userId);
      },
    };
  }

  addEventListener(
    event: keyof NativeRTMClientEventMap,
    listener: (event: any) => void,
  ) {
    if (this.client) {
      // Simply replace the handler in our map - web client listeners are fixed in constructor
      this.eventsMap.set(event, listener as CallbackType);
    }
  }

  removeEventListener(
    event: keyof NativeRTMClientEventMap,
    _listener: (event: any) => void,
  ) {
    if (this.client && this.eventsMap.has(event)) {
      const prevListener = this.eventsMap.get(event);
      if (prevListener) {
        this.client.removeEventListener(event, prevListener);
      }
      this.eventsMap.set(event, () => null); // reset to no-op
    }
  }

  // Core RTM methods - direct delegation to web SDK
  async login(options?: NativeLoginOptions) {
    if (!options?.token) {
      throw new Error('login: token is required in options');
    }
    return this.client.login({token: options.token});
  }

  async logout() {
    return this.client.logout();
  }

  async subscribe(channelName: string, options?: NativeSubscribeOptions) {
    if (
      !channelName ||
      typeof channelName !== 'string' ||
      channelName.trim() === ''
    ) {
      throw new Error('subscribe: channelName must be a non-empty string');
    }
    return this.client.subscribe(channelName, options);
  }

  async unsubscribe(channelName: string) {
    return this.client.unsubscribe(channelName);
  }

  async publish(
    channelName: string,
    message: string,
    options?: NativePublishOptions,
  ) {
    // Validate input parameters
    if (
      !channelName ||
      typeof channelName !== 'string' ||
      channelName.trim() === ''
    ) {
      throw new Error('publish: channelName must be a non-empty string');
    }
    if (typeof message !== 'string') {
      throw new Error('publish: message must be a string');
    }

    const webOptions: PublishOptions = {
      ...options,
      channelType:
        (webChannelTypeMapping[options?.channelType] as ChannelType) ||
        'MESSAGE',
    };
    return this.client.publish(channelName, message, webOptions);
  }

  async renewToken(token: string) {
    return this.client.renewToken(token);
  }

  removeAllListeners() {
    this.eventsMap = new Map([
      ['linkState', () => null],
      ['storage', () => null],
      ['presence', () => null],
      ['message', () => null],
    ]);
    return this.client.removeAllListeners();
  }
}

export class RtmConfig {
  public appId: string;
  public userId: string;

  constructor(config: {appId: string; userId: string}) {
    this.appId = config.appId;
    this.userId = config.userId;
  }
}
// Factory function to create RTM client
export function createAgoraRtmClient(config: RtmConfig): RTMWebClient {
  return new RTMWebClient(config.appId, config.userId);
}
