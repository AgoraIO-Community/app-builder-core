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

  useEffect(() => {
    setButtonText(
      waitingRoomButton({
        ready: !isInWaitingRoom,
      }),
    );
  }, [isInWaitingRoom]);

  const onSubmit = () => {
    saveName(username?.trim());

    // Enter waiting rooom;
    setRoomInfo(prev => {
      return {...prev, isInWaitingRoom: true};
    });
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
