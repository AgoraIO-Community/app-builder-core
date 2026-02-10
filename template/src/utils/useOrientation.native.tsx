import {Dimensions} from 'react-native';

export type DeviceClass = 'phone' | 'tablet' | 'desktop';

export const getDeviceClass = (): DeviceClass => {
  // Get the physical screen dimensions for native devices
  const {width, height} = Dimensions.get('screen');
  const minDim = Math.min(width, height);

  // Touch + small screen → phone
  if (minDim < 600) {
    return 'phone';
  }
  // Touch + large screen → tablet
  return 'tablet';
};

export function useOrientation() {
  return 'PORTRAIT';
}
