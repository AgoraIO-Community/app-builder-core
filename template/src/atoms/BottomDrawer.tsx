import React, {useCallback, useMemo, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

interface BottomDrawerProps {
  children: React.ReactNode | React.ReactNode[];
  snapPoints: string[];
}

const BottomDrawer = (props: BottomDrawerProps) => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = React.useState(true);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    bottomSheetRef.current?.snapToIndex(index);
  }, []);

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={props.snapPoints}
      onChange={handleSheetChanges}
      style={styles.container}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}>
      <BottomSheetView>{props.children}</BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backgroundStyle: {
    backgroundColor: '#FFF', //TODO: to be derived from configs for dark theme
  },

  handleIndicatorStyle: {
    backgroundColor: '#A0B9CA',
    width: 40,
    height: 4,
  },
});

export default BottomDrawer;
