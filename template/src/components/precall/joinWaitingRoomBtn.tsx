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

import React, {useContext, useEffect} from 'react';
import PrimaryButton from '../../atoms/PrimaryButton';
import {usePreCall} from './usePreCall';
import {useString} from '../../utils/useString';
import {ChannelProfile, PropsContext} from '../../../agora-rn-uikit';
import {JoinRoomButtonTextInterface} from '../../language/default-labels/precallScreenLabels';

import useGetName from '../../utils/useGetName';
import {useWakeLock} from '../useWakeLock';
import isMobileOrTablet from '../../utils/isMobileOrTablet';
import {isWebInternal} from '../../utils/common';
import useSetName from '../../utils/useSetName';
import {useUserPreference} from '../useUserPreference';
import {useSetRoomInfo} from '../room-info/useSetRoomInfo';
import {EventNames} from '../../rtm-events';
import {useRoomInfo} from '../room-info/useRoomInfo';
import Toast from '../../../react-native-toast-message';

import events, {PersistanceLevel} from '../../rtm-events-api';
import useWaitingRoomAPI from '../../subComponents/waiting-rooms/useWaitingRoomAPI';

const audio = new Audio(
  'https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3',
);

export interface PreCallJoinWaitingRoomBtnProps {
  render?: (
    onPress: () => void,
    title: string,
    disabled: boolean,
  ) => JSX.Element;
}

const JoinWaitingRoomBtn = (props: PreCallJoinWaitingRoomBtnProps) => {
  const {rtcProps} = useContext(PropsContext);
  const {setCallActive} = usePreCall();
  const username = useGetName();
  const setUsername = useSetName();
  const {isJoinDataFetched, isInWaitingRoom} = useRoomInfo();
  const {awake, request} = useWakeLock();
  const {saveName} = useUserPreference();
  const waitingRoomButton =
    useString<JoinRoomButtonTextInterface>('waitingRoomButton');
  const {setRoomInfo} = useSetRoomInfo();
  const {request: requestToJoin} = useWaitingRoomAPI();

  const [buttonText, setButtonText] = React.useState(
    waitingRoomButton({
      ready: isInWaitingRoom,
    }),
  );

  useEffect(() => {
    events.on(EventNames.WAITING_ROOM_RESPONSE, data => {
      const {entryApproved} = JSON.parse(data?.payload);
      // on response from host, waiting room permission is reset
      setRoomInfo(prev => {
        return {...prev, isInWaitingRoom: false};
      });
      if (entryApproved) {
        // entering in call screen
        setCallActive(true);
      } else {
        // inform user that entry was denied by the host
        Toast.show({
          text1: `Approval Required`,
          text2: 'Permission to enter the meeting was denied by the host',
          visibilityTime: 3000,
          type: 'error',
          primaryBtn: null,
          secondaryBtn: null,
        });
      }
    });
  }, []);

  const requestHostPermission = () => {
    events.send(
      EventNames.WAITING_ROOM_REQUEST,
      JSON.stringify({}),
      PersistanceLevel.Sender,
    );
  };

  const requestServerToJoinRoom = async () => {
    const res = await requestToJoin();
    console.log('in join btn', res);
  };

  const onSubmit = () => {
    setUsername(username.trim());
    //updating name in the backend
    saveName(username.trim());
    // Enter waiting rooom;
    setRoomInfo(prev => {
      return {...prev, isInWaitingRoom: true};
    });
    // send a L2 message to host for asking permission to enter the call , then set setCallActive(true) isInWaitingRoom:false on receiving WAITING_ROOM_RESPONSE,
    // requestHostPermission();

    // join request API to server, server will send RTM message to all hosts regarding request from this user,
    requestServerToJoinRoom();

    // Play a sound to avoid autoblocking in safari
    if (isWebInternal() || isMobileOrTablet()) {
      audio.volume = 0;
      audio.play().then(() => {
        // pause directly once played
        audio.pause();
      });
    }
    // Avoid Sleep only on mobile browsers
    if (isWebInternal() && isMobileOrTablet() && !awake) {
      // Request wake lock
      request();
    }
  };

  useEffect(() => {
    setButtonText(
      waitingRoomButton({
        ready: !isInWaitingRoom,
      }),
    );
  }, [isInWaitingRoom]);

  const title = buttonText;
  const onPress = () => onSubmit();
  const disabled = isInWaitingRoom || username?.trim() === '';
  return props?.render ? (
    props.render(onPress, title, disabled)
  ) : (
    <PrimaryButton
      // iconName={'video-on'}
      onPress={onPress}
      disabled={disabled}
      text={title}
      containerStyle={{
        minWidth: '100%',
        paddingHorizontal: 10,
      }}
      textStyle={{textAlign: 'center'}}
    />
  );
};

export default JoinWaitingRoomBtn;
