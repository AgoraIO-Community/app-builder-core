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
  StorageEvent,
  PresenceEvent,
  MessageEvent,
} from 'agora-react-native-rtm';
import AgoraRTM, {
  RTMClient,
  GetUserMetadataResponse,
  GetChannelMetadataResponse,
} from 'agora-rtm-sdk';
import {
  channelTypeMapping,
  linkStatusReasonCodeMapping,
  linkStatusStateMapping,
  messageEventTypeMapping,
  presenceEventTypeMapping,
  storageEventTypeMapping,
  storageTypeMapping,
} from './Types';

type callbackType = (args?: any) => void;

export class RTMWebClient {
  private client: RTMClient;
  private appId: string;
  private userId: string;
  private eventsMap = new Map<keyof NativeRTMClientEventMap, any>([
    ['linkState', () => null],
    ['storage', () => null],
    ['presence', () => null],
    ['message', () => null],
  ]);

  constructor(appId: string, userId: string) {
    this.appId = appId;
    this.userId = `${userId}`;
    try {
      console.log('BRIDGE supriya constructor', event);
      // Create the actual web RTM client
      this.client = new AgoraRTM.RTM(this.appId, this.userId);

      this.client.addEventListener('linkState', data => {
        const nativeState = {
          ...data,
          currentState: linkStatusStateMapping[data.currentState] || 0,
          previousState: linkStatusStateMapping[data.previousState] || 0,
          reasonCode: linkStatusReasonCodeMapping[data.reasonCode] || 0,
        };
        console.log('BRIDGE supriya linkState', data.currentState);
        switch (data.currentState) {
          case 'CONNECTED':
            this.eventsMap.get('linkState')(nativeState);
            break;

          default:
            break;
        }
      });

      this.client.addEventListener('storage', data => {
        const nativeStorageEvent: StorageEvent = {
          ...data,
          channelType: channelTypeMapping[data.channelType],
          storageType: storageTypeMapping[data.storageType],
          eventType: storageEventTypeMapping[data.eventType],
        };
        console.log('BRIDGE supriya storage event', nativeStorageEvent);
        this.eventsMap.get('storage')(nativeStorageEvent);
      });

      this.client.addEventListener('presence', data => {
        const nativePresenceEvent: PresenceEvent = {
          ...data,
          channelType: presenceEventTypeMapping[data.channelType],
          type: presenceEventTypeMapping[data.eventType],
          publisher: data.publisher,
          stateItems: undefined,
          interval: undefined,
          snapshot: undefined,
        };
        console.log('BRIDGE supriya presence event', nativePresenceEvent);
        this.eventsMap.get('presence')(nativePresenceEvent);
      });

      this.client.addEventListener('message', data => {
        const nativeMessageEvent: MessageEvent = {
          ...data,
          channelType: channelTypeMapping[data.channelType],
          messageType: messageEventTypeMapping[data.messageType],
          message: `${data.message}`,
        };
        this.eventsMap.get('message')(nativeMessageEvent);
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
        console.log('BRIDGE supriya userId: ', options);
        // If no userId provided, use current user TODO
        if (options.userId) {
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
        }
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
          'MESSAGE',
          validatedItems,
        );
      },
      // Add getChannelMetadata method
      getChannelMetadata: async (
        channelName: string,
        channelType: NativeRtmChannelType,
      ) => {
        try {
          console.log(
            'BRIDGE supriya getChannelMetadata:',
            channelName,
            channelType,
          );
          const webResponse: GetChannelMetadataResponse =
            await this.client.storage.getChannelMetadata(
              channelName,
              'MESSAGE',
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
          console.log(
            'BRIDGE supriya presence getOnlineUsers:',
            channelName,
            channelType,
          );

          // Call web SDK's presence method
          const result = await this.client.presence.getOnlineUsers(
            channelName,
            'MESSAGE',
          );
          return result;
        } catch (error) {
          console.error('BRIDGE presence error:', error);
          throw error;
        }
      },

      whoNow: async (channelName: string) => {
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
      console.log('BRIDGE supriya index add event lister', event);
      this.eventsMap.set(event, listener as callbackType);
    }
  }

  removeEventListener(
    event: keyof NativeRTMClientEventMap,
    listener: (event: any) => void,
  ) {
    if (this.client) {
      this.client.removeEventListener(event, listener);
    }
  }

  // Core RTM methods - direct delegation to web SDK
  async login(options?: NativeLoginOptions) {
    console.log('BRIDGE supriya login', options);
    return this.client.login({token: options.token});
  }

  async logout() {
    return this.client.logout();
  }

  async subscribe(channelName: string, options?: any) {
    return this.client.subscribe(channelName, options);
  }

  async unsubscribe(channelName: string) {
    return this.client.unsubscribe(channelName);
  }

  async publish(channelName: string, message: string, options?: any) {
    return this.client.publish(channelName, message, options);
  }

  async renewToken(token: string) {
    return this.client.renewToken(token);
  }

  removeAllListeners() {
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
    console.log('BRIDGE 1 supriya RtmConfig constructor');
    this.appId = config.appId;
    this.userId = config.userId;
    this.useStringUserId = config.useStringUserId;
  }
}
// Factory function to create RTM client
export function createAgoraRtmClient(config: RtmConfig): RTMWebClient {
  console.log('BRIDGE 2 createAgoraRtmClient started');
  return new RTMWebClient(config.appId, config.userId);
}
