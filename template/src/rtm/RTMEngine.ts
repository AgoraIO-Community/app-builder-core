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

  addChannel(name: string, channelID: string) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('addChannel: name must be a non-empty string');
    }
    if (
      !channelID ||
      typeof channelID !== 'string' ||
      channelID.trim() === ''
    ) {
      throw new Error('addChannel: channelID must be a non-empty string');
    }
    this.channelMap.set(name, channelID);
    this.setActiveChannelName(name);
  }

  removeChannel(name: string) {
    this.channelMap.delete(name);
  }

  get localUid() {
    return this.localUID;
  }

  getChannelId(name?: string): string {
    // Default to active channel if no name provided
    const channelName = name || this.activeChannelName;
    console.log('supriya channelName: ', this.channelMap.get(channelName));
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
      throw new Error('setActiveChannel: name must be a non-empty string');
    }
    if (!this.hasChannel(name)) {
      throw new Error(
        `setActiveChannel: Channel '${name}' not found. Add it first with addChannel().`,
      );
    }
    this.activeChannelName = name;
    console.log(
      `RTMEngine: Active channel set to '${name}' (${this.getChannelId(name)})`,
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
    console.log('supriya-rtm-lifecycle unsubscribing from all channel');

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
      console.log('supriya-rtm-lifecycle remove all listeners ');

      await this._engine.removeAllListeners?.();
    } catch {
      console.warn('Failed to remove listeners:');
    }

    // 3. Logout and release resources
    try {
      await this._engine.logout();
      console.log('supriya-rtm-lifecycle logged out ');
      if (isAndroid() || isIOS()) {
        this._engine.release();
      }
    } catch (logoutErrorState) {
      // Logout of Signaling
      const {operation, reason, errorCode} = logoutErrorState;
      console.log(
        `${operation} supriya-rtm-lifecycle logged out failed, the error code is ${errorCode}, because of: ${reason}.`,
      );
      console.warn('RTM logout/release failed:', logoutErrorState);
    }
  }

  /** Fully destroy the singleton and cleanup */
  public async destroy() {
    try {
      if (!this._engine) {
        return;
      }
      await this.destroyClientInstance();
      console.log('supriya-rtm-lifecycle destruction completed ');

      this.channelMap.clear();
      // Reset state
      this.localUID = '';
      this.activeChannelName = RTM_ROOMS.MAIN;
      this._engine = undefined;
      RTMEngine._instance = null;
      console.log('supriya-rtm-lifecycle setting engine instance as null');
    } catch (error) {
      console.error('Error destroying RTM instance:', error);
      // Don't re-throw - destruction should be a best-effort cleanup
      // Re-throwing could prevent proper cleanup in calling code
    }
  }
}

export default RTMEngine;
