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
import RTMEngine from '../rtm/RTMEngine';
import {ToOptions, EventPayload} from './types';
import {EventAttributes, EventUtils, eventMessageType} from '../rtm-events';
import {TCbListener, EventSourceEnum} from './types';

class CustomEvents {
  engine!: RtmEngine;
  source: EventSourceEnum = EventSourceEnum.core;

  constructor(source?: EventSourceEnum) {
    this.engine = RTMEngine.getInstance().engine;
    if (source) {
      this.source = source;
    }
  }

  private _persist = async (evt: string, payload: any) => {
    try {
      const localUserId = RTMEngine.getInstance().myUID;
      const rtmAttribute = {key: evt, value: JSON.stringify(payload)};
      // Step 1: Call API to update local attributes
      await this.engine.addOrUpdateLocalUserAttributes([rtmAttribute]);
      // Step 2: Update local state
      EventAttributes.set(localUserId, rtmAttribute);
    } catch (error) {
      console.log(
        'CUSTOM_EVENT_API error occured while updating the value ',
        error,
      );
    }
  };
  private _send = async (rtmPayload: any, to?: ToOptions) => {
    const text = JSON.stringify({
      type: eventMessageType.CUSTOM_EVENT,
      msg: rtmPayload,
    });
    // Case 1: send to channel
    if (
      typeof to === 'undefined' ||
      (typeof to === 'string' && to?.trim() === '') ||
      (Array.isArray(to) && to?.length === 0)
    ) {
      console.log('CUSTOM_EVENT_API: case 1 executed');
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

  on = (name: string, listener: TCbListener) => {
    console.log('CUSTOM_EVENT_API: Event lifecycle: ON', this.source);
    EventUtils.addListener(name, listener, this.source);
  };

  off = (name: string) => {
    console.log('CUSTOM_EVENT_API: Event lifecycle: OFF ');
    EventUtils.removeEvent(name, this.source);
  };

  send = async (evt: string, payload: EventPayload, to?: ToOptions) => {
    console.log('CUSTOM_EVENT_API: send Event payload: ', payload);
    const {action = '', value = '', level = 1} = payload;

    const rtmPayload = {
      evt: evt,
      payload: {
        action,
        value,
        level,
      },
    };

    if (level === 2 || level === 3) {
      console.log('CUSTOM_EVENT_API: Event lifecycle: persist', level);
      await this._persist(evt, payload);
    }
    try {
      await this._send(rtmPayload, to);
    } catch (error) {
      console.log('CUSTOM_EVENT_API: sendPersist sending failed. ', error);
    }
  };

  printEvents = () => {
    console.log(
      'CUSTOM_EVENT_API: EVENTS source',
      EventUtils.getEvents(EventSourceEnum.core),
    );
    console.log(
      'CUSTOM_EVENT_API: EVENTS fpe',
      EventUtils.getEvents(EventSourceEnum.fpe),
    );
    console.log('CUSTOM_EVENT_API: ATTRIBUTES:', EventAttributes.get());
  };
  // once = (name: string, listener: any) => {
  //   console.log('CUSTOM_EVENT_API: Event lifecycle: ONCE');
  //   const response = EventUtils.addOnceListener(name, listener);
  // };
}

export default CustomEvents;
