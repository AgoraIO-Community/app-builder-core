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

import {messageChannelType, messageEventInterface} from './ChatContext';

const RTM_ERROR_TEMPLATE = 'RTMError:';

type eventsMapInterface = {
  [key in messageChannelType]: Record<string, any>;
};

type errorObjectInterface = {
  msg: string;
  cause: any;
};

type eventKeyType = keyof eventsMapInterface;

const eventsMap: eventsMapInterface = {
  [messageChannelType.Private]: new Map<string, any>(),
  [messageChannelType.Public]: new Map<string, any>(),
};

export interface rtmEventsInterface {
  on: (
    messageChannel: messageChannelType,
    evtName: string,
    callback: any,
  ) => void;
  emit: (
    messageChannel: messageChannelType,
    data: messageEventInterface | any | null,
    error?: errorObjectInterface | null | undefined,
  ) => void;
  off: (messageChannel: messageChannelType, evtName: string) => void;
  destroyAll: () => void;
}

const events: rtmEventsInterface = {
  on: (messageChannel: messageChannelType, evtName: string, callback: any) => {
    eventsMap[messageChannel].set(evtName, callback);
  },
  emit: (
    messageChannel: messageChannelType,
    data: messageEventInterface | any | null,
    error: errorObjectInterface | null | undefined,
  ) => {
    // Handle error, if error found return error in callback
    if (error) {
      let err = new Error(`${RTM_ERROR_TEMPLATE}: ${error.msg}`);
      err.stack += '\nCaused by: ' + error.cause;

      for (const [key] of eventsMap[messageChannel].entries()) {
        eventsMap[messageChannel].get(`${key}`)(null, err);
      }
      return;
    }
    // Handle success, return data in callback
    for (const [key] of eventsMap[messageChannel].entries()) {
      eventsMap[messageChannel].get(`${key}`)(data, null);
    }
  },
  off: (messageChannel: messageChannelType, evtName: string) => {
    eventsMap[messageChannel].delete(evtName);
  },
  destroyAll: () => {
    for (const key of Object.keys(eventsMap) as Array<eventKeyType>) {
      eventsMap[key].clear();
    }
  },
};

Object.freeze(events);

export default events;
