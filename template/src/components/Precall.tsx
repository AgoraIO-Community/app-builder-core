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
import {RtcContext, PropsContext, ClientRole} from '../../agora-rn-uikit';
import {isValidReactComponent, isWeb} from '../utils/common';
import ColorContext from './ColorContext';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useFpe} from 'fpe-api';
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
import Logo from './common/Logo';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';

const JoinRoomInputView = () => {
  const {JoinButton, Textbox} = useFpe((data) => {
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

const JoinRoomName = () => {
  const {JoinButton, Textbox} = useFpe((data) => {
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
  return <Textbox />;
};

const JoinRoomButton = () => {
  const {JoinButton, Textbox} = useFpe((data) => {
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
  return <JoinButton />;
};

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);
  const {
    VideoPreview,
    MeetingName,
    DeviceSelect,
    PrecallAfterView,
    PrecallBeforeView,
  } = useFpe((data) => {
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
  const {isJoinDataFetched, meetingTitle} = useMeetingInfo();
  const rtc = useContext(RtcContext);
  const isSDK = isSDKCheck();

  const [dim, setDim] = useState<[number, number]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
  ]);

  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  useEffect(() => {
    if (isWeb && !isSDK) {
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

  const FpePrecallComponent = useFpe((data) => {
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
      <View style={style.main} onLayout={onLayout} testID="precall-screen">
        {/* Precall screen only changes for audience in Live Stream event */}
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          <View style={style.preCallContainer}>
            {/* <Logo /> */}
            <MeetingName />
            <JoinRoomInputView />
          </View>
        ) : (
          <>
            {/* <Logo /> */}
            <View style={style.container}>
              <View
                testID="precall-preview"
                style={[style.leftContent, !isMobileView() && style.boxStyle]}>
                <VideoPreview />
                {/* <PreCallLocalMute /> */}
                {isMobileView() && (
                  <View testID="precall-mobile-join">
                    {/* This view is visible only on MOBILE view */}
                    <JoinRoomInputView />
                  </View>
                )}
              </View>

              {/* This view is visible only on WEB view */}
              {!isMobileView() ? (
                <Card testID="precall-settings" style={style.rightContent}>
                  <View>
                    <MeetingName />
                    <Spacer size={50} />
                    <View>
                      <JoinRoomName />
                      <Spacer size={40} />
                      <DeviceSelect />
                      <Spacer size={60} />
                      <View style={{width: '100%'}}>
                        <JoinRoomButton />
                      </View>
                    </View>
                  </View>
                </Card>
              ) : (
                <View></View>
              )}
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
    marginHorizontal: '10%',
    minHeight: 500,
    justifyContent: 'center',
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    flex: 2.5,
    borderRadius: 12,
    height: '90vh',
  },
  boxStyle: {
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginRight: 24,
    borderWidth: 1,
    height: '100%',
  },
  rightContent: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 40,
    maxWidth: 450,
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
});

export default Precall;
