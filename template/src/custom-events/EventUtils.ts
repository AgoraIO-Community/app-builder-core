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

type TEvents = Map<string, {once: boolean; listener: IListener}[]>;
type IListener = <T>(t: T) => void;

const Events = (function () {
  'use strict';

  let _events: TEvents = new Map();

  const _isValidListener = function (listener: any): boolean {
    if (typeof listener === 'function') {
      return true;
    } else if (listener && typeof listener === 'object') {
      return _isValidListener(listener.listener);
    } else {
      return false;
    }
  };

  const _getListeners = function (evt: string) {
    var response;
    if (_events.get(evt)) {
      response = _events.get(evt);
    } else {
      _events.set(evt, []);
      response = _events.get(evt);
    }
    return response;
  };

  const _getListenersAsObject = function (evt: string) {
    const listeners = _getListeners(evt);
    let response: any;

    if (listeners instanceof Array) {
      response = {};
      response[evt] = listeners;
    }

    return response || listeners;
  };

  const _indexOfListener = function (listeners: any, listener: any) {
    var i = listeners.length;
    while (i--) {
      if (listeners[i].listener === listener) {
        return i;
      }
    }

    return -1;
  };

  return {
    getEvents() {
      return _events || (_events = new Map());
    },
    addListener(evt: string, listener: any) {
      if (!_isValidListener(listener)) {
        throw new Error('Listener must be a function');
      }
      const listeners = _getListenersAsObject(evt);
      const listenerIsWrapped = typeof listener === 'object';
      for (let key in listeners) {
        if (
          listeners.hasOwnProperty(key) &&
          _indexOfListener(listeners[key], listener) === -1
        ) {
          listeners[key].push(
            listenerIsWrapped
              ? listener
              : {
                  listener: listener,
                  once: false,
                },
          );
        }
      }
      return this;
    },
    addListeners(evt: string, listeners: any) {
      if (Array.isArray(listeners)) {
        let i = listeners.length;
        while (i--) {
          this.addListener.call(this, evt, listeners[i]);
        }
      }
    },
    addOnceListener(evt: string, listener: IListener) {
      return this.addListener(evt, {
        listener: listener,
        once: true,
      });
    },
    removeListener(evt: string, listenerToRemove: IListener) {
      let listeners = _getListenersAsObject(evt);
      for (let key in listeners) {
        if (listeners.hasOwnProperty(key)) {
          let index = _indexOfListener(listeners[key], listenerToRemove);
          if (index !== -1) {
            listeners[key].splice(index, 1);
          }
        }
      }
      return this;
    },
    removeEvent(evt: string) {
      let type = typeof evt;
      let events = this.getEvents();
      // Remove different things depending on the state of evt
      if (type === 'string') {
        // Remove all listeners for the specified event
        events.delete(evt);
      }
      return this;
    },
    emit(evt: any, args: any) {
      let listenersMap = _getListenersAsObject(evt);
      let listeners;
      let listener;
      for (let key in listenersMap) {
        if (listenersMap.hasOwnProperty(key)) {
          listeners = listenersMap[key].slice(0);
          for (let i = 0; i < listeners.length; i++) {
            // If the listener returns true then it shall be removed from the event
            // The function is executed either with a basic call or an apply if there is an args array
            listener = listeners[i];
            if (listener.once === true) {
              Events.removeListener(evt, listener.listener);
            }
            const newargs = [].slice.call(arguments, 1);
            listener.listener.apply(this, newargs || []);
          }
        }
      }
    },
  };
})();

export default Events;
