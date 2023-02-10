import React, {useContext} from 'react';
import {Text} from 'react-native';
import chatContext from '../ChatContext';
import {useString} from '../../utils/useString';
import {
  RenderInterface,
  UidType,
  useMeetingInfo,
  useRender,
} from 'customization-api';
import Participant from './Participant';
import {useLiveStreamDataContext} from '../contexts/LiveStreamDataContext';
import {useScreenContext} from '../contexts/ScreenShareContext';
import ScreenshareParticipants from './ScreenshareParticipants';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

const AllAudienceParticipants = (props: any) => {
  const {screenShareData} = useScreenContext();
  const {
    uids,
    isMobile = false,
    handleClose,
    updateActionSheet,
    emptyMessage,
  } = props;
  const {renderList} = useRender();
  const {localUid} = useContext(chatContext);
  //commented for v1 release
  //const participantListPlaceholder = useString('participantListPlaceholder')();
  const remoteUserDefaultLabel = 'User';
  const getParticipantName = (uid: UidType) => {
    return renderList[uid]?.name || remoteUserDefaultLabel;
  };
  const {
    data: {isHost},
  } = useMeetingInfo();
  const {hostUids} = useLiveStreamDataContext();

  const renderScreenShare = (user: RenderInterface) => {
    if (screenShareData[user.screenUid]?.isActive) {
      return (
        <ScreenshareParticipants
          user={renderList[user.screenUid]}
          key={user.screenUid}
        />
      );
    } else {
      <></>;
    }
  };

  return (
    <>
      {uids.length == 0 ? (
        emptyMessage ? (
          <Text
            style={{
              alignSelf: 'center',
              paddingVertical: 20,
              fontFamily: 'Source Sans Pro',
              fontWeight: '400',
              fontSize: 14,
              color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
            }}>
            {emptyMessage}
          </Text>
        ) : (
          <></>
        )
      ) : (
        <>
          {/**Audience should see his name first */}
          {uids.filter((i) => i === localUid).length ? (
            <>
              <Participant
                isLocal={true}
                name={getParticipantName(localUid)}
                user={renderList[localUid]}
                isAudienceUser={
                  $config.EVENT_MODE && hostUids.indexOf(localUid) !== -1
                    ? false
                    : true
                }
                showControls={
                  (renderList[localUid]?.type === 'rtc' && isHost) ||
                  (renderList[localUid]?.type === 'rtc' &&
                    $config.EVENT_MODE &&
                    hostUids.indexOf(localUid) !== -1)
                    ? true
                    : false
                }
                isHostUser={false}
                key={localUid}
                isMobile={isMobile}
                handleClose={handleClose}
                updateActionSheet={updateActionSheet}
              />
              {renderScreenShare(renderList[localUid])}
            </>
          ) : (
            <></>
          )}
          {/* Others Audience in the call */}
          {uids
            .filter((i) => i !== localUid)
            .map((uid: any, index: number) => (
              <>
                <Participant
                  isLocal={false}
                  name={getParticipantName(uid)}
                  user={renderList[uid]}
                  showControls={renderList[uid]?.type === 'rtc' && isHost}
                  isAudienceUser={true}
                  isHostUser={false}
                  key={uid}
                  isMobile={isMobile}
                  handleClose={handleClose}
                  updateActionSheet={updateActionSheet}
                />
                {renderScreenShare(renderList[uid])}
              </>
            ))}
        </>
      )}
    </>
  );
};

export default AllAudienceParticipants;
