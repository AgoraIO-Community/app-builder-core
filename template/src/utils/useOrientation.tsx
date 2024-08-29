import {useState, useEffect} from 'react';
import {Dimensions, Keyboard, Platform} from 'react-native';

const isPortrait = (width, height) => height >= width;

export function useOrientation(): 'PORTRAIT' | 'LANDSCAPE' {
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>(
    isPortrait(Dimensions.get('window').width, Dimensions.get('window').height)
      ? 'PORTRAIT'
      : 'LANDSCAPE',
  );
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      const {width, height} = Dimensions.get('window');
      const isPortraitMode = isPortrait(width, height);

      if (keyboardVisible && Platform.OS === 'ios') {
        return; // On iOS, avoid changing orientation if the keyboard is visible
      }

      setOrientation(isPortraitMode ? 'PORTRAIT' : 'LANDSCAPE');
    };

    const dimensionListener = Dimensions.addEventListener(
      'change',
      updateOrientation,
    );
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        updateOrientation(); // Recheck orientation after keyboard is hidden
      },
    );

    // Initial check
    updateOrientation();

    return () => {
      dimensionListener?.remove();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardVisible]);

  return orientation;
}
