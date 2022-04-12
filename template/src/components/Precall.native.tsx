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
import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ClientRole, PropsContext} from '../../agora-rn-uikit';
import {RtcContext} from '../../agora-rn-uikit';
import {useFpe} from 'fpe-api';
import {useString} from '../utils/useString';
import {cmpTypeGuard} from '../utils/common';
import {
  PreCallJoinBtn,
  PreCallVideoPreview,
  PreCallTextInput,
  PreCallLocalMute,
  PreCallMeetingTitle,
} from './precall/index';

const Precall = () => {
  const rtc = useContext(RtcContext);
  const {rtcProps} = useContext(PropsContext);
  rtc.RtcEngine.startPreview();

  const {preview, meetingName, joinButton, textBox} = useFpe((data) =>
    data?.components?.precall ? data?.components.precall : {},
  );
  const isAudienceInLiveStreaming = () =>
    $config.EVENT_MODE && rtcProps?.role == ClientRole.Audience;
  return (
    <View style={style.full}>
      <View style={style.heading}>
        <Text style={style.headingText}>{useString('precallLabel')()} </Text>
      </View>
      {cmpTypeGuard(PreCallMeetingTitle, meetingName)}
      {!isAudienceInLiveStreaming() && (
        <View style={style.full}>
          {cmpTypeGuard(PreCallVideoPreview, preview)}
        </View>
      )}
      <View style={style.textInputHolder}>
        {cmpTypeGuard(PreCallTextInput, textBox)}
      </View>
      <View style={{height: 20}} />
      {!isAudienceInLiveStreaming() && (
        <View style={style.controls}>
          <PreCallLocalMute />
        </View>
      )}
      <View style={{marginBottom: 50, alignItems: 'center'}}>
        {cmpTypeGuard(PreCallJoinBtn, joinButton)}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'center',
  },
  heading: {flex: 0.1, justifyContent: 'center'},
  headingText: {
    fontSize: 24,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '700',
    alignSelf: 'center',
  },
  textInputHolder: {
    flex: 0.1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  textInput: {
    width: '80%',
    paddingLeft: 8,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 2,
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    minHeight: 45,
    alignSelf: 'center',
  },
  controls: {
    flex: 0.2,
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 5,
  },
  width50: {width: 50},
  buttonActive: {
    backgroundColor: $config.PRIMARY_COLOR,
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  buttonDisabled: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    height: 50,
    width: 180,
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  buttonText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  titleHeading: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
});

export default Precall;
