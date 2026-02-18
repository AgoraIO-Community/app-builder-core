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
import React, {useState, useMemo} from 'react';
import {
  RtcConfigure,
  PropsProvider,
  LocalUserContext,
} from '../../agora-rn-uikit';
import RtmConfigure from '../components/RTMConfigure';
import RTMConfigureMainRoomProvider from '../rtm/RTMConfigureMainRoomProvider';
import DeviceConfigure from '../components/DeviceConfigure';
import {isMobileUA, isValidReactComponent} from '../utils/common';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {PreCallProvider} from '../components/precall/usePreCall';
import {LayoutProvider} from '../utils/useLayout';
import Precall from '../components/Precall';
import {RecordingProvider} from '../subComponents/recording/useRecording';
import {SidePanelProvider} from '../utils/useSidePanel';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import {ChatNotificationProvider} from '../components/chat-notification/useChatNotification';
import {ChatUIControlsProvider} from '../components/chat-ui/useChatUIControls';
import {ScreenShareProvider} from '../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../components/contexts/VideoMeetingDataContext';
import {UserPreferenceProvider} from '../components/useUserPreference';
import EventsConfigure from '../components/EventsConfigure';
import PermissionHelper from '../components/precall/PermissionHelper';
import {FocusProvider} from '../utils/useFocus';
import {VideoCallProvider} from '../components/useVideoCall';
import {CaptionProvider} from '../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../components/SdkMuteToggleListener';
import {NoiseSupressionProvider} from '../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../app-state/useVideoQuality';
import {VBProvider} from '../components/virtual-background/useVB';
import {DisableChatProvider} from '../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../components/contexts/WaitingRoomContext';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import VideoCallScreenWrapper from './video-call/VideoCallScreenWrapper';
import {useCustomization} from 'customization-implementation';
import {BeautyEffectProvider} from '../components/beauty-effect/useBeautyEffects';
import {UserActionMenuProvider} from '../components/useUserActionMenu';
import {RaiseHandProvider} from '../components/raise-hand';
import {BreakoutRoomProvider} from '../components/breakout-room/context/BreakoutRoomContext';
import BreakoutRoomEventsConfigure from '../components/breakout-room/events/BreakoutRoomEventsConfigure';
import {RTM_ROOMS} from '../rtm/constants';
import {useRtcProps} from '../components/rtc/RtcPropsComposer';

interface VideoCallProps {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoCall = (videoCallProps: VideoCallProps) => {
  const {callActive, setCallActive} = videoCallProps;
  const {rtcProps, setRtcPropsOverrides, callbacks, styleProps, mode} =
    useRtcProps();
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

  const propsProviderValue = useMemo(
    () => ({
      rtcProps: {
        ...rtcProps,
        callActive,
      },
      callbacks,
      styleProps,
      mode,
    }),
    [rtcProps, callActive, callbacks],
  );

  return (
    <PropsProvider value={propsProviderValue}>
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
                              currentChannel={rtcProps.channel}>
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
                                              // LiveStream only mutates role —
                                              // forward via setRtcPropsOverrides
                                              setRtcProps: (updater: any) => {
                                                const updated =
                                                  typeof updater === 'function'
                                                    ? updater(rtcProps)
                                                    : updater;
                                                if (
                                                  updated.role !== undefined
                                                ) {
                                                  setRtcPropsOverrides({
                                                    role: updated.role,
                                                  });
                                                }
                                              },
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
                                                                    <RaiseHandProvider>
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
                                                                    </RaiseHandProvider>
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
