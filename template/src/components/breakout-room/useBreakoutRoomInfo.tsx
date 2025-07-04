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
import {UidType} from '../../../agora-rn-uikit';
import {createHook} from 'customization-implementation';
import React, {useState, SetStateAction, useEffect, useContext} from 'react';
import {randomNameGenerator} from '../../utils';
import StorageContext from '../StorageContext';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import {useRoomInfo} from 'customization-api';

export interface BreakoutRoomInfo {
  internalGroupId: string;
  name: string;
  participants: {
    hosts: UidType[];
    attendees: UidType[];
  };
}

export interface BreakoutRoomContextInterface {
  breakoutRoomInfo: BreakoutRoomInfo[];
  setBreakoutRoomInfo: React.Dispatch<SetStateAction<BreakoutRoomInfo[]>>;
  createBreakoutRoomGroup: (name?: string) => void;
  addUserIntoGroup: (
    uid: UidType,
    selectGroupId: string,
    isHost: boolean,
  ) => void;
  startBreakoutRoom: () => void;
}

const BreakoutRoomContext = React.createContext<BreakoutRoomContextInterface>({
  breakoutRoomInfo: [],
  setBreakoutRoomInfo: () => {},
  createBreakoutRoomGroup: () => {},
  addUserIntoGroup: () => {},
  startBreakoutRoom: () => {},
});

const BreakoutRoomProvider = (props: {children: React.ReactNode}) => {
  const {store} = useContext(StorageContext);
  const {
    data: {roomId},
  } = useRoomInfo();
  const [breakoutRoomInfo, setBreakoutRoomInfo] = useState<BreakoutRoomInfo[]>(
    [],
  );

  useEffect(() => {
    console.log('debugging breakoutRoomInfo', breakoutRoomInfo);
  }, [breakoutRoomInfo]);

  const startBreakoutRoom = () => {
    const startReqTs = Date.now();
    const requestId = getUniqueID();

    fetch(`${$config.BACKEND_ENDPOINT}/v1/breakout-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: store.token ? `Bearer ${store.token}` : '',
        'X-Request-Id': requestId,
        'X-Session-Id': logger.getSessionId(),
      },
      body: JSON.stringify({
        passphrase: roomId.host,
        session_id: randomNameGenerator(6),
        breakout_room: breakoutRoomInfo,
      }),
    })
      .then((res: any) => {
        console.log('debugging res', res);
        debugger;
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        if (res.status === 200) {
          // logger.debug(
          //   LogSource.NetworkRest,
          //   'breakout-room',
          //   'start breakout successfully',
          //   {
          //     responseData: res,
          //     startReqTs,
          //     endRequestTs,
          //     latency,
          //     requestId,
          //   },
          // );
        } else {
          // throw Error(`Internal server error ${res.status}`);
        }
      })
      .catch(err => {
        console.log('debugging err', err);
        debugger;
        const endRequestTs = Date.now();
        const latency = endRequestTs - startReqTs;
        // logger.error(
        //   LogSource.NetworkRest,
        //   'recording_start',
        //   'Error while start recording',
        //   JSON.stringify(err || {}),
        //   {
        //     startReqTs,
        //     endRequestTs,
        //     latency,
        //     requestId,
        //   },
        // );
      });
  };

  const createBreakoutRoomGroup = name => {
    let groupName = name ? name : `Group ${breakoutRoomInfo?.length + 1}`;

    setBreakoutRoomInfo(prevState => {
      return [
        ...prevState,
        {
          name: groupName,
          internalGroupId: randomNameGenerator(6),
          participants: {hosts: [], attendees: []},
        },
      ];
    });
  };

  const addUserIntoGroup = (uid, selectGroupId, isHost) => {
    setBreakoutRoomInfo(prevState => {
      const temp = [];
      prevState.forEach((item, index) => {
        const {internalGroupId} = item;
        if (internalGroupId === selectGroupId) {
          const data = {
            ...prevState[index],
            participants: {
              hosts: isHost
                ? prevState[index]?.participants?.hosts?.concat([uid])
                : prevState[index]?.participants?.hosts,
              attendees: !isHost
                ? prevState[index]?.participants?.attendees.concat([uid])
                : prevState[index]?.participants?.attendees,
            },
          };
          temp.push(data);
        } else {
          temp.push(item);
        }
      });
      return temp;
    });
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        breakoutRoomInfo,
        setBreakoutRoomInfo,
        createBreakoutRoomGroup,
        addUserIntoGroup,
        startBreakoutRoom,
      }}>
      {props.children}
    </BreakoutRoomContext.Provider>
  );
};

const useBreakoutRoomInfo = createHook(BreakoutRoomContext);

export {useBreakoutRoomInfo, BreakoutRoomProvider};
