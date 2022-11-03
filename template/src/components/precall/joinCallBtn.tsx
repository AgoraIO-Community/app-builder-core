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
import {usePreCall} from '../../components/precall/usePreCall';
import {useString} from '../../utils/useString';
import {ChannelProfile, PropsContext} from '../../../agora-rn-uikit';
import {JoinRoomButtonTextInterface} from '../../language/default-labels/precallScreenLabels';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import useGetName from '../../utils/useGetName';
import {useWakeLock} from '../../components/useWakeLock';
import isMobileOrTablet from '../../utils/isMobileOrTablet';
import {isWebInternal} from '../../utils/common';

const audio = new Audio(
  'https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3',
);

export interface PreCallJoinCallBtnProps {
  render?: (
    onPress: () => void,
    title: string,
    disabled: boolean,
  ) => JSX.Element;
}

const JoinCallBtn = (props: PreCallJoinCallBtnProps) => {
  const {rtcProps} = useContext(PropsContext);
  const {setCallActive} = usePreCall();
  const username = useGetName();
  const {isJoinDataFetched} = useMeetingInfo();
  const {awake, request} = useWakeLock();
  const joinRoomButton =
    useString<JoinRoomButtonTextInterface>('joinRoomButton');

  const [buttonText, setButtonText] = React.useState(
    joinRoomButton({
      ready: isJoinDataFetched,
      role: $config.EVENT_MODE ? rtcProps.role : undefined,
    }),
  );

  const onSubmit = () => {
    setCallActive(true);
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
    if (rtcProps?.role) {
      setButtonText(
        joinRoomButton({
          ready: isJoinDataFetched,
          role: $config.EVENT_MODE ? rtcProps.role : undefined,
        }),
      );
    }
  }, [rtcProps?.role]);

  const title = buttonText;
  const onPress = () => onSubmit();
  const disabled = !isJoinDataFetched || username === '';
  return props?.render ? (
    props.render(onPress, title, disabled)
  ) : (
    <PrimaryButton onPress={onPress} disabled={disabled} text={title} />
  );
};

export default JoinCallBtn;
