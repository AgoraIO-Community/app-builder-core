import React, {useContext} from 'react';
import {Text} from 'react-native';
import chatContext from '../ChatContext';
import {useString} from '../../utils/useString';
import {UidType, useMeetingInfo, useRender} from 'customization-api';
import Participant from './Participant';

const AllAudienceParticipants = (props: any) => {
  const {uids} = props;
  const {renderList} = useRender();
  const {localUid} = useContext(chatContext);
  //commented for v1 release
  //const participantListPlaceholder = useString('participantListPlaceholder')();
  const participantListPlaceholder = 'No one has joined yet';
  const remoteUserDefaultLabel = 'User';
  const getParticipantName = (uid: UidType) => {
    return renderList[uid]?.name || remoteUserDefaultLabel;
  };
  const {
    data: {isHost},
  } = useMeetingInfo();

  return (
    <>
      {uids.length == 0 ? (
        <Text
          style={{
            alignSelf: 'center',
            paddingVertical: 20,
            fontFamily: 'Source Sans Pro',
            fontWeight: '400',
            fontSize: 14,
            lineHeight: 12,
            color: '#333333',
          }}>
          {participantListPlaceholder}
        </Text>
      ) : (
        <>
          {/**Audience should see his name first */}
          {uids.filter((i) => i === localUid).length ? (
            <Participant
              isLocal={true}
              name={getParticipantName(localUid)}
              user={renderList[localUid]}
              isAudienceUser={true}
              showControls={renderList[localUid]?.type === 'rtc' && isHost}
              isHostUser={false}
              key={localUid}
            />
          ) : (
            <></>
          )}
          {/* Others Audience in the call */}
          {uids
            .filter((i) => i !== localUid)
            .map((uid: any, index: number) => (
              <Participant
                isLocal={false}
                name={getParticipantName(uid)}
                user={renderList[uid]}
                showControls={renderList[uid]?.type === 'rtc' && isHost}
                isAudienceUser={true}
                isHostUser={false}
                key={uid}
              />
            ))}
        </>
      )}
    </>
  );
};

export default AllAudienceParticipants;
