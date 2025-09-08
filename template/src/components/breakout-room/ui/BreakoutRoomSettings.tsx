import React, {useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import BreakoutRoomParticipants from './BreakoutRoomParticipants';
import SelectParticipantAssignmentStrategy from './SelectParticipantAssignmentStrategy';
import Divider from '../../common/Dividers';
import ThemeConfig from '../../../theme';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import Toggle from '../../../atoms/Toggle';
import ParticipantManualAssignmentModal from './ParticipantManualAssignmentModal';
import {useModal} from '../../../utils/useModal';
import {RoomAssignmentStrategy} from '../state/reducer';
import TertiaryButton from '../../../atoms/TertiaryButton';

export default function BreakoutRoomSettings() {
  const {
    unsassignedParticipants,
    assignmentStrategy,
    setStrategy,
    handleAssignParticipants,
    canUserSwitchRoom,
    toggleSwitchRooms,
  } = useBreakoutRoom();

  const disableAssignmentSelect = unsassignedParticipants.length === 0;
  const disableHandleAssignment =
    disableAssignmentSelect ||
    assignmentStrategy === RoomAssignmentStrategy.NO_ASSIGN;

  const {
    modalOpen: isManualAssignmentModalOpen,
    setModalOpen: setManualAssignmentModalOpen,
  } = useModal();

  // Handle assign participants button click
  const handleAssignClick = () => {
    if (assignmentStrategy === RoomAssignmentStrategy.MANUAL_ASSIGN) {
      // Open manual assignment modal
      setManualAssignmentModalOpen(true);
    } else {
      // Handle other assignment strategies
      handleAssignParticipants(assignmentStrategy);
    }
  };

  // Handle strategy change - automatically trigger assignment for NO_ASSIGN
  const handleStrategyChange = (strategy: RoomAssignmentStrategy) => {
    setStrategy(strategy);
    // NO_ASSIGN needs to be applied immediately to enable switch rooms
    if (strategy === RoomAssignmentStrategy.NO_ASSIGN) {
      handleAssignParticipants(strategy);
    }
  };

  return (
    <View style={style.card}>
      {/* Avatar list  */}
      <View style={style.section}>
        <BreakoutRoomParticipants participants={unsassignedParticipants} />
      </View>
      <Divider />
      <View style={style.section}>
        <SelectParticipantAssignmentStrategy
          selectedStrategy={assignmentStrategy}
          onStrategyChange={handleStrategyChange}
          disabled={disableAssignmentSelect}
        />
        <TertiaryButton
          disabled={disableHandleAssignment}
          containerStyle={{
            backgroundColor: disableHandleAssignment
              ? $config.SEMANTIC_NEUTRAL
              : $config.PRIMARY_ACTION_BRAND_COLOR,
            borderColor: disableHandleAssignment
              ? $config.SEMANTIC_NEUTRAL
              : $config.PRIMARY_ACTION_BRAND_COLOR,
          }}
          onPress={handleAssignClick}
          text={'Assign participants'}
        />
      </View>
      <Divider />
      <View style={style.section}>
        <View style={style.switchSection}>
          <Text style={style.label}>Allow people to switch rooms</Text>
          <Toggle
            disabled={$config.EVENT_MODE}
            isEnabled={canUserSwitchRoom}
            toggleSwitch={toggleSwitchRooms}
            circleColor={$config.FONT_COLOR}
          />
        </View>
      </View>
      {isManualAssignmentModalOpen && (
        <ParticipantManualAssignmentModal
          setModalOpen={setManualAssignmentModalOpen}
        />
      )}
    </View>
  );
}

const style = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    gap: 12,
  },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  switchSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
