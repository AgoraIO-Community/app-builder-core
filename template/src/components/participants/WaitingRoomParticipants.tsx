import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useContent} from 'customization-api';
import {filterObject} from '../../utils';
import Participant from './Participant';
import ParticipantSectionTitle from './ParticipantSectionTitle';

const WaitingRoomParticipants = props => {
  const {defaultContent} = useContent();
  const [showWaitingRoomSection, setShowWaitingRoomSection] = useState(true);
  const {isMobile = false, handleClose, updateActionSheet} = props;
  const WaitingRoomParticipantsLabel = $config.EVENT_MODE
    ? 'WANT TO JOIN'
    : 'WAITING';

  const getParticipantName = uid => {
    return defaultContent[uid]?.name || 'WRP';
  };

  const getScreenShareUid = uid => {
    return defaultContent[uid]?.screenUid || '';
  };

  const uids = Object.keys(
    filterObject(
      defaultContent,
      ([k, v]) =>
        v?.type === 'rtc' && !v.offline && v?.isInWaitingRoom === true,
    ),
  );
  return (
    <>
      <ParticipantSectionTitle
        title={WaitingRoomParticipantsLabel}
        count={uids.length}
        isOpen={showWaitingRoomSection}
        onPress={() => setShowWaitingRoomSection(!showWaitingRoomSection)}
      />
      {showWaitingRoomSection ? (
        <View>
          {uids.map(uid => (
            <Participant
              isLocal={false}
              name={getParticipantName(uid)}
              user={defaultContent[uid]}
              showControls={false}
              isAudienceUser={true}
              isHostUser={false}
              key={uid}
              isMobile={isMobile}
              handleClose={handleClose}
              updateActionSheet={updateActionSheet}
              waitingRoomUser={true}
              uid={Number(uid)}
              screenUid={getScreenShareUid(uid)}
            />
          ))}
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default WaitingRoomParticipants;

const styles = StyleSheet.create({});
