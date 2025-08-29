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
  private primaryChannelId: string = '';
  // track multiple subscribed channels
  private channels: Set<string> = new Set();
  private static _instance: RTMEngine | null = null;

  private constructor() {
    if (RTMEngine._instance) {
      return RTMEngine._instance;
    }
    RTMEngine._instance = this;
    return RTMEngine._instance;
  }

  /** Get the singleton instance */
  public static getInstance() {
    // We are only creating the instance but not creating the rtm client yet
    if (!RTMEngine._instance) {
      RTMEngine._instance = new RTMEngine();
    }
    return RTMEngine._instance;
  }

  /** Sets UID and initializes the client if needed */
  setLocalUID(localUID: string | number) {
    if (localUID == null) {
      throw new Error('setLocalUID: localUID cannot be null or undefined');
    }
    const newUID = String(localUID).trim();
    if (!newUID) {
      throw new Error('setLocalUID: localUID cannot be empty');
    }
    if (this._engine && this.localUID !== newUID) {
      throw new Error(
        `Cannot change UID from '${this.localUID}' to '${newUID}'. Call destroy() first.`,
      );
    }
    this.localUID = newUID;
    if (!this._engine) {
      this.createClientInstance();
    }
  }

  addChannel(channelID: string, primary?: boolean) {
    if (
      !channelID ||
      typeof channelID !== 'string' ||
      channelID.trim() === ''
    ) {
      throw new Error(
        'addSecondaryChannel: channelID must be a non-empty string',
      );
    }
    this.channels.add(channelID);
    if (primary) {
      this.primaryChannelId = channelID;
    }
  }

  removeChannel(channelID: string) {
    if (this.channels.has(channelID)) {
      this.channels.delete(channelID);
      if (channelID === this.primaryChannelId) {
        this.primaryChannelId = '';
      }
    }
  }

  get localUid() {
    return this.localUID;
  }

  get channelUid() {
    return this.primaryChannelId;
  }

  get primaryChannel() {
    return this.primaryChannelId;
  }

  get allChannels() {
    const channels = [];
    this.channels.forEach(channel => channels.push(channel));
    return channels.filter(channel => channel.trim() !== '');
  }

  hasChannel(channelID: string): boolean {
    return this.channels.has(channelID);
  }

  /** Engine readiness flag */
  get isEngineReady() {
    return !!this._engine && !!this.localUID;
  }

  /** Access the RTMClient instance */
  get engine(): RTMClient {
    this.ensureEngineReady();
    return this._engine!;
  }

  private ensureEngineReady() {
    if (!this.isEngineReady) {
      throw new Error('RTM Engine not ready. Call setLocalUID() first.');
    }
  }

  /** Create the Agora RTM client */
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
    if (!this._engine) {
      return;
    }

    // Unsubscribe from all tracked channels
    for (const channel of this.allChannels) {
      try {
        await this._engine.unsubscribe(channel);
      } catch (err) {
        console.warn(`Failed to unsubscribe from '${channel}':`, err);
      }
    }

    // 2. Remove all listeners if supported
    try {
      this._engine.removeAllListeners?.();
    } catch {
      console.warn('Failed to remove listeners:');
    }

    // 3. Logout and release resources
    try {
      await this._engine.logout();
      if (isAndroid() || isIOS()) {
        this._engine.release();
      }
    } catch (err) {
      console.warn('RTM logout/release failed:', err);
    }
  }

  /** Fully destroy the singleton and cleanup */
  public async destroy() {
    try {
      if (!this._engine) {
        return;
      }
      await this.destroyClientInstance();
      this.primaryChannelId = '';
      this.channels.clear();
      // Reset state
      this.localUID = '';
      this._engine = undefined;
      RTMEngine._instance = null;
    } catch (error) {
      console.error('Error destroying RTM instance:', error);
      // Don't re-throw - destruction should be a best-effort cleanup
      // Re-throwing could prevent proper cleanup in calling code
    }
  }
}

export default RTMEngine;
