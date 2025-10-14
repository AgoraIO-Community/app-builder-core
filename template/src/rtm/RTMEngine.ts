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
import {RTM_ROOMS} from './constants';

class RTMEngine {
  private _engine?: RTMClient;
  private localUID: string = '';
  // track multiple named channels (e.g., "main": "channelId", "breakout": "channelId")
  private channelMap: Map<string, string> = new Map();
  // track current active channel for default operations
  private activeChannelName: string = RTM_ROOMS.MAIN;
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
      throw new Error(
        '[RTMEngine] setLocalUID: localUID cannot be null or undefined',
      );
    }
    const newUID = String(localUID).trim();
    if (!newUID) {
      throw new Error('[RTMEngine] setLocalUID: localUID cannot be empty');
    }
    if (this._engine && this.localUID !== newUID) {
      throw new Error(
        `[RTMEngine] setLocalUID: Cannot change UID from '${this.localUID}' to '${newUID}'. Call destroy() first.`,
      );
    }
    this.localUID = newUID;
    if (!this._engine) {
      console.info(
        `[RTMEngine] setLocalUID: Initializing client for UID: ${this.localUID}`,
      );
      this.createClientInstance();
    } else {
      console.info(
        `[RTMEngine] setLocalUID: UID already initialized: ${this.localUID}`,
      );
    }
  }

  addChannel(name: string, channelID: string) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error(
        '[RTMEngine] addChannel: name must be a non-empty string',
      );
    }
    if (
      !channelID ||
      typeof channelID !== 'string' ||
      channelID.trim() === ''
    ) {
      throw new Error(
        '[RTMEngine] addChannel: channelID must be a non-empty string',
      );
    }
    console.info(
      `[RTMEngine] addChannel: Added channel '${name}' → ${channelID}`,
    );
    this.channelMap.set(name, channelID);
    this.setActiveChannelName(name);
  }

  removeChannel(name: string) {
    console.info(`[RTMEngine] removeChannel: Removing channel '${name}'`);
    this.channelMap.delete(name);
  }

  get localUid() {
    return this.localUID;
  }

  getChannelId(name?: string): string {
    // Default to active channel if no name provided
    const channelName = name || this.activeChannelName;
    return this.channelMap.get(channelName) || '';
  }

  get allChannelIds(): string[] {
    return Array.from(this.channelMap.values()).filter(
      channel => channel.trim() !== '',
    );
  }

  hasChannel(name: string): boolean {
    return this.channelMap.has(name);
  }

  getChannelNames(): string[] {
    return Array.from(this.channelMap.keys());
  }

  /** Set the active channel for default operations */
  setActiveChannelName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error(
        '[RTMEngine] setActiveChannelName: name must be a non-empty string',
      );
    }
    if (!this.hasChannel(name)) {
      throw new Error(
        `[RTMEngine] setActiveChannelName: Channel '${name}' not found. Add it first with addChannel().`,
      );
    }
    this.activeChannelName = name;
    console.info(
      `[RTMEngine] setActiveChannelName: Active channel set → '${name}' (${this.getChannelId(
        name,
      )})`,
    );
  }

  /** Get the current active channel ID */
  getActiveChannelId(): string {
    return this.getChannelId(this.activeChannelName);
  }

  /** Get the current active channel name */
  getActiveChannelName(): string {
    return this.activeChannelName;
  }

  /** Check if the specified channel is currently active */
  isActiveChannel(name: string): boolean {
    return this.activeChannelName === name;
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
      throw new Error(
        '[RTMEngine] ensureEngineReady: not ready. Call setLocalUID() first.',
      );
    }
  }

  /** Create the Agora RTM client */
  private createClientInstance() {
    try {
      if (!this.localUID || this.localUID.trim() === '') {
        throw new Error(
          '[RTMEngine] createClientInstance: Cannot create RTM client: localUID is not set',
        );
      }
      if (!$config.APP_ID) {
        throw new Error(
          '[RTMEngine] createClientInstance: Cannot create RTM client: APP_ID is not configured',
        );
      }
      const rtmConfig = new RtmConfig({
        appId: $config.APP_ID,
        userId: this.localUID,
      });
      this._engine = createAgoraRtmClient(rtmConfig);
      console.info(
        `[RTMEngine] createClientInstance: RTM client created for UID: ${this.localUID}`,
      );
    } catch (error) {
      const contextError = new Error(
        `[RTMEngine] createClientInstance: Failed to create RTM client instance for userId: ${
          this.localUID
        }, appId: ${$config.APP_ID}. Error: ${error.message || error}`,
      );
      console.error('[RTMEngine] createClientInstance: error:', contextError);
      throw contextError;
    }
  }

  private async destroyClientInstance() {
    if (!this._engine) {
      return;
    }
    console.group(
      `[RTMEngine] destroyClientInstance: Destroying client for UID: ${this.localUID}`,
    );
    console.info(
      '[RTMEngine] destroyClientInstance: Unsubscribing from channels:',
      this.allChannelIds,
    );

    // 1. Unsubscribe from all tracked channels
    for (const channel of this.allChannelIds) {
      try {
        await this._engine.unsubscribe(channel);
        console.info(
          `[RTMEngine] destroyClientInstance: Unsubscribed from ${channel}`,
        );
      } catch (err) {
        console.warn(
          `[RTMEngine] destroyClientInstance: Unsubscribe failed: ${channel}`,
          err,
        );
      }
    }
    // 2. Remove user metadata
    try {
      await this._engine?.storage.removeUserMetadata();
      console.info('[RTMEngine] destroyClientInstance: User metadata removed');
    } catch (err) {
      console.warn(
        '[RTMEngine] destroyClientInstance: Failed to remove user metadata',
        err,
      );
    }

    // 3. Remove all listeners
    try {
      this._engine.removeAllListeners?.();
      console.info('[RTMEngine] destroyClientInstance: All listeners removed');
    } catch (err) {
      console.warn(
        '[RTMEngine] destroyClientInstance: Failed to remove listeners',
        err,
      );
    }

    // 4. Logout and release resources
    try {
      await this._engine.logout();
      console.info(
        '[RTMEngine] destroyClientInstance: Logged out successfully',
      );
      if (isAndroid() || isIOS()) {
        this._engine.release();
        console.info(
          '[RTMEngine] destroyClientInstance: Released native resources',
        );
      }
    } catch (logoutErrorState) {
      // Logout of Signaling
      const {operation, reason, errorCode} = logoutErrorState;
      console.log(
        `[RTMEngine] destroyClientInstance: ${operation}  logged out failed, the error code is ${errorCode}, because of: ${reason}.`,
      );
      console.warn(
        '[RTMEngine] destroyClientInstance: Logout/release failed',
        logoutErrorState,
      );
    }
  }

  /** Fully destroy the singleton and cleanup */
  public async destroy() {
    try {
      console.info(
        `[RTMEngine] destroy:  Destroy called for UID: ${this.localUID}`,
      );
      if (!this._engine) {
        return;
      }
      await this.destroyClientInstance();
      console.info('[RTMEngine] destroy: Cleanup complete');

      console.info('[RTMEngine] destroy: clearing channels', this.channelMap);
      this.channelMap.clear();
      // Reset state
      this.localUID = '';
      this.activeChannelName = RTM_ROOMS.MAIN;
      this._engine = undefined;
      RTMEngine._instance = null;
      console.info('[RTMEngine] destroy: Singleton reset');
    } catch (error) {
      console.error('[RTMEngine] destroy: Error during destroy:', error);
      // Don't re-throw - destruction should be a best-effort cleanup
      // Re-throwing could prevent proper cleanup in calling code
    }
  }
}

export default RTMEngine;
