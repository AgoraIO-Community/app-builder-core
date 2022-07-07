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
import mobileAndTabletCheck from '../../utils/isMobileOrTablet';
import {isWeb} from '../../utils/common';
import {useWakeLock} from '../../components/useWakeLock';

const audio = new Audio(
  'https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3',
);

const joinCallBtn: React.FC = () => {
  const {rtcProps} = useContext(PropsContext);
  const {setCallActive, queryComplete, username, error} = usePreCall(
    (data) => data,
  );
  const {awake, request} = useWakeLock();

  const getMode = () =>
    $config.EVENT_MODE
      ? ChannelProfile.LiveBroadcasting
      : ChannelProfile.Communication;
  const joinRoomButton =
    useString<JoinRoomButtonTextInterface>('joinRoomButton');

  const [buttonText, setButtonText] = React.useState(
    joinRoomButton({
      ready: queryComplete,
      mode: getMode(),
      role: rtcProps.role,
    }),
  );

  const onSubmit = () => {
    setCallActive(true);
    // Play a sound to avoid autoblocking in safari
    if (isWeb || mobileAndTabletCheck()) {
      audio.volume = 0;
      audio.play().then(() => {
        // pause directly once played
        audio.pause();
      });
    }
    // Avoid Sleep only on mobile browsers
    if (isWeb && mobileAndTabletCheck() && !awake) {
      // Request wake lock
      request();
    }
  };

  useEffect(() => {
    if (rtcProps?.role) {
      setButtonText(
        joinRoomButton({
          ready: queryComplete,
          mode: getMode(),
          role: rtcProps.role,
        }),
      );
    }
  }, [rtcProps?.role]);

  return (
    <PrimaryButton
      onPress={onSubmit}
      disabled={!queryComplete || username === '' || error ? true : false}
      text={buttonText}
    />
  );
};

export default joinCallBtn;
