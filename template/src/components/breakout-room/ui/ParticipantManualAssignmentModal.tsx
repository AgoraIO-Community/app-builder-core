import React, {SetStateAction, Dispatch, useState} from 'react';
import {View, StyleSheet, Text, ScrollView, TextInput} from 'react-native';
import GenericModal from '../../common/GenericModal';
import ThemeConfig from '../../../theme';
import ImageIcon from '../../../atoms/ImageIcon';
import Checkbox from '../../../atoms/Checkbox';
import Dropdown from '../../../atoms/Dropdown';
import UserAvatar from '../../../atoms/UserAvatar';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {UidType, useLocalUid} from '../../../../agora-rn-uikit';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {
  ManualParticipantAssignment,
  RoomAssignmentStrategy,
  BreakoutRoomUser,
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
        <Text style={[style.infoText]}>No participants found</Text>
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
  localUid,
}: {
  participant: {uid: UidType; user: BreakoutRoomUser};
  assignment: ManualParticipantAssignment;
  rooms: {label: string; value: string}[];
  onAssignmentChange: (uid: UidType, roomId: string | null) => void;
  onSelectionChange: (uid: UidType) => void;
  localUid: UidType;
}) {
  const selectedValue = assignment?.roomId || 'unassigned';
  const displayName =
    participant.uid === localUid
      ? `${participant.user.name} (me)`
      : participant.user.name;

  return (
    <View style={style.participantBodyRow} key={participant.uid}>
      <View style={[style.participantBodytRowCell, style.checkboxCell]}>
        <Checkbox
          disabled={false}
          checked={assignment?.isSelected || false}
          onChange={() => onSelectionChange(participant.uid)}
          label={''}
          checkBoxStyle={style.checkboxIcon}
        />
      </View>
      <View style={style.participantBodytRowCell}>
        <View style={style.participantInfo}>
          <UserAvatar
            name={displayName}
            containerStyle={style.participantAvatar}
            textStyle={style.participantAvatarText}
          />
          <Text style={style.participantName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>
      <View style={style.participantBodytRowCell}>
        <View style={style.participantDropdown}>
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
            containerStyle={style.dropdownContainer}
            selectedValue={selectedValue}
          />
        </View>
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
  const localUid = useLocalUid();
  const {
    getAllRooms,
    unassignedParticipants,
    manualAssignments,
    setManualAssignments,
    handleAssignParticipants,
  } = useBreakoutRoom();

  // Local state for assignments
  const [searchQuery, setSearchQuery] = useState('');
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
      isHost: participant.user.isHost,
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
  const unassignedCount = localAssignments.filter(a => !a.roomId).length;

  // Filter participants based on search query
  const filteredParticipants = unassignedParticipants.filter(participant => {
    const displayName =
      participant.uid === localUid
        ? `${participant.user.name} (me)`
        : participant.user.name;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
          {/* Search Bar */}
          <View style={style.searchContainer}>
            <TextInput
              style={style.searchInput}
              placeholder="Search participants..."
              placeholderTextColor={$config.FONT_COLOR + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={style.searchIcon}>
              <ImageIcon
                iconType="plain"
                name="search"
                tintColor={$config.FONT_COLOR + '80'}
                iconSize={16}
              />
            </View>
          </View>

          {/* Participant Count */}
          <View style={style.participantSummaryContainer}>
            <View style={style.participantCountContainer}>
              <ImageIcon
                iconType="plain"
                name="people"
                tintColor={$config.FONT_COLOR}
                iconSize={16}
              />
              <View style={style.participantCountTextContainer}>
                <Text style={style.participantCount}>
                  {localAssignments.length}
                </Text>
                <Text
                  style={[
                    style.participantCount,
                    style.participantCountLowOpacity,
                  ]}>
                  ({unassignedCount} Unassigned)
                </Text>
              </View>
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

          {/* Select All Controls */}
          <View style={style.participantTable}>
            <View style={style.participantTableHeader}>
              <View style={style.participantTableHeaderRow}>
                <View
                  style={[
                    style.participantTableHeaderRowCell,
                    style.checkboxCell,
                  ]}>
                  <Checkbox
                    disabled={localAssignments.length === 0}
                    checked={allSelected}
                    onChange={() => toggleSelectAll()}
                    label={''}
                    checkBoxStyle={style.checkboxIcon}
                    // label={getSelectAllLabel()}
                  />
                </View>
                <View style={style.participantTableHeaderRowCell}>
                  <Text style={style.participantTableHeaderRowCellText}>
                    Name
                  </Text>
                </View>
                <View style={style.participantTableHeaderRowCell}>
                  <Text style={style.participantTableHeaderRowCellText}>
                    Room
                  </Text>
                </View>
              </View>
            </View>
            {/* Participants List */}
            <View style={style.participantsList}>
              {filteredParticipants.length === 0 ? (
                <EmptyParticipantsState />
              ) : (
                <ScrollView style={style.participantsScrollView}>
                  {filteredParticipants.map(participant => {
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
                        localUid={localUid}
                      />
                    );
                  })}
                </ScrollView>
              )}
            </View>
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
    padding: 20,
    gap: 16,
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
  // Search Container
  searchContainer: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    top: 12,
  },
  searchInput: {
    height: 36,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingLeft: 30,
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
  },

  // Participant Count
  participantSummaryContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantCountContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  participantCountTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '500',
    lineHeight: 16,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
  },
  participantCountLowOpacity: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  dropdownContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 4,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  checkboxIconContainer: {
    paddingRight: 24,
  },
  checkboxIcon: {
    borderColor: $config.SECONDARY_ACTION_COLOR,
    borderRadius: 2,
    width: 17,
    height: 17,
  },
  participantTable: {
    flex: 1,
  },
  participantTableHeader: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    flexDirection: 'row',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingHorizontal: 8,
    height: 40,
  },
  participantTableHeaderRow: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  participantTableHeaderRowCell: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  participantTableHeaderRowCellText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
  },
  // Participants List
  participantsList: {
    flex: 1,
    padding: 8,
    paddingBottom: 0,
    backgroundColor: $config.BACKGROUND_COLOR,
  },
  participantsScrollView: {
    flex: 1,
  },
  // Participant Row
  participantRow: {
    // display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: $config.CARD_LAYER_3_COLOR + '40',
    // minHeight: 60,
  },
  participantBodyRow: {
    display: 'flex',
    alignSelf: 'stretch',
    // minHeight: 50,
    flexDirection: 'row',
    paddingBottom: 8,
    // paddingTop: 20,
  },
  participantBodytRowCell: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  checkboxCell: {
    maxWidth: 50,
  },
  participantInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  participantAvatarText: {
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '600',
    color: $config.BACKGROUND_COLOR,
  },
  participantName: {
    flex: 1,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
  },
  participantDropdown: {
    minWidth: 120,
  },
  // Empty State
  infotextContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  infoText: {
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '500',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    textAlign: 'center',
  },
  // Buttons
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
