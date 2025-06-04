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
import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  DispatchContext,
  ContentInterface,
  useLocalUid,
  UidType,
} from '../../agora-rn-uikit';
import {useString} from '../utils/useString';
import StorageContext from './StorageContext';
import events, {PersistanceLevel} from '../rtm-events-api';
import {EventNames} from '../rtm-events';
import useLocalScreenShareUid from '../utils/useLocalShareScreenUid';
import {createHook} from 'customization-implementation';
import ChatContext from './ChatContext';
import {filterObject, useContent, useRoomInfo, useRtc} from 'customization-api';
import {
  PSTNUserLabel,
  videoRoomScreenshareText,
  videoRoomUserFallbackText,
} from '../language/default-labels/videoCallScreenLabels';
import {useLanguage} from '../language/useLanguage';
import {useScreenContext} from '../components/contexts/ScreenShareContext';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from '../utils/getUniqueID';

export interface UserUids {
  [key: UidType]: {
    isHost: boolean;
    name: string;
  };
}
interface UserPreferenceContextInterface {
  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  uids: UserUids;
}

const UserPreferenceContext =
  React.createContext<UserPreferenceContextInterface>({
    displayName: '',
    setDisplayName: () => {},

    uids: {},
  });

const UserPreferenceProvider = (props: {
  children: React.ReactNode;
  callActive: boolean;
}) => {
  const {callActive} = props;
  const {
    data: {isHost},
  } = useRoomInfo();
  const localUid = useLocalUid();
  const screenShareUid = useLocalScreenShareUid();
  const {dispatch} = useContext(DispatchContext);
  const [uids, setUids] = useState({});
  const {store, setStore} = useContext(StorageContext);
  const {hasUserJoinedRTM} = useContext(ChatContext);
  const getInitialUsername = () =>
    store?.displayName ? store.displayName : '';
  const [displayName, setDisplayName] = useState(getInitialUsername());

  const {languageCode} = useLanguage();
  const {screenShareData} = useScreenContext();
  const {defaultContent} = useContent();
  const screenShareDataRef = useRef({screenShareData});
  useEffect(() => {
    screenShareDataRef.current.screenShareData = screenShareData;
  }, [screenShareData]);

  useEffect(() => {
    try {
      if (languageCode) {
        Object.keys(screenShareDataRef.current.screenShareData).map(i => {
          let screenShareUidToUpdate = parseInt(i);
          const users = filterObject(
            defaultContent,
            ([k, v]) => v?.screenUid === screenShareUidToUpdate,
          );
          const keys = Object.keys(users);
          if (users && keys && keys?.length) {
            updateRenderListState(screenShareUidToUpdate, {
              name: getScreenShareName(
                users[parseInt(keys[0])]?.name || userText,
              ),
            });
          }
        });
      }
    } catch (error) {}
  }, [languageCode, screenShareData]);

  const userText = useString(videoRoomUserFallbackText)();
  const pstnUserLabel = useString(PSTNUserLabel)();
  const getScreenShareName = useString(videoRoomScreenshareText);

  useEffect(() => {
    events.on(EventNames.NAME_ATTRIBUTE, data => {
      const value = JSON.parse(data?.payload);
      if (value) {
        if (value?.uid) {
          updateRenderListState(value?.uid, {
            name:
              String(value?.uid)[0] === '1'
                ? pstnUserLabel
                : value?.name || userText,
          });
          //set uids data
          if (value?.isRtcConnected) {
            setUids(prevState => {
              return {
                ...prevState,
                [value.uid]: {
                  isHost: value?.isHost,
                  name: value?.name,
                },
              };
            });
          } else {
            setUids(prevState => {
              const temp = {...prevState};
              const keys = Object.keys(temp);
              if (keys.indexOf(value.uid) !== -1) {
                delete temp[value.uid];
                return temp;
              } else {
                return prevState;
              }
            });
          }
        }
        if (value?.screenShareUid) {
          updateRenderListState(value?.screenShareUid, {
            name: getScreenShareName(value?.name || userText),
            type: 'screenshare',
          });
        }
      }
    });
    return () => {
      events.off(EventNames.NAME_ATTRIBUTE);
    };
  }, []);

  useEffect(() => {
    //Update the store displayName value if the state is changed
    setStore(prevState => {
      return {
        ...prevState,
        displayName,
      };
    });

    //update local state for user and screenshare
    updateRenderListState(localUid, {name: displayName || userText});
    updateRenderListState(screenShareUid, {
      name: getScreenShareName(displayName || userText),
      type: 'screenshare',
    });

    if (hasUserJoinedRTM && callActive) {
      //set local uids
      setUids(prevState => {
        return {
          ...prevState,
          [localUid]: {
            name: displayName || userText,
            isHost: isHost,
          },
        };
      });
    }

    if (hasUserJoinedRTM) {
      //update remote state for user and screenshare
      events.send(
        EventNames.NAME_ATTRIBUTE,
        JSON.stringify({
          uid: localUid,
          screenShareUid: screenShareUid,
          name: displayName || userText,
          isRtcConnected: callActive,
          isHost: isHost,
        }),
        PersistanceLevel.Sender,
      );
    }
  }, [displayName, hasUserJoinedRTM, callActive, isHost]);

  const updateRenderListState = (
    uid: number,
    data: Partial<ContentInterface>,
  ) => {
    dispatch({type: 'UpdateRenderList', value: [uid, data]});
  };

  return (
    <UserPreferenceContext.Provider
      value={{
        setDisplayName,
        displayName,
        uids,
      }}>
      {props.children}
    </UserPreferenceContext.Provider>
  );
};

const useUserPreference = createHook(UserPreferenceContext);

export {useUserPreference, UserPreferenceProvider};
