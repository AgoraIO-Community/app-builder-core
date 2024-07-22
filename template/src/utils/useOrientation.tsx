import {useState, useLayoutEffect} from 'react';
import {Dimensions} from 'react-native';

const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */
export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  // State to hold the connection status
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',
  );

  useLayoutEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');
    });

    return () => subscription?.remove();
  }, []);
  return orientation;
}
