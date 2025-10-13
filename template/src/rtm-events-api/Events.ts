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
import {type RTMClient} from 'agora-react-native-rtm';
import RTMEngine from '../rtm/RTMEngine';
import {
  EventUtils,
  RTM_EVENT_SCOPE,
  RTM_GLOBAL_SCOPE_EVENTS,
  RTM_SESSION_SCOPE_EVENTS,
} from '../rtm-events';
import {
  ReceiverUid,
  EventCallback,
  EventSource,
  PersistanceLevel,
  RTMAttributePayload,
} from './types';
import {adjustUID} from '../rtm/utils';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {nativeChannelTypeMapping} from '../../bridge/rtm/web/Types';

function getRTMEventScope(eventName: string): RTM_EVENT_SCOPE {
  if (RTM_GLOBAL_SCOPE_EVENTS.includes(eventName)) {
    return RTM_EVENT_SCOPE.GLOBAL;
  }
  if (RTM_SESSION_SCOPE_EVENTS.includes(eventName)) {
    return RTM_EVENT_SCOPE.SESSION;
  }
  return RTM_EVENT_SCOPE.LOCAL;
}

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
   * @param {String} evt  to be stored in rtm Attribute key
   * @param {String} payload to be stored in rtm Attribute value
   * @api private
   */
  private _persist = async (evt: string, payload: string, roomKey?: string) => {
    const rtmEngine: RTMClient = RTMEngine.getInstance().engine;
    const userId = RTMEngine.getInstance().localUid;
    try {
      // const roomAwareKey = roomKey ? `${roomKey}__${evt}` : evt;
      // console.log(
      //   'session-attributes setting roomAwareKey as: ',
      //   roomAwareKey,
      //   evt,
      // );
      const rtmAttribute = {key: evt, value: payload};
      // Step 1: Call RTM API to update local attributes
      await rtmEngine.storage.setUserMetadata(
        {items: [rtmAttribute]},
        {
          userId,
        },
      );
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'error occured while updating the value ',
        error,
      );
    }
  };

  /**
   * event type validator.
   *
   * @api private
   * @returns {boolean}
   */
  private _validateEvt = (evt: string): boolean => {
    if (typeof evt !== 'string') {
      throw Error(
        `CUSTOM_EVENT_API Event name cannot be of type ${typeof evt}`,
      );
    }
    if (evt.trim() === '') {
      throw Error('CUSTOM_EVENT_API Name or function cannot be empty');
    }
    return true;
  };

  /**
   * event listener validator
   *
   * @api private
   * @returns {boolean}
   */
  private _validateListener = (listener: EventCallback): boolean => {
    if (typeof listener !== 'function') {
      throw Error(
        `CUSTOM_EVENT_API Function cannot be of type ${typeof listener}`,
      );
    }
    return true;
  };

  /**
   * Sets the local attribute of user if persist level is 2 or 3.
   * If param 'toUid' is not provided, message is sent in the channel.
   * If param 'toUid' is provided message is sent to that individual.
   * If param 'toUid' is an array of uids is provided then message is sent to all the individual uids in loop.
   *
   * @param {Object} rtmPayload payload to be sent across
   * @param {ReceiverUid} toUid uid or uids[] of user
   * @param {string} channelId optional specific channel ID, defaults to primary channel
   * @api private
   */
  private _send = async (
    rtmPayload: RTMAttributePayload,
    toUid?: ReceiverUid,
    toChannelId?: string,
  ) => {
    const to = typeof toUid === 'string' ? parseInt(toUid, 10) : toUid;

    const text = JSON.stringify(rtmPayload);

    if (!RTMEngine.getInstance().isEngineReady) {
      throw new Error('RTM Engine is not ready. Call setLocalUID() first.');
    }
    const rtmEngine: RTMClient = RTMEngine.getInstance().engine;

    // Case 1: send to channel
    if (
      typeof to === 'undefined' ||
      (typeof to === 'number' && to <= 0) ||
      (Array.isArray(to) && to?.length === 0)
    ) {
      logger.debug(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'case 1 executed - sending in channel',
      );
      try {
        logger.debug(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'event is sent to targetChannelId ->',
          toChannelId,
        );
        if (!toChannelId || toChannelId.trim() === '') {
          throw new Error(
            'Channel ID is not set. Cannot send channel messages.',
          );
        }
        await rtmEngine.publish(toChannelId, text, {
          channelType: nativeChannelTypeMapping.MESSAGE, // 1 is message
          // customType: 'PlainText',
          // messageType: RtmMessageType.string,
        });
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'send event case 1 error',
          error,
        );
        throw error;
      }
    }
    // Case 2: send to indivdual
    if (typeof to === 'number' && to >= 0) {
      logger.debug(
        LogSource.Events,
        'CUSTOM_EVENTS',
        `case 2 executed - sending to individual ${to}`,
      );
      const adjustedUID = adjustUID(to);
      try {
        await rtmEngine.publish(`${adjustedUID}`, text, {
          channelType: nativeChannelTypeMapping.USER, // user
          customType: 'PlainText',
          messageType: 1,
        });
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'send event case 2 error',
          error,
        );
        throw error;
      }
    }
    // Case 3: send to multiple individuals
    if (typeof to === 'object' && Array.isArray(to)) {
      logger.debug(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'case 3 executed - sending to multiple individuals',
        to,
      );
      try {
        const response = await Promise.allSettled(
          to.map(uid =>
            rtmEngine.publish(`${adjustUID(uid)}`, text, {
              channelType: nativeChannelTypeMapping.USER,
              customType: 'PlainText',
              messageType: 1,
            }),
          ),
        );
        response.forEach((result, index) => {
          const uid = to[index];
          if (result.status === 'rejected') {
            logger.error(
              LogSource.Events,
              'CUSTOM_EVENTS',
              `Failed to publish to user ${uid}:`,
              result.reason,
            );
          }
        });
        // for (const uid of to) {
        //   const adjustedUID = adjustUID(uid);
        //   await rtmEngine.publish(`${adjustedUID}`, text, {
        //     channelType: 3, // user
        //   });
        // }
      } catch (error) {
        logger.error(
          LogSource.Events,
          'CUSTOM_EVENTS',
          'send event case 3 error',
          error,
        );
        throw error;
      }
    }
  };

  private _sendAsChannelAttribute = async (
    rtmPayload: RTMAttributePayload,
    toChannelId?: string,
  ) => {
    // Case 1: send to channel
    logger.debug(
      LogSource.Events,
      'CUSTOM_EVENTS',
      'updating channel attributes',
    );
    try {
      // Validate if rtmengine is ready
      if (!RTMEngine.getInstance().isEngineReady) {
        throw new Error('RTM Engine is not ready. Call setLocalUID() first.');
      }
      const rtmEngine: RTMClient = RTMEngine.getInstance().engine;

      if (!toChannelId) {
        throw new Error('Channel ID is not set. Cannot send channel messages.');
      }

      const rtmAttribute = [{key: rtmPayload.evt, value: rtmPayload.value}];
      console.log(
        'supriya-channel-attrbiutes setting channel attrbiytes: ',
        rtmAttribute,
      );
      await rtmEngine.storage.setChannelMetadata(
        toChannelId,
        nativeChannelTypeMapping.MESSAGE,
        {
          items: rtmAttribute,
        },
        {
          addUserId: true,
          addTimeStamp: true,
        },
      );
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'updating channel attributes error',
        error,
      );
      throw error;
    }
  };

  /**
   * Listen on a new event by eventName and listener.
   * When the specified event happens, the Events API triggers the callback that you pass.
   * The listener will not be added/listened if it is a duplicate.
   *
   * @param {String} eventName Name of the event. It must be a unique string.
   * @param {Function} listener Method to be called when the event is emitted.
   * @returns {Function} Returns function, call it and this listener will be removed from event
   * @api public
   */
  on = (eventName: string, listener: EventCallback): Function => {
    try {
      if (!this._validateEvt(eventName) || !this._validateListener(listener)) {
        // Return no-op function instead of undefined to prevent errors
        return () => {};
      }
      EventUtils.addListener(eventName, listener, this.source);
      console.log('CUSTOM_EVENT_API event listener registered', eventName);
      return () => {
        //@ts-ignore
        EventUtils.removeListener(eventName, listener, this.source);
      };
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'Error: events.on',
        error,
      );
      // Return no-op function on error to prevent undefined issues
      return () => {};
    }
  };

  /**
   * Listen off an event by eventName and listener
   * or listen off events by eventName, when if only eventName argument is passed.
   * or listen off all events, when if no arguments are passed.
   *
   * @param {String} eventName Name of the event to remove the listener from.
   * @param {Function} listener Listener to remove from the event.
   * @api public
   */
  off = (eventName?: string, listener?: EventCallback) => {
    try {
      if (listener) {
        if (
          eventName &&
          this._validateListener(listener) &&
          this._validateEvt(eventName)
        ) {
          // listen off an event by eventName and listener
          //@ts-ignore
          EventUtils.removeListener(eventName, listener, this.source);
        }
      } else if (eventName) {
        // listen off events by name, when if only name is passed.
        if (this._validateEvt(eventName)) {
          EventUtils.removeAllListeners(eventName, this.source);
        }
      } else {
        // listen off all events, that means every event will be emptied.
        EventUtils.removeAll(this.source);
      }
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'Error: events.off',
        error,
      );
    }
  };

  /**
   * This method sends p2p or channel message depending upon the 'receiver' value.
   *  - If 'receiver' is provided this method sends p2p message.
   *  - If 'receiver' is empty this method sends channel message.
   *
   *
   * @param {String} eventName  Name of the event to send.
   * @param {String} payload (optional) Additional data to be sent along with the event.
   * @param {Enum} persistLevel (optional) set different levels of persistance. Default value is Level 1
   * @param {ReceiverUid} receiver (optional) uid or uid array. Default mode sends message in channel.
   * @param {String} channelId (optional) specific channel to send to, defaults to primary channel.
   * @api public
   * */
  send = async (
    eventName: string = '',
    payload: string = '',
    persistLevel: PersistanceLevel = PersistanceLevel.None,
    receiver: ReceiverUid = -1,
    toChannelId?: string,
  ) => {
    try {
      if (!this._validateEvt(eventName)) {
        return;
      }
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        'Event validation failed',
        error,
      );
      return; // Don't throw - just log and return
    }

    // Add meta data
    let currentEventScope = getRTMEventScope(eventName);
    let currentChannelId = RTMEngine.getInstance().getActiveChannelId();
    let currentRoomKey = RTMEngine.getInstance().getActiveChannelName();

    const persistValue = JSON.stringify({
      payload,
      persistLevel,
      source: this.source,
      _scope: currentEventScope,
      _channelId: currentChannelId,
    });
    const rtmPayload: RTMAttributePayload = {
      evt: eventName,
      value: persistValue,
    };

    if (
      persistLevel === PersistanceLevel.Sender ||
      persistLevel === PersistanceLevel.Session
    ) {
      try {
        await this._persist(
          eventName,
          persistValue,
          persistLevel === PersistanceLevel.Session
            ? currentRoomKey
            : undefined,
        );
      } catch (error) {
        logger.error(LogSource.Events, 'CUSTOM_EVENTS', 'persist error', error);
        // don't throw - just log the error, application should continue running
      }
    }
    try {
      logger.log(
        LogSource.Events,
        'CUSTOM_EVENTS',
        `sending event -> ${eventName}`,
        persistValue,
      );
      const targetChannelId = toChannelId || currentChannelId;
      if (persistLevel === PersistanceLevel.Channel) {
        await this._sendAsChannelAttribute(rtmPayload, targetChannelId);
      } else {
        await this._send(rtmPayload, receiver, targetChannelId);
      }
    } catch (error) {
      logger.error(
        LogSource.Events,
        'CUSTOM_EVENTS',
        `Failed to send event '${eventName}' - event lost`,
        error,
      );
      // don't throw - just log the error, application should continue running
    }
  };
}

export default Events;
