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
import RtmEngine, {RtmMessage, RtmChannelMember} from 'agora-react-native-rtm';
import {PropsContext} from '../../agora-rn-uikit';
import RTMContext from './RTMContext';
import RTMEngine from './RTMEngine';

const RTMConfigure = (props: any) => {
  const {callActive} = props;

  let engine = useRef<RtmEngine>(null!);
  let localUid = useRef<string>('');
  const timerValueRef: any = useRef(5);
  const {rtcProps} = useContext(PropsContext);

  //  States
  const [login, setLogin] = useState<boolean>(false);

  // Step 1: Check if call is active, if yes then init RTM
  useEffect(() => {
    callActive
      ? init()
      : (console.log('RTM Debug: waiting to init RTM'), setLogin(true));
    return () => {
      end();
    };
  }, [rtcProps.channel, rtcProps.appId, callActive]);

  /** ********************    RTM Lifecycle methods starts     ******************** */
  // Step 2: Create engine, setup listeners, create client and then call login
  const init = async () => {
    engine.current = RTMEngine.getInstance().engine;
    console.log('RTM debug: COPY engine.current: ', engine.current);

    engine.current.addListener(
      'ChannelMemberJoined',
      (member: RtmChannelMember) => {
        // Update attributes
      },
    );
    engine.current.addListener(
      'ChannelMemberLeft',
      (member: RtmChannelMember) => {
        // update local state
      },
    );
    engine.current.addListener(
      'MessageReceived',
      (message: RtmMessage, peerId: string) => {},
    );
    engine.current.addListener(
      'ChannelMessageReceived',
      (message: RtmMessage, fromMember: RtmChannelMember) => {},
    );

    doLoginAndSetupRTM();
  };

  // Step 3: Login the user and then call set attributes
  const doLoginAndSetupRTM = async () => {
    try {
      await engine.current.loginV2(localUid.current, rtcProps?.rtm);
      timerValueRef.current = 5;
      setAttribute();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        doLoginAndSetupRTM();
      }, timerValueRef.current * 1000);
    }
  };

  // Step 4: Set Attributes and then call join channel
  const setAttribute = async () => {
    try {
      await engine.current.setLocalUserAttributesV2([
        {key: 'name', value: 'supriya'},
      ]);
      timerValueRef.current = 5;
      joinChannel();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        setAttribute();
      }, timerValueRef.current * 1000);
    }
  };

  // Step 5: Join channel and then call getMembersInChannel to get details of members in channel
  const joinChannel = async () => {
    try {
      await engine.current.joinChannel(rtcProps.channel);
      timerValueRef.current = 5;
      getMembersInChannel();
    } catch (error) {
      setTimeout(async () => {
        timerValueRef.current = timerValueRef.current + timerValueRef.current;
        joinChannel();
      }, timerValueRef.current * 1000);
    }
  };

  // Step 6: Get members in channel and set their details
  const getMembersInChannel = async () => {
    console.log('RTM debug: membrs in channel');
  };

  const end = async () => {
    callActive
      ? (await (engine.current as RtmEngine).logout(),
        await (engine.current as RtmEngine).release(),
        console.log('RTM Debug: cleanup done'))
      : {};
  };
  /** ********************    RTM Lifecycle methods end   ******************** */

  return (
    <RTMContext.Provider
      value={{
        engine: engine.current,
        localUid: localUid.current,
      }}>
      {login ? props.children : <></>}
    </RTMContext.Provider>
  );
};

export default RTMConfigure;
