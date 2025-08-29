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

import React, {useState} from 'react';
import {useCustomization} from 'customization-implementation';
import {
  RtcConfigure,
  PropsProvider,
  ChannelProfileType,
  LocalUserContext,
  CallbacksInterface,
  RtcPropsInterface,
} from '../../../agora-rn-uikit';
import RtmConfigure from '../../components/RTMConfigure';
import DeviceConfigure from '../../components/DeviceConfigure';
import {NetworkQualityProvider} from '../../components/NetworkQualityContext';
import {ChatNotificationProvider} from '../../components/chat-notification/useChatNotification';
import {ChatUIControlsProvider} from '../../components/chat-ui/useChatUIControls';
import {ScreenShareProvider} from '../../components/contexts/ScreenShareContext';
import {LiveStreamDataProvider} from '../../components/contexts/LiveStreamDataContext';
import {VideoMeetingDataProvider} from '../../components/contexts/VideoMeetingDataContext';
import {UserPreferenceProvider} from '../../components/useUserPreference';
import EventsConfigure from '../../components/EventsConfigure';
import PermissionHelper from '../../components/precall/PermissionHelper';
import {LiveStreamContextProvider} from '../../components/livestream';
import {PreCallProvider} from '../../components/precall/usePreCall';
import Precall from '../../components/Precall';
import {VideoCallProvider} from '../../components/useVideoCall';
import SdkMuteToggleListener from '../../components/SdkMuteToggleListener';
import {VBProvider} from '../../components/virtual-background/useVB';
import {DisableChatProvider} from '../../components/disable-chat/useDisableChat';
import {WaitingRoomProvider} from '../../components/contexts/WaitingRoomContext';
import {ChatMessagesProvider} from '../../components/chat-messages/useChatMessages';
import {BeautyEffectProvider} from '../../components/beauty-effect/useBeautyEffects';
import {UserActionMenuProvider} from '../../components/useUserActionMenu';
import {CaptionProvider} from '../../subComponents/caption/useCaption';
import ScreenshareConfigure from '../../subComponents/screenshare/ScreenshareConfigure';
import {RecordingProvider} from '../../subComponents/recording/useRecording';
import {isMobileUA, isValidReactComponent} from '../../utils/common';
import {LayoutProvider} from '../../utils/useLayout';
import {SidePanelProvider} from '../../utils/useSidePanel';
import {FocusProvider} from '../../utils/useFocus';
import {NoiseSupressionProvider} from '../../app-state/useNoiseSupression';
import {VideoQualityContextProvider} from '../../app-state/useVideoQuality';
import VideoCallScreenWrapper from './../video-call/VideoCallScreenWrapper';

interface MainVideoCallContentProps {
  callActive: boolean;
  setCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  rtcProps: RtcPropsInterface;
  setRtcProps: React.Dispatch<React.SetStateAction<Partial<RtcPropsInterface>>>;
  callbacks: CallbacksInterface;
  styleProps: any;
}

const MainVideoCallContent: React.FC<MainVideoCallContentProps> = ({
  callActive,
  setCallActive,
  rtcProps,
  setRtcProps,
  callbacks,
  styleProps,
}) => {
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
                            <RtmConfigure
                              callActive={callActive}
                              channelName={rtcProps.channel}>
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
                                                          // @ts-ignore
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
                                                                  <VideoCallScreenWrapper />
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

export default MainVideoCallContent;
