import {Platform, useWindowDimensions} from 'react-native';

const TABLET_MIN_DIMENSION = 600;

export default function useIsTablet() {
  const {width, height} = useWindowDimensions();
  return (
    Platform.OS !== 'web' && Math.min(width, height) >= TABLET_MIN_DIMENSION
  );
}
