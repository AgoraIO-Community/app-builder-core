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
} from '../../../agora-rn-uikit';
import RtmConfigure from '../../components/RTMConfigure';
import RTMConfigureBreakoutRoomProvider from '../../rtm/RTMConfigureBreakoutRoomProvider';
import DeviceConfigure from '../../components/DeviceConfigure';
import {isMobileUA} from '../../utils/common';
import {LiveStreamContextProvider} from '../../components/livestream';
import ScreenshareConfigure from '../../subComponents/screenshare/ScreenshareConfigure';
import {LayoutProvider} from '../../utils/useLayout';
import {RecordingProvider} from '../../subComponents/recording/useRecording';
import {SidePanelProvider} from '../../utils/useSidePanel';
import {NetworkQualityProvider} from '../../components/NetworkQualityContext';
import {ChatNotificationProvider} from '../../components/chat-notification/useChatNotification';
import {ChatUIControlsProvider} from '../../components/chat-ui/useChatUIControls';
import {ScreenShareProvider} from '../../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../../components/contexts/VideoMeetingDataContext';
import {UserPreferenceProvider} from '../../components/useUserPreference';
import EventsConfigure from '../../components/EventsConfigure';
import PermissionHelper from '../../components/precall/PermissionHelper';
import {FocusProvider} from '../../utils/useFocus';
import {VideoCallProvider} from '../../components/useVideoCall';
import {CaptionProvider} from '../../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../../components/SdkMuteToggleListener';
import {NoiseSupressionProvider} from '../../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../../app-state/useVideoQuality';
import {VBProvider} from '../../components/virtual-background/useVB';
import {DisableChatProvider} from '../../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../../components/contexts/WaitingRoomContext';
import {ChatMessagesProvider} from '../../components/chat-messages/useChatMessages';
import VideoCallScreenWrapper from './../video-call/VideoCallScreenWrapper';
import {BeautyEffectProvider} from '../../components/beauty-effect/useBeautyEffects';
import {UserActionMenuProvider} from '../../components/useUserActionMenu';
import {RaiseHandProvider} from '../../components/raise-hand';
import {BreakoutRoomProvider} from '../../components/breakout-room/context/BreakoutRoomContext';
import BreakoutRoomEventsConfigure from '../../components/breakout-room/events/BreakoutRoomEventsConfigure';
import {RTM_ROOMS} from '../../rtm/constants';
import {useRtcProps} from '../../components/rtc/RtcPropsComposer';
import {useRoomLifecycle} from '../../components/room-info/RoomLifecycleContext';

interface BreakoutVideoCallProps {
  onLeave: () => void;
  callActive: boolean;
}

const BreakoutVideoCall: React.FC<BreakoutVideoCallProps> = ({
  onLeave,
  callActive,
}) => {
  // rtcProps automatically point to breakout channel after enterBreakoutRoom()
  const {rtcProps, setRtcPropsOverrides, callbacks, styleProps, mode} =
    useRtcProps();
  // Main room channel name — stable even while active room is breakout
  const {mainRoomInfo} = useRoomLifecycle();
  const mainChannelName = mainRoomInfo?.data?.channel || '';
  const [isRecordingActive, setRecordingActive] = useState(false);
  const [sttAutoStarted, setSttAutoStarted] = useState(false);
  const [recordingAutoStarted, setRecordingAutoStarted] = useState(false);

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
                            <RTMConfigureBreakoutRoomProvider
                              callActive={callActive}
                              currentChannel={rtcProps.channel}>
                              <RtmConfigure room={RTM_ROOMS.BREAKOUT}>
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
                                                          <SdkMuteToggleListener>
                                                            <VideoMeetingDataProvider>
                                                              <VideoCallProvider>
                                                                <DisableChatProvider>
                                                                  <RaiseHandProvider>
                                                                    <BreakoutRoomProvider
                                                                      mainChannel={
                                                                        mainChannelName
                                                                      }
                                                                      handleLeaveBreakout={
                                                                        onLeave
                                                                      }>
                                                                      <BreakoutRoomEventsConfigure>
                                                                        <VideoCallScreenWrapper />
                                                                      </BreakoutRoomEventsConfigure>
                                                                    </BreakoutRoomProvider>
                                                                  </RaiseHandProvider>
                                                                </DisableChatProvider>
                                                              </VideoCallProvider>
                                                            </VideoMeetingDataProvider>
                                                          </SdkMuteToggleListener>
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
                            </RTMConfigureBreakoutRoomProvider>
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

export default BreakoutVideoCall;
