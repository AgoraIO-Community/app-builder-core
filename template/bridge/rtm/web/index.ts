import {
  type GetUserMetadataOptions as NativeGetUserMetadataOptions,
  type Metadata as NativeMetadata,
  type RtmChannelType as NativeRtmChannelType,
  type SetUserMetadataResponse,
  type LoginOptions as NativeLoginOptions,
  type RTMClientEventMap as NativeRTMClientEventMap,
  type GetUserMetadataResponse as NativeGetUserMetadataResponse,
  type GetChannelMetadataResponse as NativeGetChannelMetadataResponse,
  type SetOrUpdateUserMetadataOptions as NativeSetOrUpdateUserMetadataOptions,
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
} from 'agora-rtm-sdk';
import {
  webToNativechannelTypeMapping,
  nativeToWebChannelTypeMapping,
  linkStatusReasonCodeMapping,
  linkStatusStateMapping,
  messageEventTypeMapping,
  presenceEventTypeMapping,
  storageEventTypeMapping,
  storageTypeMapping,
} from './Types';

type CallbackType = (args?: any) => void;

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
          currentState: linkStatusStateMapping[data.currentState] || 0,
          previousState: linkStatusStateMapping[data.previousState] || 0,
          reasonCode: linkStatusReasonCodeMapping[data.reasonCode] || 0,
        };
        (this.eventsMap.get('linkState') ?? (() => {}))(nativeState);
      });

      this.client.addEventListener('storage', data => {
        const nativeStorageEvent: NativeStorageEvent = {
          ...data,
          channelType: webToNativechannelTypeMapping[data.channelType],
          storageType: storageTypeMapping[data.storageType],
          eventType: storageEventTypeMapping[data.eventType],
        };
        (this.eventsMap.get('storage') ?? (() => {}))(nativeStorageEvent);
      });

      this.client.addEventListener('presence', data => {
        const nativePresenceEvent: NativePresenceEvent = {
          ...data,
          channelType: presenceEventTypeMapping[data.channelType],
          type: presenceEventTypeMapping[data.eventType],
          publisher: data.publisher,
          stateItems: undefined,
          interval: undefined,
          snapshot: undefined,
        };
        (this.eventsMap.get('presence') ?? (() => {}))(nativePresenceEvent);
      });

      this.client.addEventListener('message', data => {
        const nativeMessageEvent: NativeMessageEvent = {
          ...data,
          channelType: webToNativechannelTypeMapping[data.channelType],
          messageType: messageEventTypeMapping[data.messageType],
          message: `${data.message}`,
        };
        (this.eventsMap.get('message') ?? (() => {}))(nativeMessageEvent);
      });
    } catch (error) {
      throw error;
    }
  }

  // Storage methods
  get storage() {
    return {
      setUserMetadata: (
        data: NativeMetadata,
        options?: NativeSetOrUpdateUserMetadataOptions,
      ): Promise<SetUserMetadataResponse> => {
        // 1. Validate that all items have required 'key' property
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('setUserMetadata: data.items must be an array');
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
        return this.client.storage.setUserMetadata(validatedItems, options);
      },

      getUserMetadata: async (options: NativeGetUserMetadataOptions) => {
        // If no userId provided, use current user TODO
        if (!options.userId) {
          throw new Error('getUserMetadata: userId is required');
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

      // Add setChannelMetadata if needed
      setChannelMetadata: async (
        channelName: string,
        channelType: NativeRtmChannelType,
        data: NativeMetadata,
        _options?: NativeIMetadataOptions,
      ) => {
        if (!data.items || !Array.isArray(data.items)) {
          throw new Error('setChannelMetadata: data.items must be an array');
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
          nativeToWebChannelTypeMapping[channelType] || 'MESSAGE',
          validatedItems,
        );
      },
      // Add getChannelMetadata method
      getChannelMetadata: async (
        channelName: string,
        channelType: NativeRtmChannelType,
      ) => {
        try {
          const webResponse: GetChannelMetadataResponse =
            await this.client.storage.getChannelMetadata(
              channelName,
              nativeToWebChannelTypeMapping[channelType] || 'MESSAGE',
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
            channelType: 1,
          };
          return nativeResponse;
        } catch (error) {
          console.error('BRIDGE getChannelMetadata error:', error);
          throw error;
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
        try {
          // Call web SDK's presence method

          const result = await this.client.presence.getOnlineUsers(
            channelName,
            nativeToWebChannelTypeMapping[channelType] || 'MESSAGE',
          );
          return result;
        } catch (error) {
          console.error('BRIDGE presence error:', error);
          throw error;
        }
      },

      whoNow: async (
        channelName: string,
        _channelType?: NativeRtmChannelType,
      ) => {
        return this.client.presence.whoNow(channelName, 'MESSAGE');
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
      // 1. Check if there is already an listener
      const prevListener = this.eventsMap.get(event);
      if (
        prevListener &&
        typeof this.client.removeEventListener === 'function'
      ) {
        // remove that listener
        this.client.removeEventListener(event, prevListener);
      }
      // 2. Set the new listener
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
    return this.client.login({token: options.token});
  }

  async logout() {
    return this.client.logout();
  }

  async subscribe(channelName: string, options?: NativeSubscribeOptions) {
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
    const webOptions: PublishOptions = {
      ...options,
      channelType:
        nativeToWebChannelTypeMapping[options.channelType] || 'MESSAGE',
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
  public useStringUserId?: boolean;

  constructor(config: {
    appId: string;
    userId: string;
    useStringUserId?: boolean;
  }) {
    this.appId = config.appId;
    this.userId = config.userId;
    this.useStringUserId = config.useStringUserId;
  }
}
// Factory function to create RTM client
export function createAgoraRtmClient(config: RtmConfig): RTMWebClient {
  return new RTMWebClient(config.appId, config.userId);
}
