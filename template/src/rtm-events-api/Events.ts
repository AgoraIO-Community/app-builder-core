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
import {EventUtils} from '../rtm-events';
import {
  ReceiverUid,
  EventCallback,
  EventSource,
  EventPersistLevel,
} from './types';
import {adjustUID} from '../rtm/utils';

class Events {
  private source: EventSource = EventSource.core;

  constructor(source?: EventSource) {
    if (source) {
      this.source = source;
    }
  }

  /**
   * Persists the data in the local attributes of the user
   *
   * @param {string} evt  to be stored in rtm Attribute key
   * @param {string} payload to be stored in rtm Attribute value
   * @api private
   */
  private _persist = async (evt: string, payload: string) => {
    const rtmEngine: RtmEngine = RTMEngine.getInstance().engine;
    try {
      const rtmAttribute = {key: evt, value: payload};
      // Step 1: Call RTM API to update local attributes
      await rtmEngine.addOrUpdateLocalUserAttributes([rtmAttribute]);
    } catch (error) {
      console.log(
        'CUSTOM_EVENT_API error occured while updating the value ',
        error,
      );
    }
  };

  /**
   *
   */
  private _validateEvt = (evt: string): boolean => {
    if (typeof evt !== 'string') {
      throw Error(
        `CUSTOM_EVENT_API Event name cannot be of type ${typeof evt}`,
      );
    }
    if (evt.trim() == '') {
      throw Error(`CUSTOM_EVENT_API Name or function cannot be empty`);
    }
    return true;
  };

  private _validateListener = (listener: EventCallback): boolean => {
    if (typeof listener !== 'function') {
      throw Error(
        `CUSTOM_EVENT_API Function cannot be of type ${typeof listener}`,
      );
    }
    return true;
  };

  /**
   * Sets the local attribute of user if  persist level is 2 or 3.
   * If param 'to' is not provided, message is sent in the channel.
   * If param 'to' is provided message is sent to that individual.
   * If param 'to' is an array of uids is provided then message is sent to all the individual uids in loop.
   *
   * @param {any} rtmPayload payload to be sent across
   * @param {toUid} to uid or uids[] of user
   * @api private
   */
  private _send = async (rtmPayload: any, toUid?: ReceiverUid) => {
    const to = typeof toUid == 'string' ? parseInt(toUid) : toUid;
    const rtmEngine: RtmEngine = RTMEngine.getInstance().engine;

    const text = JSON.stringify(rtmPayload);
    // Case 1: send to channel
    if (
      typeof to === 'undefined' ||
      (typeof to === 'number' && to <= 0) ||
      (Array.isArray(to) && to?.length === 0)
    ) {
      console.log('CUSTOM_EVENT_API: case 1 executed');
      try {
        const channelId = RTMEngine.getInstance().channelUid;
        await rtmEngine.sendMessageByChannelId(channelId, text);
      } catch (error) {
        console.log('CUSTOM_EVENT_API: send event case 1 error : ', error);
        throw error;
      }
    }
    // Case 2: send to indivdual
    if (typeof to === 'number' && to !== 0) {
      console.log('CUSTOM_EVENT_API: case 2 executed', to);
      const adjustedUID = adjustUID(to);
      try {
        await rtmEngine.sendMessageToPeer({
          peerId: `${adjustedUID}`,
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
          const adjustedUID = adjustUID(uid);
          await rtmEngine.sendMessageToPeer({
            peerId: `${adjustedUID}`,
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

  /**
   * Listens for a specified event.
   * Adds a listener function to the specified event.
   * When the specified event happens, the Events API triggers the callback that you pass.
   * The listener will not be added if it is a duplicate.
   *
   * @param {String} eventName Name of the event to attach the listener to.
   * @param {Function} listener Method to be called when the event is emitted.
   * @api public
   */
  on = (eventName: string, listener: EventCallback) => {
    try {
      if (!this._validateEvt(eventName) || !this._validateListener(listener))
        return;
      EventUtils.addListener(eventName, listener, this.source);
      return () => {
        EventUtils.removeListener(eventName, listener, this.source);
      };
    } catch (error) {
      console.log('custom-events-on error: ', error);
    }
  };

  /**
   * Removes a listener function from the specified event if eventName and listener function both are provided.
   * Removes all listeners from a specified event if listener function is not provided.
   * If you do not specify an event then all listeners will be removed.
   * That means every event will be emptied.
   *
   * @param {String} eventName Name of the event to remove the listener from.
   * @param {Function} listener Method to remove from the event.
   * @api public
   */
  off = (eventName?: string, listener?: EventCallback) => {
    try {
      if (listener) {
        if (this._validateListener(listener) && this._validateEvt(eventName)) {
          EventUtils.removeListener(eventName, listener, this.source);
        }
      } else if (eventName) {
        if (this._validateEvt(eventName)) {
          EventUtils.removeAllListeners(eventName, this.source);
        }
      } else {
        EventUtils.removeAll(this.source);
      }
    } catch (error) {
      console.log('custom-events-off error: ', error);
    }
  };

  /**
   * This method sends p2p or channel message depending upon the 'to' value.
   *  - If 'to' is provided this method sends p2p message.
   *  - If 'to' is empty this method sends channel message.
   *
   *
   * @param {String} eventName  Name of the event to register on which listeners are added
   * @param {String} payload . NOTICE: value bytelength has MAX_SIZE 32kb limit.
   * @param {ReceiverUid} receiver uid or uid array. The default mode is to send a message in channel.
   * @api public
   * */
  send = async (
    eventName: string = '',
    payload: string = '',
    persistLevel: EventPersistLevel,
    receiver?: ReceiverUid,
  ) => {
    if (!this._validateEvt(eventName)) return;

    const persistValue = JSON.stringify({
      payload,
      persistLevel,
      source: this.source,
    });

    const rtmPayload = {
      evt: eventName,
      value: persistValue,
    };

    if (
      persistLevel === EventPersistLevel.LEVEL2 ||
      persistLevel === EventPersistLevel.LEVEL3
    ) {
      console.log('CUSTOM_EVENT_API: Event lifecycle: persist', persistLevel);
      try {
        await this._persist(eventName, persistValue);
      } catch (error) {
        console.log('custom-events-persist error: ', error);
      }
    }
    try {
      await this._send(rtmPayload, receiver);
    } catch (error) {
      console.log('CUSTOM_EVENT_API: sending failed. ', error);
    }
  };
}

export default Events;
