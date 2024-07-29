import {useState, useEffect} from 'react';

const isPortrait = () => {
  try {
    if (
      window?.screen?.orientation?.type === 'portrait-primary' ||
      window?.screen?.orientation?.type === 'portrait-secondary'
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.log('screen orientation window api not supported error: ', error);
    return true;
  }
};

/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */

export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',
  );

  const onOrientationChange = (event: any) => {
    try {
      console.log('screen orientation changed to -> ', event?.target?.type);
      if (
        event?.target?.type === 'portrait-primary' ||
        event?.target?.type === 'portrait-secondary'
      ) {
        setOrientation('PORTRAIT');
      } else {
        setOrientation('LANDSCAPE');
      }
    } catch (error) {
      console.log('screen orientation window api not supported error: ', error);
      setOrientation('PORTRAIT');
    }
  };

  useEffect(() => {
    window?.screen?.orientation?.addEventListener(
      'change',
      onOrientationChange,
    );
    return () => {
      window?.screen.orientation?.removeEventListener(
        'change',
        onOrientationChange,
      );
    };
  }, []);

  return orientation;
}
