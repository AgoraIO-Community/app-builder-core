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
import {useRoomInfo} from '../room-info/useRoomInfo';
import useGetName from '../../utils/useGetName';
import {useUserPreference} from '../useUserPreference';
import {useSetRoomInfo} from '../room-info/useSetRoomInfo';
import Toast from '../../../react-native-toast-message';
import events from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useWaitingRoomAPI from '../../subComponents/waiting-rooms/useWaitingRoomAPI';

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
  const {isJoinDataFetched, isInWaitingRoom} = useRoomInfo();
  const {setRoomInfo} = useSetRoomInfo();

  const waitingRoomButton =
    useString<JoinRoomButtonTextInterface>('waitingRoomButton');
  const {saveName} = useUserPreference();
  const [buttonText, setButtonText] = React.useState(
    waitingRoomButton({
      ready: isInWaitingRoom,
    }),
  );
  const {request: requestToJoin} = useWaitingRoomAPI();
  const shouldPollRef = React.useRef(false);

  useEffect(() => {
    events.on(EventNames.WAITING_ROOM_RESPONSE, data => {
      const {approved, rtc} = JSON.parse(data?.payload);
      // stop polling if user has responsed with yes / no
      shouldPollRef.current = false;
      // on approve/reject response from host, waiting room permission is reset
      setRoomInfo(prev => {
        return {
          ...prev,
          isInWaitingRoom: false,
          data: {...prev.data, token: rtc.token},
        };
      });
      if (approved) {
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

  useEffect(() => {
    setButtonText(
      waitingRoomButton({
        ready: !isInWaitingRoom,
      }),
    );
  }, [isInWaitingRoom]);

  const requestServerToJoinRoom = async () => {
    let pollingInterval = null;
    // polling for every 30 second
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
    pollingInterval = setInterval(pollFunction, 30000);
  };
  const onSubmit = () => {
    shouldPollRef.current = true;
    saveName(username?.trim());

    // Enter waiting rooom;
    setRoomInfo(prev => {
      return {...prev, isInWaitingRoom: true};
    });

    // join request API to server, server will send RTM message to all hosts regarding request from this user,
    requestServerToJoinRoom();
    // send a message to host for asking permission to enter the call , then set setCallActive(true) isInWaitingRoom:false
  };

  const title = buttonText;
  const onPress = () => onSubmit();
  const disabled = isInWaitingRoom || username === '';
  return props?.render ? (
    props.render(onPress, title, disabled)
  ) : (
    <PrimaryButton onPress={onPress} disabled={disabled} text={title} />
  );
};

export default JoinWaitingRoomBtn;
