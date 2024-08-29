import {useState, useEffect} from 'react';
import {Keyboard, Platform} from 'react-native';

export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    window.matchMedia('(orientation: portrait)').matches
      ? 'PORTRAIT'
      : 'LANDSCAPE',
  );
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    console.log('screen orientation changed', orientation);
  }, [orientation]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (keyboardVisible && Platform.OS === 'ios') {
        return; // Avoid changing orientation if the keyboard is visible on iOS
      }
      setOrientation(
        window.matchMedia('(orientation: portrait)').matches
          ? 'PORTRAIT'
          : 'LANDSCAPE',
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleOrientationChange(); // Recheck orientation when the tab becomes visible
      }
    };

    const handleResize = () => {
      if (!keyboardVisible) {
        handleOrientationChange();
      }
    };

    // Listen to visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle screen orientation changes
    const mediaQueryList = window.matchMedia('(orientation: portrait)');
    mediaQueryList.addEventListener('change', handleOrientationChange);

    // Handle resize events (as a fallback)
    window.addEventListener('resize', handleResize);

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        handleOrientationChange(); // Recheck orientation after the keyboard is hidden
      },
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQueryList.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardVisible]);

  return orientation;
}
