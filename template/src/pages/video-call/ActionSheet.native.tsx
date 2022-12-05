import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useRef} from 'react';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import Chat from '../../components/Chat';
import ParticipantView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import ActionSheetContent from './ActionSheetContent';

//topbar btn template is used to show icons without label text (as in desktop : bottomBar)

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const chatSheetRef = useRef<BottomSheetModal>(null);
  const participantsSheetRef = useRef<BottomSheetModal>(null);
  const settingsSheetRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    bottomSheetRef.current?.snapToIndex(index);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  function onChatDismiss() {
    chatSheetRef?.current.close();
  }
  function onParticipantsDismiss() {
    participantsSheetRef?.current.close();
  }
  function onSettingsDismiss() {
    settingsSheetRef?.current.close();
  }

  const updateActionSheet = (
    screenName: 'chat' | 'participants' | 'settings',
  ) => {
    switch (screenName) {
      case 'chat':
        chatSheetRef?.current.present();
        break;
      case 'participants':
        participantsSheetRef?.current.present();
        break;
      case 'settings':
        settingsSheetRef?.current.present();
        break;
      default:
        bottomSheetRef?.current.present();
    }
  };
  React.useEffect(() => {
    bottomSheetRef?.current.present();
    //bottomSheetRef.current?.snapToIndex(1);
  }, []);

  return (
    <BottomSheetModalProvider>
      {/* Controls */}
      <BottomSheetModal
        snapPoints={['15%', '50%']}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        stackBehavior="push"
        handleIndicatorStyle={styles.handleIndicatorStyle}>
        <BottomSheetView>
          <ActionSheetContent
            updateActionSheet={updateActionSheet}
            handleSheetChanges={handleSheetChanges}
            isExpanded={isExpanded}
          />
        </BottomSheetView>
      </BottomSheetModal>
      {/* Chat  */}
      <BottomSheetModal
        snapPoints={['100%']}
        name="ChatSheet"
        ref={chatSheetRef}
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <Chat handleClose={onChatDismiss} />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Participants  */}
      <BottomSheetModal
        snapPoints={['100%']}
        ref={participantsSheetRef}
        name="ParticipantsSheet"
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <ParticipantView handleClose={onParticipantsDismiss} />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Settings  */}
      <BottomSheetModal
        snapPoints={['100%']}
        ref={settingsSheetRef}
        name="SettingsSheet"
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <SettingsView handleClose={onSettingsDismiss} />
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: '#EDF0F1',
    flexWrap: 'wrap',
  },
  iconContainer: {
    backgroundColor: '#F0F4F6', //TODO : adjust color as theme
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
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },

  handleIndicatorStyle: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    width: 40,
    height: 4,
  },
});
