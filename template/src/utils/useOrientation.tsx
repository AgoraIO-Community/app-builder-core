import {useState, useLayoutEffect} from 'react';
import {Dimensions} from 'react-native';

// const isPortrait = () => {
//   const dim = Dimensions.get('window');

//   // This 20 is added to adjust for keyboard autocomplete suggestion area height
//   return dim.height + 20 >= dim.width;
// };

const isPortrait = () => {
  console.log('window dimensions, ', window.innerHeight, window.innerWidth);
  // We use window size instead of dimension API as dimension API takes the keybaord
  // open height into consideration
  return window.innerHeight >= window.innerWidth;
};
/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */
export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',
  );

  // const onResize = () => {
  //   setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');
  // };

  useLayoutEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');
    });

    return () => subscription?.remove();
  }, []);

  // useEffect(() => {
  //   window.visualViewport.addEventListener('resize', onResize);
  //   return () => {
  //     window.visualViewport.removeEventListener('resize', onResize);
  //   };
  // }, []);

  return orientation;
}
