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
import {usePreCall} from 'fpe-api';
import {useString} from '../../utils/useString';
import {ChannelProfile, PropsContext} from '../../../agora-rn-uikit';
import {joinRoomButtonTextInterface} from 'src/language/i18nTypes';

const joinCallBtn: React.FC = () => {
  const {rtcProps} = useContext(PropsContext);
  const {setCallActive, queryComplete, username, error} = usePreCall(
    (data) => data,
  );
  const getMode = () =>
    $config.EVENT_MODE
      ? ChannelProfile.LiveBroadcasting
      : ChannelProfile.Communication;
  const joinRoomButton =
    useString<joinRoomButtonTextInterface>('joinRoomButton');

  const [buttonText, setButtonText] = React.useState(
    joinRoomButton({
      ready: queryComplete,
      mode: getMode(),
      role: rtcProps.role,
    }),
  );
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
      onPress={() => setCallActive(true)}
      disabled={!queryComplete || username === '' || error}
      text={buttonText}
    />
  );
};

export default joinCallBtn;
