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

  setLocalUID(localUID: number) {
    this.localUID = String(localUID);
    if (!this._engine && this.localUID.trim() !== '') {
      this.createClientInstance();
    }
  }

  setChannelId(channelID: string) {
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
        'RTM Engine not ready. Please call setLocalUID() or setLoginInfo() with a valid UID first.',
      );
    }
  }

  private createClientInstance() {
    try {
      const rtmConfig = new RtmConfig({
        appId: $config.APP_ID,
        userId: this.localUID || `user_${Date.now()}`,
        useStringUserId: true,
      });
      this._engine = createAgoraRtmClient(rtmConfig);
    } catch (error) {
      console.error('Failed to create RTM client instance:', error);
      throw error;
    }
  }

  private async destroyClientInstance() {
    try {
      if (this._engine && this.channelId) {
        // 1. Unsubscribe from channel
        await this._engine.unsubscribe(this.channelId);
        // 2. Remove all listeners
        this._engine.removeAllListeners?.();
        // 3. logout
        await this._engine.logout();
      }
    } catch (error) {
      console.error('Error during client instance destruction:', error);
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

      if (isIOS() || isAndroid()) {
        RTMEngine._instance = null;
      }
    } catch (error) {
      console.error('Error destroying RTM instance:', error);
      throw error;
    }
  }
}

export default RTMEngine;
