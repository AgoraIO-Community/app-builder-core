/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useState, useContext} from 'react';
import {StyleSheet} from 'react-native';
import {
  RtcConfigure,
  PropsProvider,
  ClientRoleType,
  ChannelProfileType,
  LocalUserContext,
} from '../../agora-rn-uikit';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {isMobileUA} from '../utils/common';
import {LayoutProvider} from '../utils/useLayout';
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
import {FocusProvider} from '../utils/useFocus';
import {VideoCallProvider} from '../components/useVideoCall';
import {CaptionProvider} from '../subComponents/caption/useCaption';
import SdkMuteToggleListener from '../components/SdkMuteToggleListener';
import {NoiseSupressionProvider} from '../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../app-state/useVideoQuality';
import {VBProvider} from '../components/virtual-background/useVB';
import {DisableChatProvider} from '../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../components/contexts/WaitingRoomContext';
import PermissionHelper from '../components/precall/PermissionHelper';
import {ChatMessagesProvider} from '../components/chat-messages/useChatMessages';
import VideoCallScreenWrapper from './video-call/VideoCallScreenWrapper';
import {BeautyEffectProvider} from '../components/beauty-effect/useBeautyEffects';
import {UserActionMenuProvider} from '../components/useUserActionMenu';
import {VideoRoomOrchestratorState} from './VideoCallRoomOrchestrator';
import StorageContext from '../components/StorageContext';
import {SdkApiContext} from '../components/SdkApiContext';
import {RnEncryptionEnum} from './VideoCall';
import VideoCallStateSetup from './video-call/VideoCallStateSetup';
import {BreakoutRoomProvider} from '../components/breakout-room/context/BreakoutRoomContext';

interface BreakoutVideoCallProps {
  setBreakoutRtcEngine?: (
    engine: VideoRoomOrchestratorState['rtcEngine'],
  ) => void;
  storedBreakoutChannelDetails: VideoRoomOrchestratorState['channelDetails'];
}

const BreakoutRoomVideoCall = (
  breakoutVideoCallProps: BreakoutVideoCallProps,
) => {
  const {storedBreakoutChannelDetails} = breakoutVideoCallProps;
  const {store} = useContext(StorageContext);
  const [isRecordingActive, setRecordingActive] = useState(false);
  const [recordingAutoStarted, setRecordingAutoStarted] = useState(false);
  const [sttAutoStarted, setSttAutoStarted] = useState(false);

  const {
    join: SdkJoinState,
    microphoneDevice: sdkMicrophoneDevice,
    cameraDevice: sdkCameraDevice,
  } = useContext(SdkApiContext);

  const callActive = true;

  const [rtcProps, setRtcProps] = React.useState({
    appId: $config.APP_ID,
    channel: storedBreakoutChannelDetails.channel,
    uid: storedBreakoutChannelDetails.uid as number,
    token: storedBreakoutChannelDetails.token,
    rtm: storedBreakoutChannelDetails.rtmToken,
    screenShareUid: storedBreakoutChannelDetails?.screenShareUid as number,
    screenShareToken: storedBreakoutChannelDetails?.screenShareToken || '',
    profile: $config.PROFILE,
    screenShareProfile: $config.SCREEN_SHARE_PROFILE,
    dual: true,
    encryption: $config.ENCRYPTION_ENABLED
      ? {key: null, mode: RnEncryptionEnum.AES128GCM2, screenKey: null}
      : false,
    role: ClientRoleType.ClientRoleBroadcaster,
    geoFencing: $config.GEO_FENCING,
    audioRoom: $config.AUDIO_ROOM,
    activeSpeaker: $config.ACTIVE_SPEAKER,
    preferredCameraId:
      sdkCameraDevice.deviceId || store?.activeDeviceId?.videoinput || null,
    preferredMicrophoneId:
      sdkMicrophoneDevice.deviceId || store?.activeDeviceId?.audioinput || null,
    recordingBot: false,
  });

  return (
    <PropsProvider
      value={{
        rtcProps: rtcProps as any,
        callbacks: {},
        styleProps: styleProps as any,
        mode: ChannelProfileType.ChannelProfileLiveBroadcasting,
      }}>
      <RtcConfigure>
        <VideoCallStateSetup
          setMainRtcEngine={breakoutVideoCallProps.setBreakoutRtcEngine}
        />
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
                            <RtmConfigure callActive={callActive}>
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
                                                        <SdkMuteToggleListener>
                                                          <VideoMeetingDataProvider>
                                                            <VideoCallProvider>
                                                              <DisableChatProvider>
                                                                <BreakoutRoomProvider>
                                                                  <VideoCallScreenWrapper />
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

const styleProps = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorMessage: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  returnButton: {
    minWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
});

export default BreakoutRoomVideoCall;
