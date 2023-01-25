import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useRef, useCallback, useLayoutEffect, useEffect} from 'react';
import {BottomSheet, BottomSheetRef} from 'react-spring-bottom-sheet';
import './ActionSheetStyles.css';
import ActionSheetContent from './ActionSheetContent';
import {SpringEvent} from 'react-spring-bottom-sheet/dist/types';
import Chat from '../../components/Chat';
import ParticipantView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';

import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useSidePanel} from '../../utils/useSidePanel';

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const chatSheetRef = useRef<BottomSheetRef>(null);
  const participantsSheetRef = useRef<BottomSheetRef>(null);
  const settingsSheetRef = useRef<BottomSheetRef>(null);

  const {sidePanel, setSidePanel} = useSidePanel();
  const [showOverlay, setShowOverlay] = React.useState(false);
  const handleSheetChanges = useCallback((index: number) => {
    bottomSheetRef.current?.snapTo(({snapPoints}) => snapPoints[index]);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  const root = document.documentElement;

  useEffect(() => {
    root.style.setProperty('--sheet-background', $config.CARD_LAYER_1_COLOR);
    root.style.setProperty('--handle-background', $config.SEMANTIC_NETRUAL);
  }, []);

  // updating on sidepanel changes
  useEffect(() => {
    switch (sidePanel) {
      case SidePanelType.Participants: {
        setIsParticipantsOpen(true);
        break;
      }
      case SidePanelType.Chat: {
        setIsChatOpen(true);
        break;
      }
      case SidePanelType.Settings: {
        setIsSettingsOpen(true);
        break;
      }
      case SidePanelType.None: {
        setIsChatOpen(false);
        setIsParticipantsOpen(false);
        setIsSettingsOpen(false);
        handleSheetChanges(0);
      }
      default:
    }
  }, [sidePanel]);

  function onDismiss() {
    setSidePanel(SidePanelType.None);
  }

  const handleSpringStart = (event: SpringEvent) => {
    if (event.type == 'SNAP') {
      setShowOverlay(true); // as soon drag start show overlay
    }
  };
  const handleSpringEnd = (event: SpringEvent) => {
    if (event.type == 'SNAP') {
      const isMinmized = bottomSheetRef.current.height === 100;
      isMinmized && setShowOverlay(false);
      if (event.source === 'dragging') {
        if (isMinmized) {
          setIsExpanded(false);
        } else {
          setIsExpanded(true);
        }
      }
    }
  };

  const updateActionSheet = (
    screenName: 'chat' | 'participants' | 'settings',
  ) => {
    switch (screenName) {
      case 'chat':
        setIsChatOpen(true);
        break;
      case 'participants':
        setIsParticipantsOpen(true);
        break;
      case 'settings':
        console.warn('settings selected');
        setIsSettingsOpen(true);
        break;
      default:
    }
  };
  return (
    <>
      {showOverlay && (
        <TouchableWithoutFeedback
          onPress={() => {
            handleSheetChanges(0);
            debugger;
          }}>
          <View style={[styles.backDrop]} />
        </TouchableWithoutFeedback>
      )}
      <View>
        {/* Controls Action Sheet */}

        <BottomSheet
          ref={bottomSheetRef}
          open={true}
          onSpringStart={handleSpringStart}
          onSpringEnd={handleSpringEnd}
          // skipInitialTransition={true}
          expandOnContentDrag={true}
          snapPoints={({maxHeight}) => [100, 350]}
          defaultSnap={({lastSnap, snapPoints}) =>
            lastSnap ?? Math.min(...snapPoints)
          }
          blocking={false}>
          <ActionSheetContent
            handleSheetChanges={handleSheetChanges}
            isExpanded={isExpanded}
          />
        </BottomSheet>
        {/* Chat  Action Sheet */}
        <BottomSheet
          ref={chatSheetRef}
          onDismiss={onDismiss}
          open={isChatOpen}
          blocking={false}
          expandOnContentDrag={false}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}>
          <Chat />
        </BottomSheet>
        {/* Participants Action Sheet */}
        <BottomSheet
          ref={participantsSheetRef}
          onDismiss={onDismiss}
          open={isParticipantsOpen}
          expandOnContentDrag={false}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}
          blocking={false}>
          <ParticipantView />
        </BottomSheet>
        {/* Settings  Action Sheet */}
        <BottomSheet
          ref={settingsSheetRef}
          onDismiss={onDismiss}
          open={isSettingsOpen}
          expandOnContentDrag={false}
          snapPoints={({maxHeight}) => [1 * maxHeight]}
          defaultSnap={({lastSnap, snapPoints}) => snapPoints[0]}
          blocking={false}>
          <SettingsView />
        </BottomSheet>
      </View>
    </>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'red',
  },
  content: {
    borderWidth: 1,
    borderColor: 'yellow',
    flex: 1,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    opacity: 0.5,
  },
});
