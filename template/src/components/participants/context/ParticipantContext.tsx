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
import {createContext} from 'react';
import React, {useState, useContext, useEffect} from 'react';
import chatContext from '../../ChatContext';
import {UserType} from '../../../components/RTMConfigure';
import {filterObject} from '../../../utils';
import {ClientRole} from '../../../../agora-rn-uikit';

interface ParticipantContext {
  hostList: any;
  audienceList: any;
  hostCount: number;
  audienceCount: number;
}

const ParticipantContext = createContext(null as unknown as ParticipantContext);

export const ParticipantContextProvider: React.FC = (props: any) => {
  const [hostCount, setHostCount] = useState(0);
  const [hostList, setHostList] = useState({});
  const [audienceList, setAudienceList] = useState({});
  const [audienceCount, setAudienceCount] = useState(0);

  const {userList} = useContext(chatContext);

  useEffect(() => {
    if (Object.keys(userList).length !== 0) {
      const hostList = filterObject(
        userList,
        ([k, v]) =>
          // v?.type === UserType.Normal &&
          v?.role == ClientRole.Broadcaster && !v.offline,
      );
      setHostList(hostList);
      setHostCount(Object.keys(hostList).length);
      const audienceList = filterObject(
        userList,
        ([k, v]) =>
          // v?.type === UserType.Normal &&
          v?.role == ClientRole.Audience && !v.offline,
      );
      setAudienceList(audienceList);
      setAudienceCount(Object.keys(audienceList).length);
    }
  }, [userList]);

  return (
    <ParticipantContext.Provider
      value={{
        hostList,
        audienceList,
        hostCount,
        audienceCount,
      }}>
      {props.children}
    </ParticipantContext.Provider>
  );
};

export const ParticipantContextConsumer = ParticipantContext.Consumer;

export default ParticipantContext;
