/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import platform from '../../subComponents/Platform';
import {SHARE_LINK_CONTENT_TYPE, useShareLink} from '../useShareLink';
import isSDKCheck from '../../utils/isSDK';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {FontSizes} from '../../theme';
import MeetingLink from '../../atoms/MeetingLink';

export interface MeetingInfoBodyProps {
  showHelperText?: boolean;
  size?: keyof FontSizes;
  variant?: 'primary' | 'secondary';
}
export const MeetingInfoLinks = (props?: MeetingInfoBodyProps) => {
  const {showHelperText = false, variant = 'primary', size = 'medium'} = props;
  const {
    data: {isHost, pstn, isSeparateHostLink},
  } = useRoomInfo();
  const {getShareLink} = useShareLink();

  //commented for v1 release
  // const meetingUrlText = useString('meetingUrlLabel')();
  // const meetingIdText = useString('meetingIdLabel')();
  // const hostIdText = useString('hostIdLabel')();
  // const attendeeUrlLabel = useString('attendeeUrlLabel')();
  // const attendeeIdLabel = useString('attendeeIdLabel')();
  // const hostUrlLabel = useString('hostUrlLabel')();
  // const pstnLabel = useString('pstnLabel')();
  // const pstnNumberLabel = useString('pstnNumberLabel')();
  // const pinLabel = useString('pin')();
  // const enterMeetingAfterCreateButton = useString(
  //   'enterMeetingAfterCreateButton',
  // )();
  // const copyInviteButton = useString('copyInviteButton')();
  const meetingUrlText = 'Room Link';
  const meetingIdText = 'Room ID';
  const hostIdText = 'Host ID';
  const attendeeUrlLabel = 'Attendee Link';
  const attendeeIdLabel = 'Attendee ID';
  const hostUrlLabel = 'Host Link';
  const pstnLabel = 'PSTN';
  const pstnNumberLabel = 'Number';
  const pinLabel = 'Pin';

  const isSDK = isSDKCheck();
  const isWebCheck =
    $config.FRONTEND_ENDPOINT || (platform === 'web' && !isSDK);

  const getAttendeeLabel = () =>
    isWebCheck ? attendeeUrlLabel : attendeeIdLabel;

  const getHostLabel = () => {
    if (isSeparateHostLink) {
      if (isWebCheck) {
        return hostUrlLabel;
      }
      return hostIdText;
    } else {
      if (isWebCheck) {
        return meetingUrlText;
      }
      return meetingIdText;
    }
  };

  return (
    <>
      {isSeparateHostLink ? (
        <>
          <MeetingLink
            styleProps={{
              size,
              variant,
            }}
            label={getAttendeeLabel()}
            link={getShareLink(SHARE_LINK_CONTENT_TYPE.ATTENDEE)}
            linkToCopy={SHARE_LINK_CONTENT_TYPE.ATTENDEE}
            helperText={
              showHelperText && 'Share this with attendees you want to invite.'
            }
            gutterBottom
          />
        </>
      ) : (
        <></>
      )}
      {isHost ? (
        <>
          <MeetingLink
            styleProps={{
              size,
              variant,
            }}
            label={getHostLabel()}
            link={getShareLink(SHARE_LINK_CONTENT_TYPE.HOST)}
            linkToCopy={SHARE_LINK_CONTENT_TYPE.HOST}
            helperText={
              showHelperText &&
              'Share this with other co-hosts you want to invite'
            }
            gutterBottom
          />
        </>
      ) : (
        <></>
      )}
      {$config.PSTN && pstn && pstn?.number && pstn?.pin ? (
        <>
          <MeetingLink
            styleProps={{
              size,
              variant,
            }}
            label={pstnLabel}
            link={`${pstnNumberLabel} - ${pstn?.number}  |  ${pinLabel} - ${pstn?.pin}`}
            linkToCopy={SHARE_LINK_CONTENT_TYPE.PSTN}
            helperText={
              showHelperText &&
              'Share this phone number and pin to dial from phone.'
            }
            gutterBottom
          />
        </>
      ) : (
        <></>
      )}
    </>
  );
};
export default MeetingInfoLinks;
