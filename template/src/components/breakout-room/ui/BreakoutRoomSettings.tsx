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
    assignParticipants,
    canUserSwitchRoom,
    toggleSwitchRooms,
  } = useBreakoutRoom();

  const disableAssignment = unsassignedParticipants.length === 0;

  const {
    modalOpen: isManualAssignmentModalOpen,
    setModalOpen: setManualAssignmentModalOpen,
  } = useModal();

  useEffect(() => {
    if (assignmentStrategy === RoomAssignmentStrategy.MANUAL_ASSIGN) {
      setManualAssignmentModalOpen(true);
    } else {
      setManualAssignmentModalOpen(false);
    }
  }, [assignmentStrategy, setManualAssignmentModalOpen]);

  const handleAssignParticipants = () => {
    if (assignmentStrategy === RoomAssignmentStrategy.MANUAL_ASSIGN) {
    } else if (assignmentStrategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
      // Direct auto assignment (no modal needed)
      assignParticipants();
    }
    // NO_ASSIGN strategy - button might be disabled
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
          onStrategyChange={setStrategy}
          assignParticipants={assignParticipants}
          disabled={disableAssignment}
        />
        <TertiaryButton
          disabled={disableAssignment}
          containerStyle={{
            backgroundColor: disableAssignment
              ? $config.SEMANTIC_NEUTRAL
              : $config.PRIMARY_ACTION_BRAND_COLOR,
            borderColor: disableAssignment
              ? $config.SEMANTIC_NEUTRAL
              : $config.PRIMARY_ACTION_BRAND_COLOR,
          }}
          onPress={() => {
            handleAssignParticipants();
          }}
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
