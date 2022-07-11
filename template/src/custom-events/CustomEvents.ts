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

('use strict');
import RtmEngine from 'agora-react-native-rtm';
import EventUtils from './EventUtils';
import RTMEngine from '../rtm/RTMEngine';
import {ToOptions, EventOptions} from './types';
import {messageType} from '../rtm/types';
import EventAttributes from './EventAttributes';

type ICbListener = (args: {
  payload: any;
  level: 1 | 2 | 3;
  from: string;
  ts: number;
}) => void;

class CustomEvents {
  engine!: RtmEngine;

  constructor() {
    this.engine = RTMEngine.getInstance().engine;
  }
  private _persist = async (evt: string, options: EventOptions) => {
    const attributeValue =
      typeof options.payload === 'string'
        ? options.payload
        : JSON.stringify(options.payload);
    await this.engine.addOrUpdateLocalUserAttributes([
      {
        key: evt,
        value: attributeValue,
      },
    ]);
    // Update the local user attribute state
    try {
      const localUserId = RTMEngine.getInstance().myUID;
      EventAttributes.set(localUserId, {
        key: evt,
        value: attributeValue,
      });
    } catch (error) {
      console.log(
        'CUSTOM_EVENT_API error occured while updating the value ',
        error,
      );
    }
  };
  private _send = async (to: ToOptions, rtmPayload: any) => {
    const text = JSON.stringify({
      type: messageType.CUSTOM_EVENT,
      msg: rtmPayload,
    });
    // Case 1: send to channel
    if (typeof to == null || typeof to === undefined) {
      console.log('CUSTOM_EVENT_API: case 1 executed', channelId);

      try {
        const channelId = RTMEngine.getInstance().myChannelUID;
        await this.engine.sendMessageByChannelId(channelId, text);
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 1 error : ', error);
        throw error;
      }
    }
    // Case 2: send to indivdual
    if (typeof to === 'string' && to.trim() !== '') {
      console.log('CUSTOM_EVENT_API: case 2 executed', to);

      try {
        await this.engine.sendMessageToPeer({
          peerId: to,
          offline: false,
          text,
        });
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 2 error : ', error);
        throw error;
      }
    }
    // Case 3: send to multiple individuals
    if (typeof to === 'object' && Array.isArray(to)) {
      console.log('CUSTOM_EVENT_API: case 3 executed', to);

      try {
        for (const uid of to) {
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

  send = async (evt: string, to: ToOptions, options: EventOptions) => {
    const rtmPayload = {
      evt: evt,
      payload: options.payload,
      level: options?.level || 1,
    };
    if (options.level === 2 || options.level == 3) {
      await this._persist(evt, options);
    }
    try {
      await this._send(to, rtmPayload);
    } catch (error) {
      console.log('CUSTOM_EVENT_API: sendPersist sending failed. ', error);
    }
  };

  printEvents = () => {
    console.log('CUSTOM_EVENT_API: EVENTS', EventUtils.getEvents());
    console.log('CUSTOM_EVENT_API ATTRIBUTES:', EventAttributes.get());
  };
}

export default new CustomEvents();
