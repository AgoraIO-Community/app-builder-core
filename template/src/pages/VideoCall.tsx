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
import React, {useState, useContext, useEffect, useRef, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {
  RtcConfigure,
  PropsProvider,
  ClientRoleType,
  ChannelProfileType,
  LocalUserContext,
  UidType,
  CallbacksInterface,
  RtcPropsInterface,
} from '../../agora-rn-uikit';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import RtmConfigure from '../components/RTMConfigure';
import RTMConfigureMainRoomProvider from '../rtm/RTMConfigureMainRoomProvider';
import DeviceConfigure from '../components/DeviceConfigure';
import Logo from '../subComponents/Logo';
import {useHasBrandLogo, isMobileUA, isWebInternal} from '../utils/common';
import {videoView} from '../../theme.json';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {ErrorContext} from '.././components/common/index';
import {PreCallProvider} from '../components/precall/usePreCall';
import {LayoutProvider} from '../utils/useLayout';
import Precall from '../components/Precall';
import {RecordingProvider} from '../subComponents/recording/useRecording';
import useJoinRoom from '../utils/useJoinRoom';
import {
  useRoomInfo,
  RoomInfoDefaultValue,
  WaitingRoomStatus,
} from '../components/room-info/useRoomInfo';
import {SidePanelProvider} from '../utils/useSidePanel';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import {ChatNotificationProvider} from '../components/chat-notification/useChatNotification';
import {ChatUIControlsProvider} from '../components/chat-ui/useChatUIControls';
import {ScreenShareProvider} from '../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../components/contexts/VideoMeetingDataContext';
import {useWakeLock} from '../components/useWakeLock';
import SDKEvents from '../utils/SdkEvents';
import {UserPreferenceProvider} from '../components/useUserPreference';
import EventsConfigure from '../components/EventsConfigure';
import PermissionHelper from '../components/precall/PermissionHelper';
import {FocusProvider} from '../utils/useFocus';
import {VideoCallProvider} from '../components/useVideoCall';
import {SdkApiContext} from '../components/SdkApiContext';
import isSDK from '../utils/isSDK';
import {CaptionProvider} from '../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../components/SdkMuteToggleListener';
import StorageContext from '../components/StorageContext';
import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';
import {NoiseSupressionProvider} from '../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../app-state/useVideoQuality';
import {VBProvider} from '../components/virtual-background/useVB';
import {DisableChatProvider} from '../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../components/contexts/WaitingRoomContext';
import {isValidReactComponent} from '../utils/common';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import VideoCallScreenWrapper from './video-call/VideoCallScreenWrapper';
import {useIsRecordingBot} from '../subComponents/recording/useIsRecordingBot';
import {
  userBannedText,
  videoRoomStartingCallText,
} from '../language/default-labels/videoCallScreenLabels';
import {useString} from '../utils/useString';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import {useCustomization} from 'customization-implementation';
import {BeautyEffectProvider} from '../components/beauty-effect/useBeautyEffects';
import {UserActionMenuProvider} from '../components/useUserActionMenu';
import Toast from '../../react-native-toast-message';
import {AuthErrorCodes} from '../utils/common';
import {BreakoutRoomProvider} from '../components/breakout-room/context/BreakoutRoomContext';
import BreakoutRoomEventsConfigure from '../components/breakout-room/events/BreakoutRoomEventsConfigure';
import {RTM_ROOMS} from '../rtm/constants';

interface VideoCallProps {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  rtcProps: RtcPropsInterface;
  setRtcProps: React.Dispatch<React.SetStateAction<Partial<RtcPropsInterface>>>;
  callbacks: CallbacksInterface;
  styleProps: any;
}

const VideoCall = (videoCallProps: VideoCallProps) => {
  const {
    callActive,
    setCallActive,
    rtcProps,
    setRtcProps,
    callbacks,
    styleProps,
  } = videoCallProps;
  /**
   *  Should we set the callscreen to active ??
   *  a) If Recording bot( i.e prop: recordingBot) is TRUE then it means,
   *     the recording bot is accessing the screen - so YES we should set
   *     the callActive as true and we need not check for whether
   *     $config.PRECALL is enabled or not.
   *  b) If Recording bot( i.e prop: recordingBot) is FALSE then we should set
   *     the callActive depending upon the value of magic variable - $config.PRECALL
   */
  const [isRecordingActive, setRecordingActive] = useState(false);
  const [sttAutoStarted, setSttAutoStarted] = useState(false);
  const [recordingAutoStarted, setRecordingAutoStarted] = useState(false);

  const {PrefereceWrapper} = useCustomization(data => {
    let components: {
      PrefereceWrapper: React.ComponentType;
    } = {
      PrefereceWrapper: React.Fragment,
    };
    if (
      data?.components?.preferenceWrapper &&
      typeof data?.components?.preferenceWrapper !== 'object' &&
      isValidReactComponent(data?.components?.preferenceWrapper)
    ) {
      components.PrefereceWrapper = data?.components?.preferenceWrapper;
    }

    return components;
  });

  return (
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
          ? ChannelProfileType.ChannelProfileLiveBroadcasting
          : ChannelProfileType.ChannelProfileCommunication,
      }}>
      <RtcConfigure>
        <DeviceConfigure>
          <NoiseSupressionProvider callActive={callActive}>
            <VideoQualityContextProvider>
              <ChatUIControlsProvider>
                <ChatNotificationProvider>
                  <LayoutProvider>
                    <FocusProvider>
                      <SidePanelProvider>
                        <ChatMessagesProvider callActive={callActive}>
                          <ScreenShareProvider>
                            <RTMConfigureMainRoomProvider
                              callActive={callActive}
                              channelName={rtcProps.channel}>
                              <RtmConfigure room={RTM_ROOMS.MAIN}>
                                <UserPreferenceProvider callActive={callActive}>
                                  <CaptionProvider>
                                    <WaitingRoomProvider>
                                      <EventsConfigure
                                        setSttAutoStarted={setSttAutoStarted}
                                        sttAutoStarted={sttAutoStarted}
                                        callActive={callActive}>
                                        <ScreenshareConfigure
                                          isRecordingActive={isRecordingActive}>
                                          <LiveStreamContextProvider
                                            value={{
                                              setRtcProps,
                                              rtcProps,
                                              callActive,
                                            }}>
                                            <LiveStreamDataProvider>
                                              <LocalUserContext
                                                localUid={rtcProps?.uid}>
                                                <RecordingProvider
                                                  value={{
                                                    setRecordingActive,
                                                    isRecordingActive,
                                                    callActive,
                                                    recordingAutoStarted,
                                                    setRecordingAutoStarted,
                                                  }}>
                                                  <NetworkQualityProvider>
                                                    {!isMobileUA() && (
                                                      <PermissionHelper />
                                                    )}
                                                    <UserActionMenuProvider>
                                                      <VBProvider>
                                                        <BeautyEffectProvider>
                                                          {/* <PrefereceWrapper
                                                                    callActive={
                                                                      callActive
                                                                    }
                                                                    setCallActive={
                                                                      setCallActive
                                                                    }> */}
                                                          <SdkMuteToggleListener>
                                                            {callActive ? (
                                                              <VideoMeetingDataProvider>
                                                                <VideoCallProvider>
                                                                  <DisableChatProvider>
                                                                    <BreakoutRoomProvider
                                                                      mainChannel={
                                                                        rtcProps.channel
                                                                      }
                                                                      handleLeaveBreakout={
                                                                        null
                                                                      }>
                                                                      <BreakoutRoomEventsConfigure
                                                                        mainChannelName={
                                                                          rtcProps.channel
                                                                        }>
                                                                        <VideoCallScreenWrapper />
                                                                      </BreakoutRoomEventsConfigure>
                                                                    </BreakoutRoomProvider>
                                                                  </DisableChatProvider>
                                                                </VideoCallProvider>
                                                              </VideoMeetingDataProvider>
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
                                                          </SdkMuteToggleListener>
                                                          {/* </PrefereceWrapper> */}
                                                        </BeautyEffectProvider>
                                                      </VBProvider>
                                                    </UserActionMenuProvider>
                                                  </NetworkQualityProvider>
                                                </RecordingProvider>
                                              </LocalUserContext>
                                            </LiveStreamDataProvider>
                                          </LiveStreamContextProvider>
                                        </ScreenshareConfigure>
                                      </EventsConfigure>
                                    </WaitingRoomProvider>
                                  </CaptionProvider>
                                </UserPreferenceProvider>
                              </RtmConfigure>
                            </RTMConfigureMainRoomProvider>
                          </ScreenShareProvider>
                        </ChatMessagesProvider>
                      </SidePanelProvider>
                    </FocusProvider>
                  </LayoutProvider>
                </ChatNotificationProvider>
              </ChatUIControlsProvider>
            </VideoQualityContextProvider>
          </NoiseSupressionProvider>
        </DeviceConfigure>
      </RtcConfigure>
    </PropsProvider>
  );
};

//change these to inline styles or sth
// const style = StyleSheet.create({
//   full: {
//     flex: 1,
//     flexDirection: 'column',
//     overflow: 'hidden',
//   },
//   videoView: videoView,
//   loader: {
//     flex: 1,
//     alignSelf: 'center',
//     justifyContent: 'center',
//   },
//   loaderLogo: {
//     alignSelf: 'center',
//     justifyContent: 'center',
//     marginBottom: 30,
//   },
//   loaderText: {fontWeight: '500', color: $config.FONT_COLOR},
// });

export default VideoCall;
