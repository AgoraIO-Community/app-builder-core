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
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import {isValidReactComponent, isWebInternal} from '../utils/common';
import ColorContext from './ColorContext';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import PreCallLogo from './common/Logo';
import {useCustomization} from 'customization-implementation';
import PreCallLocalMute from './precall/LocalMute';
import {
  PreCallJoinBtn,
  PreCallTextInput,
  PreCallMeetingTitle,
  PreCallSelectDevice,
  PreCallVideoPreview,
} from './precall/index';
import SDKEvents from '../utils/SdkEvents';
import isSDKCheck from '../utils/isSDK';
import {useRtc} from 'customization-api';

const JoinRoomInputView = () => {
  const {JoinButton, Textbox} = useCustomization((data) => {
    let components: {
      JoinButton: React.ComponentType;
      Textbox: React.ComponentType;
    } = {Textbox: PreCallTextInput, JoinButton: PreCallJoinBtn};
    // commented for v1 release
    // if (
    //   data?.components?.precall &&
    //   typeof data?.components?.precall === 'object'
    // ) {
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
    // }
    return components;
  });
  return (
    <View style={style.btnContainer}>
      <Textbox />
      <View style={{height: 20}} />
      <JoinButton />
    </View>
  );
};

const Precall = () => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);
  const {
    VideoPreview,
    MeetingName,
    DeviceSelect,
    PrecallAfterView,
    PrecallBeforeView,
  } = useCustomization((data) => {
    const components: {
      PrecallAfterView: React.ComponentType;
      PrecallBeforeView: React.ComponentType;
      DeviceSelect: React.ComponentType;
      VideoPreview: React.ComponentType;
      MeetingName: React.ComponentType;
    } = {
      PrecallAfterView: React.Fragment,
      PrecallBeforeView: React.Fragment,
      MeetingName: PreCallMeetingTitle,
      VideoPreview: PreCallVideoPreview,
      DeviceSelect: PreCallSelectDevice,
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
    //     data?.components?.precall?.deviceSelect &&
    //     typeof data?.components?.precall?.deviceSelect !== 'object'
    //   ) {
    //     if (isValidReactComponent(data?.components?.precall?.deviceSelect)) {
    //       components.DeviceSelect = data?.components?.precall?.deviceSelect;
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
  const {
    isJoinDataFetched,
    data: {meetingTitle},
  } = useMeetingInfo();
  const rtc = useRtc();
  const isSDK = isSDKCheck();

  const [dim, setDim] = useState<[number, number]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  useEffect(() => {
    if (isWebInternal() && !isSDK) {
      if (meetingTitle) {
        document.title = meetingTitle + ' | ' + $config.APP_NAME;
      }
    }
  });

  useEffect(() => {
    if (isJoinDataFetched) {
      new Promise((res) =>
        // @ts-ignore
        rtc.RtcEngine.getDevices(function (devices: MediaDeviceInfo[]) {
          res(devices);
        }),
      ).then((devices: MediaDeviceInfo[]) => {
        SDKEvents.emit('preJoin', meetingTitle, devices);
      });
    }
  }, [isJoinDataFetched]);

  const isMobileView = () => dim[0] < dim[1] + 150;

  if (!isJoinDataFetched) return <Text style={style.titleFont}>Loading..</Text>;

  const brandHolder = () => <PreCallLogo />;

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
      <View style={style.main} onLayout={onLayout}>
        {/* Precall screen only changes for audience in Live Stream event */}
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          <View style={style.preCallContainer}>
            {brandHolder()}
            <MeetingName />
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
                  <VideoPreview />
                  <PreCallLocalMute />
                  <View style={{marginBottom: '10%'}}>
                    {/* This view is visible only on MOBILE view */}
                    {isMobileView() && <JoinRoomInputView />}
                  </View>
                </View>
                {/* This view is visible only on WEB view */}
                {!isMobileView() && (
                  <View style={style.rightContent}>
                    <MeetingName />
                    <View
                      style={[
                        {shadowColor: primaryColor},
                        style.precallPickers,
                      ]}>
                      <DeviceSelect />
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
      <PrecallAfterView />
    </>
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
