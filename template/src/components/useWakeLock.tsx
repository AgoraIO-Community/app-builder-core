import NoSleep from 'nosleep.js';
import React from 'react';

const useWakeLock = () => {
  const noSleep = React.useMemo(() => new NoSleep(), []);
  const [awake, set] = React.useState(noSleep.isEnabled);

  const request = React.useCallback(() => {
    noSleep
      .enable()
      .then(() => {
        console.log('enabled sleep successfully');
        set(noSleep.isEnabled);
      })
      .catch(() => {
        console.log('error enabling sleep');
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
};

export {useWakeLock};
