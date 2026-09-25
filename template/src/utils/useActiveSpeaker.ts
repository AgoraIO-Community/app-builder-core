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
import {useEffect, useState} from 'react';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../rtm-events-api/LocalEvents';
import {
  getCurrentActiveSpeaker,
  setCurrentActiveSpeaker,
} from './activeSpeakerState';

/**
 * Returns active speaker uid or undefined if nobody speaking.
 * Hydrates from the shared last-known uid so remounted tiles (e.g. large slot)
 * keep the highlight without waiting for a duplicate ACTIVE_SPEAKER emit.
 */
function useActiveSpeaker() {
  const [activeSpeaker, setActiveSpeaker] = useState(() =>
    getCurrentActiveSpeaker(),
  );

  useEffect(() => {
    const hydrated = getCurrentActiveSpeaker();
    // Re-sync if an emit landed between first render and effect attach.
    if (hydrated !== activeSpeaker) {
      setActiveSpeaker(hydrated);
    }

    const listenActiveSpeaker = data => {
      const next = setCurrentActiveSpeaker(data);
      setActiveSpeaker(next);
    };
    LocalEventEmitter.on(LocalEventsEnum.ACTIVE_SPEAKER, listenActiveSpeaker);
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.ACTIVE_SPEAKER,
        listenActiveSpeaker,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydrate + subscribe
  }, []);

  return activeSpeaker;
}

export default useActiveSpeaker;
