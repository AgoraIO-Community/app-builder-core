import React from 'react';
import MeParticipant from './MeParticipant';
import ScreenshareParticipants from './ScreenshareParticipants';
import Participant from './Participant';
import {useString} from '../../utils/useString';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import {useRender} from 'customization-api';

export default function AllHostParticipants(props: any) {
  const {p_style, isHost} = props;
  const localUid = useLocalUid();
  //commented for v1 release
  //const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const remoteUserDefaultLabel = 'User';
  const {renderList, activeUids} = useRender();
  const getParticipantName = (uid: UidType) => {
    return renderList[uid]?.name || remoteUserDefaultLabel;
  };

  return (
    <>
      {/* User should see his name first 
      todo hari check why activeUids.filter((uid) => uid === localUid).length > 0 is used
      */}
      <Participant
        isLocal={true}
        name={getParticipantName(localUid)}
        user={renderList[localUid]}
        showControls={true}
        isHost={isHost}
        key={localUid}
      />
      {/* Others Users in the call */}
      {activeUids
        .filter((uid) => uid !== localUid)
        .map((uid) =>
          renderList[uid]?.type === 'screenshare' ? (
            <ScreenshareParticipants
              name={getParticipantName(uid)}
              p_styles={p_style}
              key={uid}
            />
          ) : (
            <Participant
              isLocal={false}
              name={getParticipantName(uid)}
              user={renderList[uid]}
              showControls={renderList[uid]?.type === 'rtc' && isHost}
              isHost={isHost}
              key={uid}
            />
          ),
        )}
    </>
  );
}
