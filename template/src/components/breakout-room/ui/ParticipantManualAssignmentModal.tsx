import React, {SetStateAction, Dispatch, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import GenericModal from '../../common/GenericModal';
import {TableBody, TableHeader} from '../../common/data-table';
import Loading from '../../../subComponents/Loading';
import ThemeConfig from '../../../theme';
import ImageIcon from '../../../atoms/ImageIcon';
import {style as tableStyles} from '../../common/data-table';
import Checkbox from '../../../atoms/Checkbox';
import Dropdown from '../../../atoms/Dropdown';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {ContentInterface, UidType} from '../../../../agora-rn-uikit';
import TertiaryButton from '../../../atoms/TertiaryButton';

function EmptyParticipantsState() {
  return (
    <View style={tableStyles.infotextContainer}>
      <View>
        <ImageIcon
          iconType="plain"
          name="info"
          tintColor={'#777777'}
          iconSize={32}
        />
      </View>
      <View>
        <Text style={[tableStyles.infoText]}>
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
    <View style={tableStyles.tbrow} key={participant.uid}>
      <View style={[tableStyles.td, tableStyles.plzero]}>
        <Checkbox
          disabled={false}
          checked={assignment?.isSelected || false}
          onChange={() => onSelectionChange(participant.uid)}
          label={participant.user.name}
        />
      </View>
      <View style={[tableStyles.tactions]}>
        <View>
          <Dropdown
            enabled={true}
            label={selectedValue}
            data={rooms}
            onSelect={({label, value}) => {
              console.log('lable value');
              onAssignmentChange(
                participant.uid,
                value === 'unassigned' ? null : value,
              );
            }}
            selectedValue={selectedValue}
          />
        </View>
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
  const {getAllRooms, unsassignedParticipants} = useBreakoutRoom();

  // Local state for assignments
  const [assignments, setAssignments] = useState<ParticipantAssignment[]>(() =>
    unsassignedParticipants.map(participant => ({
      uid: participant.uid,
      roomId: null, // Start unassigned
      isSelected: false,
    })),
  );

  // Rooms dropdown options
  const rooms = [
    {label: 'Unassigned', value: 'unassigned'},
    ...getAllRooms().map(item => ({label: item.name, value: item.id})),
  ];

  // Update assignment for specific participant
  const updateAssignment = (uid: UidType, roomId: string | null) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.uid === uid
          ? {...assignment, roomId: roomId === 'unassigned' ? null : roomId}
          : assignment,
      ),
    );
  };

  // Toggle selection for specific participant
  const toggleSelection = (uid: UidType) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.uid === uid
          ? {...assignment, isSelected: !assignment.isSelected}
          : assignment,
      ),
    );
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    const allSelected = assignments.every(a => a.isSelected);
    setAssignments(prev =>
      prev.map(assignment => ({
        ...assignment,
        isSelected: !allSelected,
      })),
    );
  };

  // Save assignments
  const handleSave = () => {
    // assignments.forEach(assignment => {
    //   const participant = unsassignedParticipants.find(
    //     p => p.uid === assignment.uid,
    //   );
    //   // If roomId is null, user stays in main room (no action needed)
    // });
    // setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
    // State is automatically discarded when component unmounts
  };

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
          <View>
            <Text>
              {assignments.length} ({assignments.filter(a => !a.roomId).length}{' '}
              Unassigned)
            </Text>
          </View>
          <TableHeader
            columns={['', 'Name', 'Room']}
            //   onHeaderPress={index => {
            //     if (index === 0) {
            //       toggleSelectAll();
            //     }
            //   }}
          />
          <TableBody
            status="pending"
            items={unsassignedParticipants}
            loadingComponent={
              <Loading background="transparent" text="Fetching participants" />
            }
            renderRow={participant => {
              const assignment = assignments.find(
                a => a.uid === participant.uid,
              );
              return (
                <ParticipantRow
                  key={participant.uid}
                  participant={participant}
                  assignment={assignment}
                  rooms={rooms}
                  onAssignmentChange={updateAssignment}
                  onSelectionChange={toggleSelection}
                />
              );
            }}
            emptyComponent={<EmptyParticipantsState />}
          />
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
              text={'Send'}
              onPress={() => {
                handleSave();
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
