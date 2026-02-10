import {useEffect, useState} from 'react';

type Orientation = 'PORTRAIT' | 'LANDSCAPE';
export type DeviceClass = 'phone' | 'tablet' | 'desktop';

// https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API

const getOrientation = (): Orientation => {
  // This gives the device hardware orientation
  const type = window.screen?.orientation?.type;
  if (type) {
    return type.startsWith('portrait') ? 'PORTRAIT' : 'LANDSCAPE';
  }
  // In case above api does not exist -> use the physical device height and width
  return window.screen.height >= window.screen.width ? 'PORTRAIT' : 'LANDSCAPE';
};

export const getDeviceClass = (): DeviceClass => {
  const minDim = Math.min(screen.width, screen.height);

  // Phones only
  if (minDim < 600) {
    return 'phone';
  }

  // Everything else (tablet + desktop)
  return 'tablet';
};

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation());

  useEffect(() => {
    console.log('screen orientation changed', orientation);
  }, [orientation]);

  useEffect(() => {
    const update = () => setOrientation(getOrientation());

    window.addEventListener('resize', update);

    // https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/change_event
    const screenOrientation = window.screen?.orientation;
    screenOrientation?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('resize', update);
      screenOrientation?.removeEventListener?.('change', update);
    };
  }, []);

  return orientation;
}
