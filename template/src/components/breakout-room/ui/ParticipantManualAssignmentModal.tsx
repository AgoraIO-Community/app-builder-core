import React, {SetStateAction, Dispatch, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import GenericModal from '../../common/GenericModal';
import {TableBody, TableHeader} from '../../common/data-table';
import Loading from '../../../subComponents/Loading';
import ThemeConfig from '../../../theme';
import ImageIcon from '../../../atoms/ImageIcon';
import Checkbox from '../../../atoms/Checkbox';
import Dropdown from '../../../atoms/Dropdown';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {
  ManualParticipantAssignment,
  RoomAssignmentStrategy,
} from '../state/reducer';

function EmptyParticipantsState() {
  return (
    <View style={style.infotextContainer}>
      <View>
        <ImageIcon
          iconType="plain"
          name="info"
          tintColor={'#777777'}
          iconSize={32}
        />
      </View>
      <View>
        <Text style={[style.infoText]}>
          No text-tracks found for this meeting
        </Text>
      </View>
    </View>
  );
}

function ParticipantRow({
  participant,
  assignment,
  rooms,
  onAssignmentChange,
  onSelectionChange,
}: {
  participant: {uid: UidType; user: ContentInterface};
  assignment: ManualParticipantAssignment;
  rooms: {label: string; value: string}[];
  onAssignmentChange: (uid: UidType, roomId: string | null) => void;
  onSelectionChange: (uid: UidType) => void;
}) {
  const selectedValue = assignment?.roomId || 'unassigned';

  return (
    <View style={style.tbrow} key={participant.uid}>
      <View style={[style.td]}>
        <Checkbox
          disabled={false}
          checked={assignment?.isSelected || false}
          onChange={() => onSelectionChange(participant.uid)}
          label={participant.user.name}
        />
      </View>
      <View style={[style.td]}>
        <Dropdown
          enabled={true}
          label={selectedValue}
          data={rooms}
          onSelect={({_, value}) => {
            onAssignmentChange(
              participant.uid,
              value === 'unassigned' ? null : value,
            );
          }}
          selectedValue={selectedValue}
        />
      </View>
    </View>
  );
}

interface ParticipantManualAssignmentModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ParticipantManualAssignmentModal(
  props: ParticipantManualAssignmentModalProps,
) {
  const {setModalOpen} = props;
  const {
    getAllRooms,
    unassignedParticipants,
    manualAssignments,
    setManualAssignments,
    handleAssignParticipants,
  } = useBreakoutRoom();

  // Local state for assignments
  const [localAssignments, setLocalAssignments] = useState<
    ManualParticipantAssignment[]
  >(() => {
    if (manualAssignments.length > 0) {
      // Restore previous manual assignments
      return manualAssignments;
    }

    // Create new manual assignments for unassigned participants
    return unassignedParticipants.map(participant => ({
      uid: participant.uid,
      roomId: null, // Start unassigned
      isHost: participant.user?.isHost || false,
      isSelected: false,
    }));
  });
  // Rooms dropdown options
  const rooms = [
    {label: 'Unassigned', value: 'unassigned'},
    ...getAllRooms().map(item => ({label: item.name, value: item.id})),
  ];

  // Update room assignment
  const updateManualAssignment = (uid: UidType, roomId: string | null) => {
    const selectedParticipants = localAssignments.filter(a => a.isSelected);
    const clickedParticipant = localAssignments.find(a => a.uid === uid);

    if (selectedParticipants.length > 1 && clickedParticipant?.isSelected) {
      // BULK BEHAVIOR: If multiple selected and clicked one is selected,
      // assign ALL selected participants to the same room
      setLocalAssignments(prev =>
        prev.map(assignment =>
          assignment.isSelected
            ? {
                ...assignment,
                roomId: roomId === 'unassigned' ? null : roomId,
                isSelected: false, // Deselect after assignment
              }
            : assignment,
        ),
      );
    } else {
      // INDIVIDUAL BEHAVIOR: Normal single assignment
      setLocalAssignments(prev =>
        prev.map(assignment =>
          assignment.uid === uid
            ? {
                ...assignment,
                roomId: roomId === 'unassigned' ? null : roomId,
                isSelected: false, // Deselect this one too
              }
            : assignment,
        ),
      );
    }
  };
  const handleRoomDropdownChange = (uid: UidType, roomId: string | null) => {
    const clickedParticipant = localAssignments.find(a => a.uid === uid);
    if (!clickedParticipant?.isSelected) {
      // User clicked dropdown of non-selected participant
      // Deselect everyone first, then assign
      setLocalAssignments(prev =>
        prev.map(assignment => ({
          ...assignment,
          isSelected: false, // Deselect all
          roomId:
            assignment.uid === uid
              ? roomId === 'unassigned'
                ? null
                : roomId
              : assignment.roomId,
        })),
      );
    } else {
      // Use the bulk/individual logic
      updateManualAssignment(uid, roomId);
    }
  };
  // Toggle selection for specific participant
  const toggleParticipantSelection = (uid: UidType) => {
    setLocalAssignments(prev =>
      prev.map(assignment =>
        assignment.uid === uid
          ? {...assignment, isSelected: !assignment.isSelected}
          : assignment,
      ),
    );
  };

  const allSelected =
    localAssignments.length > 0 && localAssignments.every(a => a.isSelected);

  // Select/deselect all
  const toggleSelectAll = () => {
    const areAllSelected = localAssignments.every(a => a.isSelected);
    setLocalAssignments(prev =>
      prev.map(assignment => ({
        ...assignment,
        isSelected: !areAllSelected,
      })),
    );
  };

  // More descriptive Select All label
  const getSelectAllLabel = () => {
    if (selectedCount === 0) {
      return 'Select All';
    } else if (allSelected) {
      return 'Deselect All';
    } else {
      return `Select All (${selectedCount}/${localAssignments.length})`;
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  const handleSaveManualAssignments = () => {
    setManualAssignments(localAssignments);
    // Trigger the actual assignment after saving
    handleAssignParticipants(RoomAssignmentStrategy.MANUAL_ASSIGN);
    setModalOpen(false);
  };

  const selectedCount = localAssignments.filter(a => a.isSelected).length;

  return (
    <GenericModal
      visible={true}
      onRequestClose={() => setModalOpen(false)}
      showCloseIcon={true}
      title="Assign Participants"
      cancelable={false}
      contentContainerStyle={style.contentContainer}>
      <View style={style.fullBody}>
        <View style={style.mbody}>
          <View
            style={[
              style.titleContainer,
              unassignedParticipants?.length > 0 ? {} : style.titleLowOpacity,
            ]}>
            <View>
              <ImageIcon
                iconType="plain"
                name="people"
                tintColor={$config.FONT_COLOR}
                iconSize={20}
              />
            </View>
            <Text style={style.title}>{localAssignments.length}</Text>
            <Text style={[style.title, style.titleLowOpacity]}>
              ({localAssignments.filter(a => !a.roomId).length} Unassigned)
            </Text>
          </View>
          <View style={style.participantTableControls}>
            <View>
              <Checkbox
                disabled={localAssignments.length === 0}
                checked={allSelected}
                onChange={() => toggleSelectAll()}
                label={getSelectAllLabel()}
              />
            </View>
            <View>
              {selectedCount > 0 && (
                <Text style={style.infoText}>
                  {selectedCount} of {localAssignments.length} participants
                  selected
                </Text>
              )}
            </View>
          </View>
          <View style={style.participantTable}>
            <TableHeader
              columns={['Name', 'Room']}
              containerStyle={style.tHeadRow}
            />
            <TableBody
              status="resolved"
              items={unassignedParticipants}
              loadingComponent={
                <Loading
                  background="transparent"
                  text="Fetching participants"
                />
              }
              bodyStyle={style.tbodyContainer}
              renderRow={participant => {
                const assignment = localAssignments.find(
                  a => a.uid === participant.uid,
                );
                return (
                  <ParticipantRow
                    key={participant.uid}
                    participant={participant}
                    assignment={assignment}
                    rooms={rooms}
                    onAssignmentChange={handleRoomDropdownChange}
                    onSelectionChange={toggleParticipantSelection}
                  />
                );
              }}
              emptyComponent={<EmptyParticipantsState />}
            />
          </View>
        </View>
        <View style={style.mfooter}>
          <View>
            <TertiaryButton
              containerStyle={style.cancelBtn}
              textStyle={style.actionBtnText}
              text={'Cancel'}
              onPress={() => {
                handleCancel();
              }}
            />
          </View>
          <View>
            <TertiaryButton
              containerStyle={style.saveBtn}
              textStyle={style.actionBtnText}
              text={'Save'}
              onPress={() => {
                handleSaveManualAssignments();
              }}
            />
          </View>
        </View>
      </View>
    </GenericModal>
  );
}

const style = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    width: '100%',
  },
  fullBody: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  mbody: {
    flex: 1,
    padding: 12,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
    borderTopWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
    borderBottomWidth: 1,
  },
  mfooter: {
    padding: 12,
    gap: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  titleLowOpacity: {
    opacity: 0.2,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '500',
  },
  infotextContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  participantTableControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 12,
  },
  participantTable: {
    flex: 1,
    backgroundColor: $config.BACKGROUND_COLOR,
  },
  tHeadRow: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  tbodyContainer: {
    backgroundColor: $config.BACKGROUND_COLOR,
    borderRadius: 2,
  },
  tbrow: {
    display: 'flex',
    alignSelf: 'stretch',
    minHeight: 48,
    flexDirection: 'row',
    paddingVertical: 8,
  },
  td: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionBtnText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
  },
  cancelBtn: {
    borderRadius: 4,
    minWidth: 140,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    backgroundColor: 'transparent',
  },
  saveBtn: {
    borderRadius: 4,
    minWidth: 140,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
});
