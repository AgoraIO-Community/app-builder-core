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
import React, {useState, useContext, useEffect} from 'react';
import {RenderInterface, useLocalUid} from '../../agora-rn-uikit';
import {useString} from '../utils/useString';
import StorageContext from './StorageContext';
import events, {EventPersistLevel} from '../rtm-events-api';
import {EventNames} from '../rtm-events';
import useLocalScreenShareUid from '../utils/useLocalShareScreenUid';
import {createHook} from 'customization-implementation';
import ChatContext from './ChatContext';
import {useRtc} from 'customization-api';
import {gql, useMutation} from '@apollo/client';

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
  const {dispatch} = useRtc();

  const {store, setStore} = useContext(StorageContext);
  const {hasUserJoinedRTM} = useContext(ChatContext);
  const getInitialUsername = () =>
    store?.displayName ? store.displayName : '';
  const [displayName, setDisplayName] = useState(getInitialUsername());
  const [updateUserName] = useMutation(UPDATE_USER_NAME_MUTATION);

  const saveName = (name: string) => {
    if (name && name?.trim() !== '') {
      try {
        updateUserName({
          variables: {
            name,
          },
        }).catch((error) => {
          console.log('ERROR, could not save the name', error);
        });
      } catch (error) {
        console.log('ERROR, could not save the name', error);
      }
    }
  };
  //commented for v1 release
  // const userText = useString('remoteUserDefaultLabel')();
  const userText = 'User';
  const pstnUserLabel = useString('pstnUserLabel')();
  //commented for v1 release
  //const getScreenShareName = useString('screenshareUserName');
  const getScreenShareName = (name: string) => `${name}'s screenshare`;

  useEffect(() => {
    events.on(EventNames.NAME_ATTRIBUTE, (data) => {
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
    setStore((prevState) => {
      return {
        ...prevState,
        displayName,
      };
    });

    //update local state for user and screenshare
    updateRenderListState(localUid, {name: displayName || userText});
    updateRenderListState(screenShareUid, {
      name: getScreenShareName(displayName || userText),
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
        EventPersistLevel.LEVEL2,
      );
    }
  }, [displayName, hasUserJoinedRTM]);

  const updateRenderListState = (
    uid: number,
    data: Partial<RenderInterface>,
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
