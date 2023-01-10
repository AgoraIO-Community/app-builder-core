import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
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
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useSidePanel} from '../../utils/useSidePanel';

//topbar btn template is used to show icons without label text (as in desktop : bottomBar)

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const {sidePanel} = useSidePanel();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const chatSheetRef = useRef<BottomSheetModal>(null);
  const participantsSheetRef = useRef<BottomSheetModal>(null);
  const settingsSheetRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapToIndex(index);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  React.useEffect(() => {
    bottomSheetRef?.current.present();
  }, []);

  // updating on sidepanel changes
  React.useEffect(() => {
    switch (sidePanel) {
      case SidePanelType.Participants: {
        participantsSheetRef?.current.present();
        break;
      }
      case SidePanelType.Chat: {
        chatSheetRef?.current.present();
        break;
      }
      case SidePanelType.Settings: {
        settingsSheetRef?.current.present();
        break;
      }
      case SidePanelType.None: {
        chatSheetRef?.current.close();
        participantsSheetRef?.current.close();
        settingsSheetRef?.current.close();
        handleSheetChanges(0);
      }
      default:
        bottomSheetRef?.current.present();
    }
  }, [sidePanel]);

  function onDismiss() {
    handleSheetChanges(0);
  }

  return (
    <BottomSheetModalProvider>
      {isExpanded && (
        <TouchableWithoutFeedback onPress={() => handleSheetChanges(0)}>
          <View style={[styles.backDrop]} />
        </TouchableWithoutFeedback>
      )}
      {/* Controls  Action Sheet*/}
      <BottomSheetModal
        snapPoints={['15%', '50%']}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        stackBehavior="push"
        handleIndicatorStyle={styles.handleIndicatorStyle}>
        <BottomSheetView>
          <ActionSheetContent
            handleSheetChanges={handleSheetChanges}
            isExpanded={isExpanded}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Chat Action Sheet */}
      <BottomSheetModal
        snapPoints={['100%']}
        name="ChatSheet"
        onDismiss={onDismiss}
        ref={chatSheetRef}
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <Chat />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Participants Action Sheet */}
      <BottomSheetModal
        snapPoints={['100%']}
        ref={participantsSheetRef}
        onDismiss={onDismiss}
        name="ParticipantsSheet"
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <ParticipantView />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Settings Action Sheet  */}
      <BottomSheetModal
        snapPoints={['100%']}
        ref={settingsSheetRef}
        name="SettingsSheet"
        onDismiss={onDismiss}
        style={styles.container}
        backgroundStyle={styles.backgroundStyle}
        handleIndicatorStyle={styles.handleIndicatorStyle}
        stackBehavior="push">
        <BottomSheetView>
          <SettingsView />
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
    backgroundColor: $config.SEMANTIC_NETRUAL,
    width: 40,
    height: 4,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    opacity: 0.2,
  },
});
