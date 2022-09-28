import NoSleep from 'nosleep.js';
import React from 'react';
import useIsMobileOrTablet from '../utils/useIsMobileOrTablet';
import {useIsWebInternal} from '../utils/common';

const useWakeLock = () => {
  const isWebInternal = useIsWebInternal();
  const isMobileOrTablet = useIsMobileOrTablet();
  if (isMobileOrTablet() && isWebInternal()) {
    const noSleep = React.useMemo(() => new NoSleep(), []);
    const [awake, set] = React.useState(noSleep.isEnabled);

    const request = React.useCallback(() => {
      noSleep
        .enable()
        .then(() => {
          console.log('enabled sleep successfully');
          set(noSleep.isEnabled);
        })
        .catch((e) => {
          console.log('error enabling sleep', e);
        });
    }, []);

    const release = React.useCallback(() => {
      noSleep.disable();
      set(noSleep.isEnabled);
      console.log('disabled sleep successfully');
    }, []);

    return {
      awake,
      request,
      release,
    };
  }
  return {
    awake: false,
    request: () => {},
    release: () => {},
  };
};

export {useWakeLock};
