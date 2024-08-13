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
} from '../../agora-rn-uikit';
import {useString} from '../utils/useString';
import StorageContext from './StorageContext';
import events, {PersistanceLevel} from '../rtm-events-api';
import {EventNames} from '../rtm-events';
import useLocalScreenShareUid from '../utils/useLocalShareScreenUid';
import {createHook} from 'customization-implementation';
import ChatContext from './ChatContext';
import {filterObject, useContent, useRtc} from 'customization-api';
import {gql, useMutation} from '@apollo/client';
import {
  PSTNUserLabel,
  videoRoomScreenshareText,
  videoRoomUserFallbackText,
} from '../language/default-labels/videoCallScreenLabels';
import {useLanguage} from '../language/useLanguage';
import {useScreenContext} from '../components/contexts/ScreenShareContext';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import getUniqueID from '../utils/getUniqueID';

interface UserPreferenceContextInterface {
  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
  saveName: (name: string) => void;
}

const UserPreferenceContext =
  React.createContext<UserPreferenceContextInterface>({
    displayName: '',
    setDisplayName: () => {},
    saveName: () => {},
  });

const UPDATE_USER_NAME_MUTATION = gql`
  mutation updateUserName($name: String!) {
    updateUserName(name: $name) {
      name
      email
    }
  }
`;

const UserPreferenceProvider = (props: {children: React.ReactNode}) => {
  const localUid = useLocalUid();
  const screenShareUid = useLocalScreenShareUid();
  const {dispatch} = useContext(DispatchContext);

  const {store, setStore} = useContext(StorageContext);
  const {hasUserJoinedRTM} = useContext(ChatContext);
  const getInitialUsername = () =>
    store?.displayName ? store.displayName : '';
  const [displayName, setDisplayName] = useState(getInitialUsername());
  const [updateUserName] = useMutation(UPDATE_USER_NAME_MUTATION);

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

  const saveName = (name: string) => {
    if (name && name?.trim() !== '') {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      try {
        logger.log(
          LogSource.Internals,
          'NAME',
          'Trying to save the display name',
          {
            requestId,
            startReqTs,
          },
        );
        updateUserName({
          context: {
            headers: {
              'X-Request-Id': requestId,
            },
          },
          variables: {
            name,
          },
        })
          .then(res => {
            const endReqTs = Date.now();
            logger.log(
              LogSource.Internals,
              'NAME',
              'name updated successfully',
              {
                responseData: res,
                startReqTs,
                endReqTs,
                latency: endReqTs - startReqTs,
                requestId,
              },
            );
          })
          .catch(error => {
            const endReqTs = Date.now();
            logger.error(
              LogSource.Internals,
              'NAME',
              'ERROR, could not save the name',
              error,
              {
                startReqTs,
                endReqTs,
                latency: endReqTs - startReqTs,
                requestId,
              },
            );
          });
      } catch (error) {
        const endReqTs = Date.now();
        logger.error(
          LogSource.Internals,
          'NAME',
          'ERROR, could not save the name',
          error,
          {
            startReqTs,
            endReqTs,
            latency: endReqTs - startReqTs,
            requestId,
          },
        );
      }
    }
  };
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

    if (hasUserJoinedRTM) {
      //update remote state for user and screenshare
      events.send(
        EventNames.NAME_ATTRIBUTE,
        JSON.stringify({
          uid: localUid,
          screenShareUid: screenShareUid,
          name: displayName || userText,
        }),
        PersistanceLevel.Sender,
      );
    }
  }, [displayName, hasUserJoinedRTM]);

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
        saveName,
      }}>
      {props.children}
    </UserPreferenceContext.Provider>
  );
};

const useUserPreference = createHook(UserPreferenceContext);

export {useUserPreference, UserPreferenceProvider};
