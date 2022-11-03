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
import {useCustomization} from 'customization-implementation';
import {useString} from '../utils/useString';
import {isValidReactComponent} from '../utils/common';
import {
  PreCallJoinBtn,
  PreCallVideoPreview,
  PreCallTextInput,
  PreCallLocalMute,
  PreCallMeetingTitle,
} from './precall/index';

const Precall = () => {
  const {rtcProps} = useContext(PropsContext);
  //commented for v1 release
  //const precallLabel = useString('precallLabel')();
  const precallLabel = 'Precall';

  const {
    VideoPreview,
    MeetingName,
    JoinButton,
    Textbox,
    PrecallAfterView,
    PrecallBeforeView,
  } = useCustomization((data) => {
    const components: {
      PrecallAfterView: React.ComponentType;
      PrecallBeforeView: React.ComponentType;
      VideoPreview: React.ComponentType;
      MeetingName: React.ComponentType;
      JoinButton: React.ComponentType;
      Textbox: React.ComponentType;
    } = {
      PrecallAfterView: React.Fragment,
      PrecallBeforeView: React.Fragment,
      JoinButton: PreCallJoinBtn,
      MeetingName: PreCallMeetingTitle,
      Textbox: PreCallTextInput,
      VideoPreview: PreCallVideoPreview,
    };
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
    //   if (
    //     data?.components?.precall?.after &&
    //     isValidReactComponent(data?.components?.precall?.after)
    //   ) {
    //     components.PrecallAfterView = data?.components?.precall?.after;
    //   }
    //   if (
    //     data?.components?.precall?.before &&
    //     isValidReactComponent(data?.components?.precall?.before)
    //   ) {
    //     components.PrecallBeforeView = data?.components?.precall?.before;
    //   }

    //   if (
    //     data?.components?.precall?.meetingName &&
    //     typeof data?.components?.precall?.meetingName !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.meetingName)) {
    //       components.MeetingName = data?.components?.precall?.meetingName;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.joinButton &&
    //     typeof data?.components?.precall?.joinButton !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.joinButton)) {
    //       components.JoinButton = data?.components?.precall?.joinButton;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.textBox &&
    //     typeof data?.components?.precall?.textBox !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.textBox)) {
    //       components.Textbox = data?.components?.precall?.textBox;
    //     }
    //   }

    //   if (
    //     data?.components?.precall?.preview &&
    //     typeof data?.components?.precall?.preview !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.preview)) {
    //       components.VideoPreview = data?.components?.precall?.preview;
    //     }
    //   }
    // }
    return components;
  });
  const isAudienceInLiveStreaming = () =>
    $config.EVENT_MODE && rtcProps?.role == ClientRole.Audience;

  const FpePrecallComponent = useCustomization((data) => {
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall !== 'object'
    // ) {
    //   if (isValidReactComponent(data?.components?.precall)) {
    //     return data?.components?.precall;
    //   }
    //   return undefined;
    // }
    return undefined;
  });

  return FpePrecallComponent ? (
    <FpePrecallComponent />
  ) : (
    <>
      <PrecallBeforeView />
      <View style={style.full}>
        <View style={style.heading}>
          <Text style={style.headingText}>{precallLabel}</Text>
        </View>
        <MeetingName />
        {!isAudienceInLiveStreaming() && (
          <View style={style.full}>
            <VideoPreview />
          </View>
        )}
        <View style={style.textInputHolder}>
          <Textbox />
        </View>
        <View style={{height: 20}} />
        {!isAudienceInLiveStreaming() && (
          <View style={style.controls}>
            <PreCallLocalMute />
          </View>
        )}
        <View style={{marginBottom: 50, alignItems: 'center'}}>
          <JoinButton />
        </View>
      </View>
      <PrecallAfterView />
    </>
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
