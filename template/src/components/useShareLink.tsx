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

import {createHook} from 'customization-implementation';
import React from 'react';
import {useString} from '../utils/useString';
import isSDKCheck from '../utils/isSDK';
import Toast from '../../react-native-toast-message';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import platform from '../subComponents/Platform';
import {MeetingInviteInterface} from '../language/default-labels/videoCallScreenLabels';
import Clipboard from '../subComponents/Clipboard';

export const GetMeetingInviteURL = (
  baseUrl: string,
  isHost: boolean,
  roomId: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${baseUrl}/${roomId.host}`,
        attendee: `${baseUrl}/${roomId.attendee}`,
      };
    } else {
      return {
        host: `${baseUrl}/${roomId.host}`,
      };
    }
  } else {
    return {
      attendee: `${baseUrl}/${roomId.attendee}`,
    };
  }
};
export const GetMeetingInviteID = (
  isHost: boolean,
  roomId: {
    host?: string;
    attendee?: string;
  },
  isSeparateHostLink: boolean,
) => {
  if (isHost) {
    if (isSeparateHostLink) {
      return {
        host: `${roomId.host}`,
        attendee: `${roomId.attendee}`,
      };
    } else {
      return {
        host: `${roomId.host}`,
      };
    }
  } else {
    return {
      attendee: `${roomId.attendee}`,
    };
  }
};

export enum SHARE_LINK_CONTENT_TYPE {
  ATTENDEE = 1,
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
  const {
    data: {meetingTitle, roomId, pstn, isSeparateHostLink, isHost},
  } = useMeetingInfo();

  //commmented for v1 release
  // const copiedToClipboardText = useString(
  //   'copiedToClipboardNotificationLabel',
  // )();
  // const meetingIdText = useString('meetingIdLabel')();
  // const PSTNNumberText = useString('PSTNNumber')();
  // const PSTNPinText = useString('PSTNPin')();
  // const meetingInviteText =
  //   useString<MeetingInviteInterface>('meetingInviteText');
  const copiedToClipboardText = 'Copied to Clipboard';
  const meetingIdText = 'Meeting ID';
  const PSTNNumberText = 'PSTN Number';
  const PSTNPinText = 'PSTN Pin';
  const meetingInviteText = ({
    meetingName,
    id,
    url,
    pstn,
    isHost,
    isSeparateHostLink,
  }: MeetingInviteInterface) => {
    let inviteContent = '';
    if (url) {
      //for host
      if (isHost) {
        if (isSeparateHostLink) {
          //seperate link for host and attendee
          inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${url?.attendee}\nURL for Host: ${url?.host}`;
        } else {
          //single link for everyone
          inviteContent += `Meeting - ${meetingName}\nMeeting URL: ${url?.host}`;
        }
      }
      //for attendee
      else {
        inviteContent += `Meeting - ${meetingName}\nURL for Attendee: ${url?.attendee}`;
      }
    } else {
      if (isHost) {
        if (isSeparateHostLink) {
          inviteContent += `Meeting - ${meetingName}\nAttendee Meeting ID: ${id?.attendee}\nHost Meeting ID: ${id?.host}`;
        } else {
          inviteContent += `Meeting - ${meetingName}\nMeeting ID: ${id?.host}`;
        }
      } else {
        //copy this label on videocall screen
        inviteContent += `Meeting - ${meetingName}\nAttendee Meeting ID: ${id?.attendee}`;
      }
    }
    // Adding pstn data into meeting data if present
    if (pstn?.number && pstn?.pin) {
      inviteContent += `\nPSTN Number: ${pstn.number}\nPSTN Pin: ${pstn.pin}`;
    }
    return inviteContent;
  };

  const isSDK = isSDKCheck();

  const getMeetingInvite = () => {
    let baseURL = getBaseURL();
    let stringToCopy = meetingInviteText({
      meetingName: meetingTitle,
      url: baseURL
        ? GetMeetingInviteURL(baseURL, isHost, roomId, isSeparateHostLink)
        : undefined,
      id: !baseURL
        ? GetMeetingInviteID(isHost, roomId, isSeparateHostLink)
        : undefined,
      pstn: pstn
        ? {
            number: pstn.number,
            pin: pstn.pin,
          }
        : undefined,
      isHost,
      isSeparateHostLink,
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
    if (roomId?.attendee) {
      if (baseURL) {
        stringToCopy += `${baseURL}/${roomId.attendee}`;
      } else {
        stringToCopy += `${roomId.attendee}`;
      }
    }
    return stringToCopy;
  };

  const getHostUrlOrId = () => {
    let stringToCopy = '';
    if (roomId?.host) {
      let baseURL = getBaseURL();
      if (baseURL) {
        stringToCopy += `${baseURL}/${roomId.host}`;
      } else {
        stringToCopy += `${roomId.host}`;
      }
    }
    return stringToCopy;
  };

  const getPstn = () => {
    let stringToCopy = '';
    if (pstn && pstn?.number && pstn?.pin) {
      stringToCopy += `${PSTNNumberText}: ${pstn.number} ${PSTNPinText}: ${pstn.pin}`;
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
