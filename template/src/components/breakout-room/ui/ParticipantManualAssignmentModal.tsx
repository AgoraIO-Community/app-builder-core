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
import {ManualParticipantAssignment} from '../state/reducer';

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
  assignment: ParticipantAssignment;
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

interface ParticipantAssignment {
  uid: UidType;
  roomId: string | null; // null = unassigned
  isSelected: boolean;
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
    unsassignedParticipants,
    manualAssignments,
    setManualAssignments,
    applyManualAssignments,
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
    return unsassignedParticipants.map(participant => ({
      uid: participant.uid,
      roomId: null, // Start unassigned
      isHost: participant.user.isHost || false,
      isSelected: false,
    }));
  });

  // Rooms dropdown options
  const rooms = [
    {label: 'Unassigned', value: 'unassigned'},
    ...getAllRooms().map(item => ({label: item.name, value: item.id})),
  ];

  // Update room assignment for specific participant
  const updateManualAssignment = (uid: UidType, roomId: string | null) => {
    setLocalAssignments(prev =>
      prev.map(assignment =>
        assignment.uid === uid
          ? {...assignment, roomId: roomId === 'unassigned' ? null : roomId}
          : assignment,
      ),
    );
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

  // Select/deselect all
  const toggleSelectAll = () => {
    const allSelected = localAssignments.every(a => a.isSelected);
    setLocalAssignments(prev =>
      prev.map(assignment => ({
        ...assignment,
        isSelected: !allSelected,
      })),
    );
  };

  // Bulk assign selected participants to a room
  const bulkAssignSelected = (roomId: string | null) => {
    setLocalAssignments(prev =>
      prev.map(assignment =>
        assignment.isSelected
          ? {...assignment, roomId: roomId === 'unassigned' ? null : roomId}
          : assignment,
      ),
    );
  };

  const handleCancel = () => {
    setModalOpen(false);
  };
  const handleSaveManualAssignments = () => {
    // Save to reducer

    setManualAssignments(localAssignments);
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
              unsassignedParticipants?.length > 0 ? {} : style.titleLowOpacity,
            ]}>
            <View>
              <ImageIcon
                iconType="plain"
                name="people"
                tintColor={$config.FONT_COLOR}
                iconSize={20}
              />
            </View>
            <Text style={style.title}>
              {localAssignments.length}(
              {localAssignments.filter(a => !a.roomId).length} Unassigned)
            </Text>
          </View>
          <View style={style.participantTable}>
            <TableHeader columns={['Name', 'Room']} />
            <TableBody
              status="resolved"
              items={unsassignedParticipants}
              loadingComponent={
                <Loading
                  background="transparent"
                  text="Fetching participants"
                />
              }
              bodyStyle={{
                backgroundColor: $config.BACKGROUND_COLOR,
              }}
              renderRow={participant => {
                const assignment = localAssignments.find(
                  a => a.uid === participant.uid,
                );
                return (
                  <ParticipantRow
                    key={participant.uid}
                    participant={participant}
                    assignment={localAssignments}
                    rooms={rooms}
                    onAssignmentChange={updateManualAssignment}
                    onSelectionChange={toggleSelection}
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
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  participantTable: {
    flex: 1,
    backgroundColor: $config.BACKGROUND_COLOR,
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
