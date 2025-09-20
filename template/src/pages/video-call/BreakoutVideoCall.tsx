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
import React, {useState} from 'react';
import {
  RtcConfigure,
  PropsProvider,
  ChannelProfileType,
  LocalUserContext,
  RtcPropsInterface,
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
import {BreakoutRoomProvider} from '../../components/breakout-room/context/BreakoutRoomContext';
import {
  BreakoutChannelDetails,
  VideoCallContentProps,
} from './VideoCallContent';
import BreakoutRoomEventsConfigure from '../../components/breakout-room/events/BreakoutRoomEventsConfigure';
import {RTM_ROOMS} from '../../rtm/constants';

interface BreakoutVideoCallProps extends VideoCallContentProps {
  rtcProps: RtcPropsInterface;
  breakoutChannelDetails: BreakoutChannelDetails;
  onLeave: () => void;
}

const BreakoutVideoCall: React.FC<BreakoutVideoCallProps> = ({
  rtcProps,
  breakoutChannelDetails,
  onLeave,
  callActive,
  callbacks,
  styleProps,
}) => {
  const [isRecordingActive, setRecordingActive] = useState(false);
  const [sttAutoStarted, setSttAutoStarted] = useState(false);
  const [recordingAutoStarted, setRecordingAutoStarted] = useState(false);
  const [breakoutRoomRTCProps, setBreakoutRoomRtcProps] = useState({
    ...rtcProps,
    channel: breakoutChannelDetails.channel,
    uid: breakoutChannelDetails.uid as number,
    token: breakoutChannelDetails.token,
    rtm: breakoutChannelDetails.rtmToken,
    screenShareUid: breakoutChannelDetails?.screenShareUid as number,
    screenShareToken: breakoutChannelDetails?.screenShareToken || '',
  });

  return (
    <PropsProvider
      value={{
        rtcProps: {
          ...breakoutRoomRTCProps,
          callActive,
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
                            <RTMConfigureBreakoutRoomProvider
                              callActive={callActive}
                              currentChannel={breakoutRoomRTCProps.channel}>
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
                                              setRtcProps:
                                                setBreakoutRoomRtcProps,
                                              rtcProps: breakoutRoomRTCProps,
                                              callActive,
                                            }}>
                                            <LiveStreamDataProvider>
                                              <LocalUserContext
                                                localUid={
                                                  breakoutRoomRTCProps?.uid
                                                }>
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
                                                                  <BreakoutRoomProvider
                                                                    mainChannel={
                                                                      rtcProps.channel
                                                                    }
                                                                    handleLeaveBreakout={
                                                                      onLeave
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
