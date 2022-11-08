import React, {useCallback, useMemo, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const BottomDrawer = () => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = React.useState(true);

  // variables
  const snapPoints = useMemo(() => ['5%', '40%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // renders
  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}>
      <View style={styles.contentContainer}>
        <Text>content </Text>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.5,
    padding: 20,
    backgroundColor: 'red',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000000',
    shadowOffset: {width: 10, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});

export default BottomDrawer;
