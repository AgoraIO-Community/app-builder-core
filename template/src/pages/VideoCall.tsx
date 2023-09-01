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
import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import {
  RtcConfigure,
  PropsProvider,
  ClientRole,
  ChannelProfile,
  LocalUserContext,
  UidType,
  CallbacksInterface,
  ToggleState,
} from '../../agora-rn-uikit';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';
import Logo from '../subComponents/Logo';
import {useHasBrandLogo, isArray, isMobileUA} from '../utils/common';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {videoView} from '../../theme.json';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {ErrorContext} from '.././components/common/index';
import {PreCallProvider} from '../components/precall/usePreCall';
import {LayoutProvider} from '../utils/useLayout';
import {useCustomization} from 'customization-implementation';
import Precall from '../components/Precall';
import {useString} from '../utils/useString';
import useLayoutsData from './video-call/useLayoutsData';
import {RecordingProvider} from '../subComponents/recording/useRecording';
import useJoinMeeting from '../utils/useJoinMeeting';
import {
  useMeetingInfo,
  MeetingInfoDefaultValue,
  validateMeetingInfoData,
} from '../components/meeting-info/useMeetingInfo';
import {SidePanelProvider} from '../utils/useSidePanel';
import VideoCallScreen from './video-call/VideoCallScreen';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import CustomUserContextHolder from './video-call/CustomUserContextHolder';
import {ChatNotificationProvider} from '../components/chat-notification/useChatNotification';
import {ChatUIControlProvider} from '../components/chat-ui/useChatUIControl';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import {ScreenShareProvider} from '../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../components/contexts/VideoMeetingDataContext';
import {WhiteboardProvider} from '../components/contexts/WhiteboardContext';
import {useWakeLock} from '../components/useWakeLock';
import SDKEvents from '../utils/SdkEvents';
import {UserPreferenceProvider} from '../components/useUserPreference';
import EventsConfigure from '../components/EventsConfigure';
import {useAuth} from '../auth/AuthProvider';
import PermissionHelper from '../components/precall/PermissionHelper';
import {currentFocus, FocusProvider} from '../utils/useFocus';
import {VideoCallProvider} from '../components/useVideoCall';
import {SdkApiContext, SDK_MEETING_TAG} from '../components/SdkApiContext';
import isSDK from '../utils/isSDK';
import {useSetMeetingInfo} from '../components/meeting-info/useSetMeetingInfo';
import {CaptionProvider} from '../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../components/SdkMuteToggleListener';
import StorageContext from '../components/StorageContext';
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
  const hasBrandLogo = useHasBrandLogo();
  //commented for v1 release
  //const joiningLoaderLabel = useString('joiningLoaderLabel')();
  const joiningLoaderLabel = 'Starting Call. Just a second.';
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const {awake, release} = useWakeLock();
  const [callActive, setCallActive] = useState($config.PRECALL ? false : true);

  //layouts
  const layouts = useLayoutsData();
  const defaultLayoutName = isArray(layouts) ? layouts[0].name : '';
  const [currentLayout, setLayout] = useState(defaultLayoutName);
  //layouts

  const [isRecordingActive, setRecordingActive] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanelType>(SidePanelType.None);
  const [currentFocus, setFocus] = useState<currentFocus>({
    editName: false,
  });
  const {phrase} = useParams<{phrase: string}>();

  const {store} = useContext(StorageContext);
  const {
    join: SdkJoinState,
    microphoneDevice: sdkMicrophoneDevice,
    cameraDevice: sdkCameraDevice,
    clearState,
  } = useContext(SdkApiContext);

  // commented for v1 release
  //const lifecycle = useCustomization((data) => data.lifecycle);
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
    audioRoom: $config.AUDIO_ROOM,
    activeSpeaker: $config.ACTIVE_SPEAKER,
    preferredCameraId:
      sdkCameraDevice.deviceId || store?.activeDeviceId?.videoinput || null,
    preferredMicrophoneId:
      sdkMicrophoneDevice.deviceId || store?.activeDeviceId?.audioinput || null,
  });

  const history = useHistory();
  const currentMeetingPhrase = useRef(history.location.pathname);

  const useJoin = useJoinMeeting();
  const {setMeetingInfo} = useSetMeetingInfo();
  const {isJoinDataFetched, data} = useMeetingInfo();

  React.useEffect(() => {
    return () => {
      console.log('Videocall unmounted');
      setMeetingInfo(MeetingInfoDefaultValue);
      if (awake) {
        release();
      }
    };
  }, []);

  useEffect(() => {
    if (!SdkJoinState.phrase) {
      useJoin(phrase)
        .then(() => {})
        .catch((error) => {
          setGlobalErrorMessage(error);
          history.push('/');
        });
    }
  }, []);

  useEffect(() => {
    if (!isSDK() || !SdkJoinState.initialized) {
      return;
    }
    const {
      phrase: sdkMeetingPhrase,
      meetingDetails: sdkMeetingDetails,
      skipPrecall,
      promise,
    } = SdkJoinState;

    const sdkMeetingPath = `/${sdkMeetingPhrase}`;

    setCallActive(skipPrecall);

    if (sdkMeetingDetails) {
      setQueryComplete(false);
      setMeetingInfo((meetingInfo) => {
        return {
          isJoinDataFetched: true,
          data: {
            ...meetingInfo.data,
            ...sdkMeetingDetails,
          },
        };
      });
    } else if (sdkMeetingPhrase) {
      setQueryComplete(false);
      currentMeetingPhrase.current = sdkMeetingPath;
      useJoin(sdkMeetingPhrase).catch((error) => {
        setGlobalErrorMessage(error);
        history.push('/');
        currentMeetingPhrase.current = '';
        promise.rej(error);
      });
    }
  }, [SdkJoinState]);

  React.useEffect(() => {
    if (isJoinDataFetched === true && !queryComplete) {
      setRtcProps((prevRtcProps) => ({
        ...prevRtcProps,
        channel: data.channel,
        uid: data.uid,
        token: data.token,
        rtm: data.rtmToken,
        encryption: $config.ENCRYPTION_ENABLED
          ? {
              key: data.encryptionSecret,
              mode: RnEncryptionEnum.AES128XTS,
              screenKey: data.encryptionSecret,
            }
          : false,
        screenShareUid: data.screenShareUid,
        screenShareToken: data.screenShareToken,
        role: data.isHost ? ClientRole.Broadcaster : ClientRole.Audience,
      }));

      // 1. Store the display name from API
      // if (data.username) {
      //   setUsername(data.username);
      // }
      setQueryComplete(true);
    }
  }, [isJoinDataFetched, data, queryComplete]);

  const callbacks: CallbacksInterface = {
    // RtcLeft: () => {},
    // RtcJoined: () => {
    //   if (SdkJoinState.phrase && SdkJoinState.skipPrecall) {
    //     SdkJoinState.promise?.res();
    //   }
    // },
    EndCall: () => {
      clearState('join');
      setTimeout(() => {
        // TODO: These callbacks are being called twice
        SDKEvents.emit('leave');
        history.push('/');
      }, 0);
    },
    UserJoined: (uid: UidType) => {
      console.log('UIKIT Callback: UserJoined', uid);
      SDKEvents.emit('rtc-user-joined', uid);
    },
    UserOffline: (uid: UidType) => {
      console.log('UIKIT Callback: UserOffline', uid);
      SDKEvents.emit('rtc-user-joined', uid);
    },
    RemoteAudioStateChanged: (uid: UidType, status: 0 | 2) => {
      console.log('UIKIT Callback: RemoteAudioStateChanged', uid, status);
      if (status === 0) {
        SDKEvents.emit('rtc-user-unpublished', uid, 'audio');
      } else {
        SDKEvents.emit('rtc-user-published', uid, 'audio');
      }
    },
    RemoteVideoStateChanged: (uid: UidType, status: 0 | 2) => {
      console.log('UIKIT Callback: RemoteVideoStateChanged', uid, status);
      if (status === 0) {
        SDKEvents.emit('rtc-user-unpublished', uid, 'video');
      } else {
        SDKEvents.emit('rtc-user-published', uid, 'video');
      }
    },
  };
  const [isCameraAvailable, setCameraAvailable] = useState(false);
  const [isMicAvailable, setMicAvailable] = useState(false);
  const [isSpeakerAvailable, setSpeakerAvailable] = useState(false);
  const [isPermissionRequested, setIsPermissionRequested] = useState(false);
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
                      <LayoutProvider
                        value={{
                          currentLayout,
                          setLayout,
                        }}>
                        <FocusProvider value={{currentFocus, setFocus}}>
                          <SidePanelProvider
                            value={{
                              sidePanel,
                              setSidePanel,
                            }}>
                            <ChatMessagesProvider>
                              <ScreenShareProvider>
                                <RtmConfigure
                                  setRecordingActive={setRecordingActive}
                                  callActive={callActive}>
                                  <UserPreferenceProvider>
                                    <WhiteboardProvider>
                                      <RecordingProvider
                                        value={{
                                          setRecordingActive,
                                          isRecordingActive,
                                        }}>
                                        <ScreenshareConfigure>
                                          <EventsConfigure>
                                            <LiveStreamContextProvider
                                              value={{
                                                setRtcProps,
                                                rtcProps,
                                                callActive,
                                              }}>
                                              <LiveStreamDataProvider>
                                                <LocalUserContext
                                                  localUid={rtcProps?.uid}>
                                                  <CustomUserContextHolder>
                                                    <NetworkQualityProvider>
                                                      {!isMobileUA() && (
                                                        <PermissionHelper />
                                                      )}
                                                      <SdkMuteToggleListener>
                                                        {callActive ? (
                                                          <VideoMeetingDataProvider>
                                                            <VideoCallProvider>
                                                              <CaptionProvider>
                                                                <VideoCallScreen />
                                                              </CaptionProvider>
                                                            </VideoCallProvider>
                                                          </VideoMeetingDataProvider>
                                                        ) : $config.PRECALL ? (
                                                          <PreCallProvider
                                                            value={{
                                                              callActive,
                                                              setCallActive,
                                                              isCameraAvailable,
                                                              isMicAvailable,
                                                              setCameraAvailable,
                                                              setMicAvailable,
                                                              isPermissionRequested,
                                                              setIsPermissionRequested,
                                                              isSpeakerAvailable,
                                                              setSpeakerAvailable,
                                                            }}>
                                                            <Precall />
                                                          </PreCallProvider>
                                                        ) : (
                                                          <></>
                                                        )}
                                                      </SdkMuteToggleListener>
                                                    </NetworkQualityProvider>
                                                  </CustomUserContextHolder>
                                                </LocalUserContext>
                                              </LiveStreamDataProvider>
                                            </LiveStreamContextProvider>
                                          </EventsConfigure>
                                        </ScreenshareConfigure>
                                      </RecordingProvider>
                                    </WhiteboardProvider>
                                  </UserPreferenceProvider>
                                </RtmConfigure>
                              </ScreenShareProvider>
                            </ChatMessagesProvider>
                          </SidePanelProvider>
                        </FocusProvider>
                      </LayoutProvider>
                    </ChatNotificationProvider>
                  </ChatUIControlProvider>
                </DeviceConfigure>
              </RtcConfigure>
            </PropsProvider>
          </>
        ) : (
          <View style={style.loader}>
            <View style={style.loaderLogo}>{hasBrandLogo() && <Logo />}</View>
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
  theme: $config.PRIMARY_ACTION_BRAND_COLOR,
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
  loaderText: {fontWeight: '500', color: $config.FONT_COLOR},
});

export default VideoCall;
