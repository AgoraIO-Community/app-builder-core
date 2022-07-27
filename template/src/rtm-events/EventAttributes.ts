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
import {RtmAttribute} from 'agora-react-native-rtm';

type TEventAttribute = {[key: string]: RtmAttribute[]};

const EventAttributes = (function () {
  'use strict';

  let _eventAttributes: TEventAttribute = {};

  return {
    set(uid: string, attr: RtmAttribute | RtmAttribute[]) {
      if (Array.isArray(attr)) {
        const newAttributes = attr.reduce((acc, item) => {
          return {
            ...acc,
            [item.key]: item.value,
          };
        }, {});
        _eventAttributes = {
          ..._eventAttributes,
          [uid]: {
            ..._eventAttributes[uid],
            ...newAttributes,
          },
        };
      } else {
        _eventAttributes = {
          ..._eventAttributes,
          [uid]: {
            ..._eventAttributes[uid],
            [attr.key]: attr.value,
          },
        };
      }
      return _eventAttributes;
    },
    get() {
      return _eventAttributes;
    },
  };
})();

export default EventAttributes;
