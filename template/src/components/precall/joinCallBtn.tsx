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
import {useFpe} from 'fpe-api';
import {isValidReactComponent} from '../../utils/common';

const joinCallBtn: React.FC = () => {
  const {rtcProps} = useContext(PropsContext);
  const {setCallActive} = usePreCall();
  const username = useGetName();
  const {isJoinDataFetched} = useMeetingInfo();
  const getMode = () =>
    $config.EVENT_MODE
      ? ChannelProfile.LiveBroadcasting
      : ChannelProfile.Communication;
  const joinRoomButton =
    useString<JoinRoomButtonTextInterface>('joinRoomButton');

  const [buttonText, setButtonText] = React.useState(
    joinRoomButton({
      ready: isJoinDataFetched,
      mode: getMode(),
      role: rtcProps.role,
    }),
  );
  useEffect(() => {
    if (rtcProps?.role) {
      setButtonText(
        joinRoomButton({
          ready: isJoinDataFetched,
          mode: getMode(),
          role: rtcProps.role,
        }),
      );
    }
  }, [rtcProps?.role]);

  const {JoinButtonAfterView, JoinButtonBeforeView} = useFpe((data) => {
    let components: {
      JoinButtonAfterView: React.ComponentType;
      JoinButtonBeforeView: React.ComponentType;
    } = {
      JoinButtonAfterView: React.Fragment,
      JoinButtonBeforeView: React.Fragment,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data?.components?.precall?.joinButton &&
        typeof data?.components?.precall?.joinButton === 'object'
      ) {
        if (
          data?.components?.precall?.joinButton?.before &&
          isValidReactComponent(data?.components?.precall?.joinButton?.before)
        ) {
          components.JoinButtonBeforeView =
            data?.components?.precall?.joinButton?.before;
        }
        if (
          data?.components?.precall?.joinButton?.after &&
          isValidReactComponent(data?.components?.precall?.joinButton?.after)
        ) {
          components.JoinButtonAfterView =
            data?.components?.precall?.joinButton?.after;
        }
      }
    }
    return components;
  });

  return (
    <>
      <JoinButtonBeforeView />
      <PrimaryButton
        onPress={() => setCallActive(true)}
        disabled={!isJoinDataFetched || username === ''}
        text={buttonText}
      />
      <JoinButtonAfterView />
    </>
  );
};

export default joinCallBtn;
