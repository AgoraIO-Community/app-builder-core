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
// @ts-nocheck
import React, {useState, useContext, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  RtcConfigure,
  PropsProvider,
  ClientRole,
  ChannelProfile,
  LocalUserContext,
} from '../../agora-rn-uikit';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';
import Logo from '../subComponents/Logo';
import {hasBrandLogo, isArray} from '../utils/common';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {videoView} from '../../theme.json';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {ErrorContext} from '.././components/common/index';
import {PreCallProvider} from '../components/precall/usePreCall';
import {LayoutProvider} from '../utils/useLayout';
import {useFpe} from 'fpe-api';
import Precall from '../components/Precall';
import {useString} from '../utils/useString';
import useCustomLayout from './video-call/CustomLayout';
import {RecordingProvider} from '../subComponents/recording/useRecording';
import useJoinMeeting from '../utils/useJoinMeeting';
import {useMeetingInfo} from '../components/meeting-info/useMeetingInfo';
import {SidePanelProvider} from '../utils/useSidePanel';
import VideoCallScreen from './video-call/VideoCallScreen';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import CustomUserContextHolder from './video-call/CustomUserContextHolder';
import {ChatNotificationProvider} from '../components/chat-notification/useChatNotification';
import {ChatUIControlProvider} from '../components/chat-ui/useChatUIControl';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import {ScreenShareProvider} from '../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../components/contexts/LiveStreamDataContext';
import {WhiteboardProvider} from '../components/contexts/WhiteboardContext';
import {useWakeLock} from '../components/useWakeLock';
import StorageContext from '../components/StorageContext';
import SDKEvents from '../utils/SdkEvents';

enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
}

const VideoCall: React.FC = () => {
  //commented for v1 release
  //const joiningLoaderLabel = useString('joiningLoaderLabel')();
  const joiningLoaderLabel = 'Starting Call. Just a second.';
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const {awake, release} = useWakeLock();
  const [callActive, setCallActive] = useState($config.PRECALL ? false : true);

  //layouts
  const layouts = useCustomLayout();
  const defaultLayoutName = isArray(layouts) ? layouts[0].name : '';
  const [activeLayoutName, setActiveLayoutName] = useState(defaultLayoutName);
  //layouts

  const [isRecordingActive, setRecordingActive] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanelType>(SidePanelType.None);
  const {phrase} = useParams<{phrase: string}>();
  // commented for v1 release
  //const lifecycle = useFpe((data) => data.lifecycle);
  const [rtcProps, setRtcProps] = React.useState({
    appId: $config.APP_ID,
    channel: null,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    profile: $config.PROFILE,
    dual: true,
    encryption: $config.ENCRYPTION_ENABLED
      ? {key: null, mode: RnEncryptionEnum.AES128XTS, screenKey: null}
      : false,
    role: ClientRole.Broadcaster,
    geoFencing: $config.GEO_FENCING,
  });

  const useJoin = useJoinMeeting();

  React.useEffect(() => {
    return () => {
      console.log('Videocall unmounted');
      if (awake) {
        release();
      }
    };
  }, []);

  useEffect(() => {
    try {
      useJoin(phrase);
    } catch (error) {
      setGlobalErrorMessage(error);
    }
  }, []);

  const data = useMeetingInfo();

  React.useEffect(() => {
    if (data.isJoinDataFetched === true) {
      setRtcProps({
        appId: $config.APP_ID,
        channel: data.channel,
        uid: data.uid,
        token: data.token,
        rtm: data.rtm,
        dual: true,
        profile: $config.PROFILE,
        encryption: $config.ENCRYPTION_ENABLED
          ? {
              key: data.secret,
              mode: RnEncryptionEnum.AES128XTS,
              screenKey: data.secret,
            }
          : false,
        screenShareUid: data.screenShareUid,
        screenShareToken: data.screenShareToken,
        role: data.isHost ? ClientRole.Broadcaster : ClientRole.Audience,
        geoFencing: $config.GEO_FENCING,
      });

      // 1. Store the display name from API
      // if (data.username) {
      //   setUsername(data.username);
      // }
      queryComplete ? {} : setQueryComplete(data.isJoinDataFetched);
    }
  }, [data?.isJoinDataFetched]);

  const history = useHistory();
  const callbacks = {
    EndCall: () =>
      setTimeout(() => {
        SDKEvents.emit('leave');
        history.push('/');
      }, 0),
  };

  return (
    <>
      {queryComplete ? (
        queryComplete || !callActive ? (
          <>
            <PropsProvider
              value={{
                rtcProps: {
                  ...rtcProps,
                  callActive,
                  // commented for v1 release
                  //lifecycle,
                },
                callbacks,
                styleProps,
                mode: $config.EVENT_MODE
                  ? ChannelProfile.LiveBroadcasting
                  : ChannelProfile.Communication,
              }}>
              <RtcConfigure>
                <DeviceConfigure>
                  <ChatUIControlProvider>
                    <ChatNotificationProvider>
                      <ChatMessagesProvider>
                        <SidePanelProvider
                          value={{
                            sidePanel,
                            setSidePanel,
                          }}>
                          <ScreenShareProvider>
                            <RtmConfigure
                              setRecordingActive={setRecordingActive}
                              callActive={callActive}>
                              <WhiteboardProvider>
                                <LayoutProvider
                                  value={{
                                    activeLayoutName,
                                    setActiveLayoutName,
                                  }}>
                                  <RecordingProvider
                                    value={{
                                      setRecordingActive,
                                      isRecordingActive,
                                    }}>
                                    <ScreenshareConfigure>
                                      <LiveStreamContextProvider
                                        value={{
                                          setRtcProps,
                                          rtcProps,
                                          callActive,
                                        }}>
                                        <LiveStreamDataProvider>
                                          <LocalUserContext
                                            localUid={rtcProps?.uid || 0}>
                                            <CustomUserContextHolder>
                                              <NetworkQualityProvider>
                                                {callActive ? (
                                                  <VideoCallScreen />
                                                ) : $config.PRECALL ? (
                                                  <PreCallProvider
                                                    value={{
                                                      callActive,
                                                      setCallActive,
                                                    }}>
                                                    <Precall />
                                                  </PreCallProvider>
                                                ) : (
                                                  <></>
                                                )}
                                              </NetworkQualityProvider>
                                            </CustomUserContextHolder>
                                          </LocalUserContext>
                                        </LiveStreamDataProvider>
                                      </LiveStreamContextProvider>
                                    </ScreenshareConfigure>
                                  </RecordingProvider>
                                </LayoutProvider>
                              </WhiteboardProvider>
                            </RtmConfigure>
                          </ScreenShareProvider>
                        </SidePanelProvider>
                      </ChatMessagesProvider>
                    </ChatNotificationProvider>
                  </ChatUIControlProvider>
                </DeviceConfigure>
              </RtcConfigure>
            </PropsProvider>
          </>
        ) : (
          <View style={style.loader}>
            <View style={style.loaderLogo}>{hasBrandLogo && <Logo />}</View>
            <Text style={style.loaderText}>{joiningLoaderLabel}</Text>
          </View>
        )
      ) : (
        <></>
      )}
    </>
  );
};

const styleProps = {
  maxViewStyles: styles.temp,
  minViewStyles: styles.temp,
  localBtnContainer: styles.bottomBar,
  localBtnStyles: {
    muteLocalAudio: styles.localButton,
    muteLocalVideo: styles.localButton,
    switchCamera: styles.localButton,
    endCall: styles.endCall,
    fullScreen: styles.localButton,
    recording: styles.localButton,
    screenshare: styles.localButton,
  },
  theme: $config.PRIMARY_COLOR,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
    liveStreamHostControlBtns: styles.liveStreamHostControlBtns,
  },
  BtnStyles: styles.remoteButton,
};
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: videoView,
  loader: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loaderLogo: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loaderText: {fontWeight: '500', color: $config.PRIMARY_FONT_COLOR},
});

export default VideoCall;
