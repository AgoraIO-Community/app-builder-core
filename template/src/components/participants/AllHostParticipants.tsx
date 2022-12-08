import React from 'react';
import ScreenshareParticipants from './ScreenshareParticipants';
import Participant from './Participant';
import {useString} from '../../utils/useString';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import {useMeetingInfo, useRender} from 'customization-api';
import Spacer from '../../atoms/Spacer';
import {useVideoMeetingData} from '../contexts/VideoMeetingDataContext';

export default function AllHostParticipants(props: any) {
  const localUid = useLocalUid();
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const {renderList, activeUids} = useRender();
  const getParticipantName = (uid: UidType) => {
    return renderList[uid]?.name || remoteUserDefaultLabel;
  };
  const {hostUids} = useVideoMeetingData();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const {isMobile = false, handleClose, updateActionSheet} = props;
  return (
    <>
      <Spacer size={4} />
      {/* User should see his name first */}
      {activeUids.filter((uid) => uid === localUid).length > 0 ? (
        <Participant
          isLocal={true}
          isAudienceUser={false}
          name={getParticipantName(localUid)}
          user={renderList[localUid]}
          showControls={true}
          isHostUser={hostUids.indexOf(localUid) !== -1}
          key={localUid}
          isMobile={isMobile}
          handleClose={handleClose}
          updateActionSheet={updateActionSheet}
        />
      ) : (
        <></>
      )}
      {/* Others Users in the call */}
      {activeUids
        .filter((uid) => uid !== localUid)
        .map((uid) =>
          renderList[uid]?.type === 'screenshare' ? (
            <ScreenshareParticipants name={getParticipantName(uid)} key={uid} />
          ) : (
            <Participant
              isLocal={false}
              isAudienceUser={false}
              name={getParticipantName(uid)}
              user={renderList[uid]}
              showControls={renderList[uid]?.type === 'rtc' && isHost}
              isHostUser={hostUids.indexOf(uid) !== -1}
              key={uid}
              isMobile={isMobile}
              handleClose={handleClose}
              updateActionSheet={updateActionSheet}
            />
          ),
        )}
    </>
  );
}
