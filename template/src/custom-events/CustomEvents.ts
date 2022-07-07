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
type ICbListener = (args: {
  payload: any;
  level: 1 | 2 | 3;
  from: string;
  ts: number;
}) => void;

('use strict');
import RtmEngine from 'agora-react-native-rtm';
import EventUtils from './EventUtils';
import RTMEngine from '../rtm/RTMEngine';
import {ToOptions, EventOptions} from './types';
import {messageType} from '../rtm/types';

class CustomEvents {
  engine!: RtmEngine;

  constructor() {
    this.engine = RTMEngine.getInstance().engine;
  }

  private send = async (to: ToOptions, rtmPayload: any) => {
    const text = JSON.stringify({
      type: messageType.CUSTOM_EVENT,
      msg: rtmPayload,
    });
    // Case 1: send to channel
    if (to && to.channelId) {
      console.log('CUSTOM_EVENT_API: case 1 executed', to.channelId);
      try {
        await this.engine.sendMessageByChannelId(to.channelId, text);
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 1 error : ', error);
        throw error;
      }
    }
    // Case 2: send to indivdual
    if (typeof to?.uids === 'string' && to?.uids.trim() !== '') {
      console.log('CUSTOM_EVENT_API: case 2 executed', to.uids);

      try {
        await this.engine.sendMessageToPeer({
          peerId: to.uids,
          offline: false,
          text,
        });
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 2 error : ', error);
        throw error;
      }
    }
    // Case 3: send to multiple individuals
    if (typeof to?.uids === 'object' && Array.isArray(to?.uids)) {
      console.log('CUSTOM_EVENT_API: case 3 executed', to.uids);
      try {
        for (const uid of to.uids) {
          // TODO adjust uids
          await this.engine.sendMessageToPeer({
            peerId: uid,
            offline: false,
            text,
          });
        }
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 3 error : ', error);
        throw error;
      }
    }
  };

  on = (name: string, listener: ICbListener) => {
    console.log('CUSTOM_EVENT_API: Event lifecycle: ON');
    const response = EventUtils.addListener(name, listener);
  };

  once = (name: string, listener: any) => {
    console.log('CUSTOM_EVENT_API: Event lifecycle: ONCE');
    const response = EventUtils.addOnceListener(name, listener);
  };

  off = (name: string) => {
    console.log('CUSTOM_EVENT_API: Event lifecycle: OFF ');
    const response = EventUtils.removeEvent(name);
  };

  sendEphemeral = async (
    evt: string,
    to: ToOptions,
    options?: Omit<EventOptions, 'level'>,
  ) => {
    const rtmPayload = {
      evt: evt,
      payload: options?.payload,
      level: 1,
    };
    try {
      console.log('CUSTOM_EVENT_API: sendEmphemeral executed');
      await this.send(to, rtmPayload);
    } catch (error) {
      console.log('CUSTOM_EVENT_API: sendEphemeral sending failed. ', error);
    }
  };

  sendPersist = async (evt: string, to: ToOptions, options?: EventOptions) => {
    const rtmPayload = {
      evt: evt,
      payload: options?.payload,
      level: options?.level,
    };
    if (options?.level === 2 || options?.level == 3) {
      // If level 2 or 3 update local user attribute
      await this.engine.addOrUpdateLocalUserAttributes([
        {key: evt, value: JSON.stringify(options?.payload)},
      ]);
    }
    try {
      await this.send(to, rtmPayload);
    } catch (error) {
      console.log('CUSTOM_EVENT_API: sendPersist sending failed. ', error);
    }
  };

  printEvents = () => {
    console.log('CUSTOM_EVENT_API:', EventUtils.getEvents());
  };
}

export default new CustomEvents();
