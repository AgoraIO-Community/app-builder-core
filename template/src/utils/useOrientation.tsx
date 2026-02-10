import {useEffect, useState} from 'react';

type Orientation = 'PORTRAIT' | 'LANDSCAPE';
export type DeviceClass = 'phone' | 'tablet' | 'desktop';

// https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API

const getOrientation = (): Orientation => {
  // This gives the device hardware orientation
  const type = window.screen?.orientation?.type;
  console.log('supriya type: ', type);
  if (type) {
    return type.startsWith('portrait') ? 'PORTRAIT' : 'LANDSCAPE';
  }
  // In case above api does not exist -> use the physical device height and width
  return window.screen.height >= window.screen.width ? 'PORTRAIT' : 'LANDSCAPE';
};

export const getDeviceClass = (): DeviceClass => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints
  // const isTouch = window.navigator.maxTouchPoints > 0;
  const minDim = Math.min(window.screen.width, window.screen.height);
  // Mouse-only devices
  // if (!isTouch) {
  //   return 'desktop';
  // }
  // Touch + small screen → phone
  if (minDim < 768) {
    return 'phone';
  }
  // Touch + large screen → tablet
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
