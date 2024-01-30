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
import {useString} from '../../utils/useString';

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

  const meetingUrlText = useString('roomLink')();
  const meetingIdText = useString('roomId')();
  const hostIdText = useString('hostId')();
  const attendeeUrlLabel = useString('attendeeLink')();
  const attendeeIdLabel = useString('attendeeId')();
  const hostUrlLabel = useString('hostLink')();
  const pstnLabel = useString('PSTN')();
  const pstnNumberLabel = useString('number')();
  const pinLabel = useString('pin')();
  const shareWithAttendeeInfo = useString('shareWithAttendee')();
  const shareWithCoHostInfo = useString('shareWithCoHost')();
  const shareWithPhonenumberInfo = useString('sharePhoneNumber')();

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
            helperText={showHelperText ? shareWithAttendeeInfo : ''}
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
            helperText={showHelperText ? shareWithCoHostInfo : ''}
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
            helperText={showHelperText ? shareWithPhonenumberInfo : ''}
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
