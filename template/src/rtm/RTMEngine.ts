/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import {
  createAgoraRtmClient,
  RtmConfig,
  type RTMClient,
} from 'agora-react-native-rtm';
import {isAndroid, isIOS} from '../utils/common';

class RTMEngine {
  private _engine?: RTMClient;
  private localUID: string = '';
  private channelId: string = '';

  private static _instance: RTMEngine | null = null;

  private constructor() {
    if (RTMEngine._instance) {
      return RTMEngine._instance;
    }
    RTMEngine._instance = this;
    return RTMEngine._instance;
  }

  public static getInstance() {
    // We are only creating the instance but not creating the rtm client yet
    if (!RTMEngine._instance) {
      RTMEngine._instance = new RTMEngine();
    }
    return RTMEngine._instance;
  }

  setLocalUID(localUID: string | number) {
    if (localUID === null || localUID === undefined) {
      throw new Error('setLocalUID: localUID cannot be null or undefined');
    }

    const newUID = String(localUID);
    if (newUID.trim() === '') {
      throw new Error(
        'setLocalUID: localUID cannot be empty after string conversion',
      );
    }

    // If UID is changing and we have an existing engine, throw error
    if (this._engine && this.localUID !== newUID) {
      throw new Error(
        `RTMEngine: Cannot change UID from '${this.localUID}' to '${newUID}' while engine is active. ` +
          `Please call destroy() first, then setLocalUID() with the new UID.`,
      );
    }

    this.localUID = newUID;

    if (!this._engine) {
      this.createClientInstance();
    }
  }

  setChannelId(channelID: string) {
    if (
      !channelID ||
      typeof channelID !== 'string' ||
      channelID.trim() === ''
    ) {
      throw new Error('setChannelId: channelID must be a non-empty string');
    }
    this.channelId = channelID;
  }

  get localUid() {
    return this.localUID;
  }

  get channelUid() {
    return this.channelId;
  }

  get isEngineReady() {
    return !!this._engine && !!this.localUID;
  }

  get engine(): RTMClient {
    this.ensureEngineReady();
    return this._engine!;
  }

  private ensureEngineReady() {
    if (!this.isEngineReady) {
      throw new Error(
        'RTM Engine not ready. Please call setLocalUID() with a valid UID first.',
      );
    }
  }

  private createClientInstance() {
    try {
      if (!this.localUID || this.localUID.trim() === '') {
        throw new Error('Cannot create RTM client: localUID is not set');
      }
      if (!$config.APP_ID) {
        throw new Error('Cannot create RTM client: APP_ID is not configured');
      }

      const rtmConfig = new RtmConfig({
        appId: $config.APP_ID,
        userId: this.localUID,
        useStringUserId: true,
      });
      this._engine = createAgoraRtmClient(rtmConfig);
    } catch (error) {
      const contextError = new Error(
        `Failed to create RTM client instance for userId: ${
          this.localUID
        }, appId: ${$config.APP_ID}. Error: ${error.message || error}`,
      );
      console.error('RTMEngine createClientInstance error:', contextError);
      throw contextError;
    }
  }

  private async destroyClientInstance() {
    try {
      if (this._engine) {
        // 1. Unsubscribe from channel if we have one
        if (this.channelId) {
          try {
            await this._engine.unsubscribe(this.channelId);
          } catch (error) {
            console.warn(
              `Failed to unsubscribe from channel '${this.channelId}':`,
              error,
            );
            // Continue with cleanup even if unsubscribe fails
          }
        }
        // 2. Remove all listeners
        try {
          this._engine.removeAllListeners?.();
        } catch (error) {
          console.warn('Failed to remove listeners:', error);
        }
        // 3. Logout
        try {
          await this._engine.logout();
        } catch (error) {
          console.warn('Failed to logout:', error);
        }
      }
    } catch (error) {
      console.error('Error during client instance destruction:', error);
      // Don't re-throw - we want cleanup to complete
    }
  }

  async destroy() {
    try {
      if (!this._engine) {
        return;
      }

      await this.destroyClientInstance();
      this.channelId = '';
      this.localUID = '';
      this._engine = undefined;

      // Reset singleton instance for all platforms
      // On web, you might want to keep the singleton for app lifecycle
      // but reset the engine state (which we do above)
      if (isIOS() || isAndroid()) {
        RTMEngine._instance = null;
      }
    } catch (error) {
      console.error('Error destroying RTM instance:', error);
      // Don't re-throw - destruction should be a best-effort cleanup
      // Re-throwing could prevent proper cleanup in calling code
    }
  }
}

export default RTMEngine;
