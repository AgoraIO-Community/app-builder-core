import {useState, useEffect} from 'react';
import {Keyboard, Platform} from 'react-native';

export function useOrientation() {
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

    const handleResize = () => {
      if (!keyboardVisible) {
        handleOrientationChange();
      }
    };

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

    window.addEventListener('resize', handleResize);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [keyboardVisible]);

  return orientation;
}
