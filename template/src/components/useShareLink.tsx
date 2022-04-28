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
import {CreateMeetingDataInterface} from '../utils/useCreateMeeting';

export interface ShareLinkContextInterface extends CreateMeetingDataInterface {
  isSeparateHostLink: boolean;
  roomTitle: string;
}
const ShareLinkContext = React.createContext<ShareLinkContextInterface>({
  attendeePassphrase: '',
  isSeparateHostLink: false,
  roomTitle: '',
});

interface ShareLinkProvideProps {
  children: React.ReactNode;
  value: ShareLinkContextInterface;
}

const ShareLinkProvider = (props: ShareLinkProvideProps) => {
  return (
    <ShareLinkContext.Provider value={{...props.value}}>
      {props.children}
    </ShareLinkContext.Provider>
  );
};

const useShareLink = createHook(ShareLinkContext);

export {ShareLinkProvider, ShareLinkContext, useShareLink};
