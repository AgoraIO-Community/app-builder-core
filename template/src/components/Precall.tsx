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
import React, {useState, useContext, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import {
  PropsContext,
  ClientRole,
} from '../../agora-rn-uikit';
import {cmpTypeGuard, hasBrandLogo} from '../utils/common';
import ColorContext from './ColorContext';
import { usePreCall } from './precall/usePreCall';
import PreCallLogo from './common/Logo';
import { useFpe } from 'fpe-api';
import VideoPreview from './precall/VideoPreview';
import PreCallLocalMute from './precall/LocalMute';
import selectDevice from './precall/selectDevice';
import { PreCallJoinBtn, PreCallTextInput, PreCallMeetingTitle } from './precall/index';

const JoinRoomInputView = () => {
  const {textBox, joinButton} = useFpe(data => typeof data.components?.precall === 'object' && data.components?.precall ? data.components?.precall : {});
  return (
    <View style={style.btnContainer}>
      {cmpTypeGuard(textBox, PreCallTextInput)}
      <View style={{height: 20}} />
      {cmpTypeGuard(joinButton, PreCallJoinBtn)}
    </View>
  );
};

const Precall = () => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);
  const {preview, deviceSelect, meetingName} = useFpe(data => 
    data.components?.precall && typeof data.components?.precall === 'object' ?
      data.components.precall : {}
  )
  const {queryComplete, title} = usePreCall(data =>data);

  const [dim, setDim] = useState<[number, number]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (title) {
        document.title = title + ' | ' + $config.APP_NAME;
      }
    }
  });

  const isMobileView = () => dim[0] < dim[1] + 150;

  if (!queryComplete) return <Text style={style.titleFont}>Loading..</Text>;

  const brandHolder = () => <PreCallLogo />
   

  return (
    <View style={style.main} onLayout={onLayout}>
      {/* Precall screen only changes for audience in Live Stream event */}
      {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
        <View style={style.preCallContainer}>
          {brandHolder()}
          {cmpTypeGuard(meetingName, PreCallMeetingTitle)}
          <JoinRoomInputView />
        </View>
      ) : (
        <>
          {brandHolder()}
          <View style={style.content}>
            <View style={style.upperContainer}>
              <View
                style={[
                  style.leftContent,
                  isMobileView() ? {paddingRight: 0} : {paddingRight: 40},
                ]}>
                {cmpTypeGuard(preview, VideoPreview)}
                <PreCallLocalMute />
                <View style={{marginBottom: '10%'}}>
                  {/* This view is visible only on MOBILE view */}
                  {isMobileView() && (
                    <JoinRoomInputView />
                  )}
                </View>
              </View>
              {/* This view is visible only on WEB view */}
              {!isMobileView() && (
                <View style={style.rightContent}>
                  {cmpTypeGuard(meetingName, PreCallMeetingTitle)}
                  <View
                    style={[{shadowColor: primaryColor}, style.precallPickers]}>
                    {cmpTypeGuard(deviceSelect, selectDevice)}
                    <View style={{width: '100%'}}>
                      <JoinRoomInputView />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    // justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
  },
  preCallContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 350,
    justifyContent: 'space-between',
    marginTop: '15%',
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flex: 6, flexDirection: 'column'},
  leftContent: {
    flex: 1.3,
    height: '100%',
  },
  upperContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 3,
  },
  rightContent: {
    flex: 1,
    height: '70%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '25',
    paddingLeft: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: $config.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  titleFont: {
    textAlign: 'center',
    fontSize: 20,
    color: $config.PRIMARY_FONT_COLOR,
  },
  titleHeading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
  },
  btnContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-around',
    marginBottom: '10%',
    height: '35%',
    minHeight: 280,
  },
});

export default Precall;
