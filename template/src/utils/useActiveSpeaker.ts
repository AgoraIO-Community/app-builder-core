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
import {useContent} from 'customization-api';
import {useEffect, useState} from 'react';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';

/**
 * Returns a function that checks whether the given uid is a active speaker and returns true/false
 * @returns function
 */
function useActiveSpeaker() {
  const [activeSpeaker, setActiveSpeaker] = useState(undefined);
  const {defaultContent} = useContent();
  useEffect(() => {
    const listenActiveSpeaker = (data) => {
      setActiveSpeaker(data);
    };
    LocalEventEmitter.on(LocalEventsEnum.ACTIVE_SPEAKER, listenActiveSpeaker);
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.ACTIVE_SPEAKER,
        listenActiveSpeaker,
      );
    };
  }, []);
  return activeSpeaker && defaultContent[activeSpeaker].audio
    ? activeSpeaker
    : undefined;
}

export default useActiveSpeaker;