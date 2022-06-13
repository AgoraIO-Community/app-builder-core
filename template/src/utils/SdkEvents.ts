/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
/**
 * @format
 */
type callBackType = (...args: any[]) => void;
import {userEventsMapInterface} from '../SDKAppWrapper';

interface eventsMapInterface extends userEventsMapInterface {
  addFpe: callBackType;
  joinMeetingWithPhrase: (phrase: string) => void;
}
interface SDKEventsInterface {
  eventsMap: eventsMapInterface;
  eventSubs: {[key in keyof eventsMapInterface]: any};
  emit: (eventName: keyof eventsMapInterface, ...args: any) => void;
  on: (eventName: keyof eventsMapInterface, cb: callBackType) => void;
  off: (eventName: keyof eventsMapInterface) => void;
}

const SDKEvents: SDKEventsInterface = {
  eventsMap: {
    addFpe: () => {},
    joinMeetingWithPhrase: (p) => {},
    leave: () => {},
    create: () => {},
    preJoin: () => {},
    join: () => {},
  },
  eventSubs: {
    addFpe: null,
    joinMeetingWithPhrase: null,
    leave: null,
    create: null,
    preJoin: null,
    join: null,
  },
  on: function (eventName, cb) {
    console.log(
      'DEBUG(aditya)-SDKEvents: event registered:',
      eventName,
    );
    this.eventsMap[eventName] = cb;
    if (this.eventSubs[eventName]) {
      cb(...this.eventSubs[eventName]);
    }
  },
  emit: function (eventName, ...args) {
    console.log('DEBUG(aditya)-SDKEvents: emit called:', eventName, ...args);
    this.eventsMap[eventName](...args);
    this.eventSubs[eventName] = args;
  },
  off: function (eventName) {
    console.log('DEBUG(aditya)-SDKEvents: event deregistered:', eventName);
    this.eventSubs[eventName] = null;
  },
};

export default SDKEvents;
