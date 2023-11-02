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
import {
  ChannelProfile,
  DispatchContext,
  PropsContext,
  useLocalUid,
} from '../../../agora-rn-uikit';
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

import events from '../../rtm-events-api';
import useWaitingRoomAPI from '../../subComponents/waiting-rooms/useWaitingRoomAPI';
import {UserType} from '../RTMConfigure';

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
  const shouldPollRef = React.useRef(false);

  const [buttonText, setButtonText] = React.useState(
    waitingRoomButton({
      ready: isInWaitingRoom,
    }),
  );

  const {dispatch} = useContext(DispatchContext);
  const localUid = useLocalUid();
  useEffect(() => {
    events.on(EventNames.WAITING_ROOM_RESPONSE, data => {
      const {approved, mainUser, screenShare} = JSON.parse(data?.payload);
      // stop polling if user has responsed with yes / no
      shouldPollRef.current = false;
      // on approve/reject response from host, waiting room permission is reset
      // update waitinng room status on uid
      dispatch({
        type: 'UpdateRenderList',
        value: [localUid, {isInWaitingRoom: false}],
      });

      if (approved) {
        setRoomInfo(prev => {
          return {
            ...prev,
            isInWaitingRoom: false,
            data: {
              ...prev.data,
              token: mainUser.rtc,
              screenShareToken: screenShare.rtc,
              screenShareUid: screenShare.uid,
            },
          };
        });

        // entering in call screen
        window.setTimeout(() => setCallActive(true), 0);
        // setCallActive(true);
      } else {
        setRoomInfo(prev => {
          return {
            ...prev,
            isInWaitingRoom: false,
          };
        });
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

  const requestServerToJoinRoom = async () => {
    let pollingInterval = null;
    // polling for every 30 seconds
    const pollFunction = async () => {
      if (shouldPollRef.current) {
        const res = await requestToJoin({send_event: true});
        console.log('in join btn', res);
      }

      if (!shouldPollRef.current) {
        // If the request is approved/rejected stop polling
        clearInterval(pollingInterval);
      }
    };

    // Call the polling function immediately
    pollFunction();

    // Set up a polling interval
    pollingInterval = setInterval(pollFunction, 30000); // Poll every 30 seconds (30,000 milliseconds)
  };

  const onSubmit = () => {
    shouldPollRef.current = true;
    setUsername(username.trim());
    //updating name in the backend
    saveName(username.trim());
    //setCallActive(true);

    // add the waitingRoomStatus to the uid
    dispatch({
      type: 'UpdateRenderList',
      value: [localUid, {isInWaitingRoom: true}],
    });
    // Enter waiting rooom;
    setRoomInfo(prev => {
      return {...prev, isInWaitingRoom: true};
    });

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
