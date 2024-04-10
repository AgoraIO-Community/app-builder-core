import NoSleep from 'nosleep.js';
import React from 'react';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {isWebInternal} from '../utils/common';
import {LogSource, logger} from '../logger/AppBuilderLogger';

const useWakeLock = () => {
  if (isMobileOrTablet() && isWebInternal()) {
    const noSleep = React.useMemo(() => new NoSleep(), []);
    const [awake, set] = React.useState(noSleep.isEnabled);

    const request = React.useCallback(() => {
      noSleep
        .enable()
        .then(() => {
          logger.log(
            LogSource.Internals,
            'VIDEO_CALL_ROOM',
            'enabled sleep successfully',
          );
          set(noSleep.isEnabled);
        })
        .catch(e => {
          logger.error(
            LogSource.Internals,
            'VIDEO_CALL_ROOM',
            'error enabling sleep',
            e,
          );
        });
    }, []);

    const release = React.useCallback(() => {
      noSleep.disable();
      set(noSleep.isEnabled);
      logger.log(
        LogSource.Internals,
        'VIDEO_CALL_ROOM',
        'disabled sleep successfully',
      );
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
