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
  private _engine!: RTMClient;
  private localUID: string = '';
  private channelId: string = '';

  private static _instance: RTMEngine | null = null;

  private constructor() {
    if (RTMEngine._instance) {
      return RTMEngine._instance;
    }
    RTMEngine._instance = this;
    this.localUID = '';
    this.channelId = '';
    // RTM v2 client will be created when localUID is set
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
    this.localUID = String(localUID); // Ensure string conversion
    // Create RTM v2 client only when valid localUID is set
    if (!this._engine && this.localUID && this.localUID.trim() !== '') {
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

  get engine() {
    this.ensureEngineReady();
    return this._engine!; // We know it exists after the guard
  }

  private createClientInstance() {
    // RTM v2 client creation is synchronous - returns RTMClient
    const rtmConfig = new RtmConfig({
      appId: $config.APP_ID,
      userId: this.localUID || `user_${Date.now()}`,
      useStringUserId: true,
    });
    this._engine = createAgoraRtmClient(rtmConfig);
  }

  private ensureEngineReady() {
    if (!this.isEngineReady) {
      throw new Error(
        'RTM Engine not ready. Please call setLocalUID() or setLoginInfo() with a valid UID first.',
      );
    }
  }

  private async destroyClientInstance() {
    if (this._engine) {
      await this._engine.logout();
      if (isIOS() || isAndroid()) {
        this._engine.release();
      }
      this._engine = null;
    }
  }

  async destroy() {
    try {
      await this.destroyClientInstance();
      if (isIOS() || isAndroid()) {
        RTMEngine._instance = null;
      }
      this.localUID = '';
      this.channelId = '';
    } catch (error) {
      console.log('Error destroying instance error: ', error);
    }
  }
}

export default RTMEngine;
