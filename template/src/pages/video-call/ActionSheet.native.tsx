import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useRef} from 'react';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import BottomDrawer from '../../atoms/BottomDrawer';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalEndcall, {
  LocalEndcallProps,
} from '../../subComponents/LocalEndCall';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';

//topbar btn template is used to show icons without label text (as in desktop : bottomBar)

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    bottomSheetRef.current?.snapToIndex(index);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  return (
    <BottomSheet
      snapPoints={['15%', '50%']}
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      style={styles.container}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}>
      <BottomSheetView>
        <View style={[styles.row, {borderBottomWidth: 1}]}>
          <View style={styles.iconContainer}>
            <View style={{width: 25, height: 25}}>
              <LocalVideoMute buttonTemplateName={ButtonTemplateName.topBar} />
            </View>
          </View>
          <View style={[styles.iconContainer]}>
            <View style={{width: 25, height: 25}}>
              <LocalAudioMute buttonTemplateName={ButtonTemplateName.topBar} />
            </View>
          </View>
          <View style={[styles.iconContainer, {backgroundColor: '#FF414D'}]}>
            <LocalEndcall buttonTemplateName={ButtonTemplateName.topBar} />
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}>
              <Text>{isExpanded ? 'Less' : 'More'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          {/* chat */}
          <View style={styles.iconContainer}></View>
          {/* participants */}
          <View style={styles.iconContainer}></View>
          {/* record */}
          <View style={styles.iconContainer}></View>
          {/* switch camera */}
          <View style={styles.iconContainer}></View>
        </View>
        <View style={styles.row}>
          {/* List view */}
          <View style={styles.iconContainer}></View>
          {/* settings */}
          <View style={styles.iconContainer}></View>
          {/* invite */}
          <View style={styles.iconContainer}></View>

          <View style={styles.emptyContainer}></View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: '#EDF0F1',
    flexWrap: 'wrap',
  },
  iconContainer: {
    backgroundColor: '#F0F4F6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: 50,
    height: 50,
  },
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
