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

import {createHook} from 'fpe-implementation';
import React from 'react';
import {useString} from '../utils/useString';
import isSDKCheck from '../utils/isSDK';
import Toast from '../../react-native-toast-message';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import platform from '../subComponents/Platform';
import {
  GetMeetingInviteID,
  GetMeetingInviteURL,
} from '../utils/getMeetingInvite';
import {MeetingInviteInterface} from '../language/default-labels/videoCallScreenLabels';
import Clipboard from '../subComponents/Clipboard';

export enum SHARE_LINK_CONTENT_TYPE {
  ATTENDEE,
  HOST,
  PSTN,
  MEETING_INVITE,
}

export interface ShareLinkContextInterface {
  copyShareLinkToClipboard: (type: SHARE_LINK_CONTENT_TYPE) => void;
  getShareLink: (type: SHARE_LINK_CONTENT_TYPE) => string;
}
const ShareLinkContext = React.createContext<ShareLinkContextInterface>({
  copyShareLinkToClipboard: () => {},
  getShareLink: () => '',
});

interface ShareLinkProvideProps {
  children: React.ReactNode;
}

const ShareLinkProvider = (props: ShareLinkProvideProps) => {
  const {meetingTitle, meetingPassphrase, isSeparateHostLink} =
    useMeetingInfo();

  const copiedToClipboardText = useString(
    'copiedToClipboardNotificationLabel',
  )();
  const meetingIdText = useString('meetingIdLabel')();
  const PSTNNumberText = useString('PSTNNumber')();
  const PSTNPinText = useString('PSTNPin')();

  const meetingInviteText =
    useString<MeetingInviteInterface>('meetingInviteText');

  const isSDK = isSDKCheck();

  const getMeetingInvite = () => {
    let baseURL = getBaseURL();
    let stringToCopy = meetingInviteText({
      meetingName: meetingTitle,
      url: baseURL
        ? GetMeetingInviteURL(
            baseURL,
            meetingPassphrase.attendee,
            isSeparateHostLink ? meetingPassphrase.host : undefined,
          )
        : undefined,
      id: !baseURL
        ? GetMeetingInviteID(
            meetingPassphrase.attendee,
            isSeparateHostLink ? meetingPassphrase.host : undefined,
          )
        : undefined,
      pstn: meetingPassphrase?.pstn
        ? {
            number: meetingPassphrase.pstn.number,
            pin: meetingPassphrase.pstn.pin,
          }
        : undefined,
    });
    return stringToCopy;
  };

  const getBaseURL = () => {
    let baseURL =
      platform === 'web' && !isSDK
        ? $config.FRONTEND_ENDPOINT || window.location.origin
        : undefined;
    return baseURL;
  };

  const getAttendeeURLOrId = () => {
    let stringToCopy = '';
    let baseURL = getBaseURL();
    if (meetingPassphrase?.attendee) {
      if (baseURL) {
        stringToCopy += `${baseURL}/${meetingPassphrase.attendee}`;
      } else {
        stringToCopy += `${meetingIdText}: ${meetingPassphrase.attendee}`;
      }
    }
    return stringToCopy;
  };

  const getHostUrlOrId = () => {
    let stringToCopy = '';
    if (meetingPassphrase?.host) {
      let baseURL = getBaseURL();
      if (baseURL) {
        stringToCopy += `${baseURL}/${meetingPassphrase.host}`;
      } else {
        stringToCopy += `${meetingIdText}: ${meetingPassphrase.host}`;
      }
    }
    return stringToCopy;
  };

  const getPstn = () => {
    let stringToCopy = '';
    if (
      meetingPassphrase?.pstn &&
      meetingPassphrase.pstn?.number &&
      meetingPassphrase.pstn?.pin
    ) {
      stringToCopy += `${PSTNNumberText}: ${meetingPassphrase.pstn.number} ${PSTNPinText}: ${meetingPassphrase.pstn.pin}`;
    }

    return stringToCopy;
  };

  const getShareLink = (input: SHARE_LINK_CONTENT_TYPE) => {
    let stringToCopy = '';
    switch (input) {
      case SHARE_LINK_CONTENT_TYPE.MEETING_INVITE:
        stringToCopy = getMeetingInvite();
        break;
      case SHARE_LINK_CONTENT_TYPE.ATTENDEE:
        stringToCopy = getAttendeeURLOrId();
        break;
      case SHARE_LINK_CONTENT_TYPE.HOST:
        stringToCopy = getHostUrlOrId();
        break;
      case SHARE_LINK_CONTENT_TYPE.PSTN:
        stringToCopy = getPstn();
      default:
        break;
    }
    return stringToCopy;
  };

  const copyShareLinkToClipboard = (input: SHARE_LINK_CONTENT_TYPE) => {
    let stringToCopy = '';
    switch (input) {
      case SHARE_LINK_CONTENT_TYPE.MEETING_INVITE:
        stringToCopy = getMeetingInvite();
        break;
      case SHARE_LINK_CONTENT_TYPE.ATTENDEE:
        stringToCopy = getAttendeeURLOrId();
        break;
      case SHARE_LINK_CONTENT_TYPE.HOST:
        stringToCopy = getHostUrlOrId();
        break;
      case SHARE_LINK_CONTENT_TYPE.PSTN:
        stringToCopy = getPstn();
      default:
        break;
    }
    Clipboard.setString(stringToCopy);
    Toast.show({
      type: 'success',
      text1: copiedToClipboardText,
      visibilityTime: 1000,
    });
  };

  return (
    <ShareLinkContext.Provider value={{copyShareLinkToClipboard, getShareLink}}>
      {props.children}
    </ShareLinkContext.Provider>
  );
};

const useShareLink = createHook(ShareLinkContext);

export {ShareLinkProvider, ShareLinkContext, useShareLink};
