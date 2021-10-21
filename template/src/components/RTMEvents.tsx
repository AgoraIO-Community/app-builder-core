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

import {mChannelType, messageEventInterface} from './ChatContext';

const RTM_ERROR_TEMPLATE = 'RTMError:';

type eventsMapInterface = {
  [key in mChannelType]: Record<string, any>;
};

type errorObjectInterface = {
  msg: string;
  cause: any;
};

type eventKeyType = keyof eventsMapInterface;

const eventsMap: eventsMapInterface = {
  [mChannelType.Private]: new Map<string, any>(),
  [mChannelType.Public]: new Map<string, any>(),
};

export interface rtmEventsInterface {
  on: (mChannel: mChannelType, evtName: string, callback: any) => void;
  emit: (
    mChannel: mChannelType,
    data: messageEventInterface | any | null,
    error?: errorObjectInterface | null | undefined,
  ) => void;
  off: (mChannel: mChannelType, evtName: string) => void;
  destroyAll: () => void;
}

const events: rtmEventsInterface = {
  on: (mChannel: mChannelType, evtName: string, callback: any) => {
    eventsMap[mChannel].set(evtName, callback);
  },
  emit: (
    mChannel: mChannelType,
    data: messageEventInterface | any | null,
    error: errorObjectInterface | null | undefined,
  ) => {
    // Handle error, if error found return error in callback
    if (error) {
      let err = new Error(`${RTM_ERROR_TEMPLATE}: ${error.msg}`);
      err.stack += '\nCaused by: ' + error.cause;

      for (const [key] of eventsMap[mChannel].entries()) {
        eventsMap[mChannel].get(`${key}`)(null, err);
      }
      return;
    }
    // Handle success, return data in callback
    for (const [key] of eventsMap[mChannel].entries()) {
      eventsMap[mChannel].get(`${key}`)(data, null);
    }
  },
  off: (mChannel: mChannelType, evtName: string) => {
    eventsMap[mChannel].delete(evtName);
  },
  destroyAll: () => {
    for (const key of Object.keys(eventsMap) as Array<eventKeyType>) {
      eventsMap[key].clear();
    }
  },
};

Object.freeze(events);

export default events;
