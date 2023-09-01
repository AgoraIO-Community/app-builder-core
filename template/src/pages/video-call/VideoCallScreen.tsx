import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
} from 'react-native';
import {useCustomization} from 'customization-implementation';
import Navbar from '../../components/Navbar';
import ParticipantsView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import Controls from '../../components/Controls';
import Chat, {ChatProps} from '../../components/Chat';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {
  isMobileUA,
  isValidReactComponent,
  isWebInternal,
  useIsDesktop,
  useIsSmall,
} from '../../utils/common';
import {useSidePanel} from '../../utils/useSidePanel';
import VideoComponent from './VideoComponent';
import {videoView} from '../../../theme.json';
import {
  ButtonTemplateProvider,
  ButtonTemplateName,
} from '../../utils/useButtonTemplate';
import SDKEvents from '../../utils/SdkEvents';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import {controlMessageEnum, useRtc, useUserName} from 'customization-api';
import events, {EventPersistLevel} from '../../rtm-events-api';
import VideoCallMobileView from './VideoCallMobileView';
import CaptionContainer from '../../subComponents/caption/CaptionContainer';
import Transcript from '../../subComponents/caption/Transcript';

import Spacer from '../../atoms/Spacer';

const VideoCallScreen = () => {
  const {sidePanel} = useSidePanel();
  const [name] = useUserName();
  const rtc = useRtc();
  const {
    data: {meetingTitle, isHost},
  } = useMeetingInfo();

  const {
    ChatComponent,
    VideocallComponent,
    BottombarComponent,
    ParticipantsComponent,
    SettingsComponent,
    TopbarComponent,
    VideocallBeforeView,
    VideocallAfterView,
  } = useCustomization(data => {
    let components: {
      VideocallComponent?: React.ComponentType;
      ChatComponent: React.ComponentType<ChatProps>;
      BottombarComponent: React.ComponentType;
      ParticipantsComponent: React.ComponentType;
      SettingsComponent: React.ComponentType;
      TopbarComponent: React.ComponentType;
      VideocallBeforeView: React.ComponentType;
      VideocallAfterView: React.ComponentType;
    } = {
      BottombarComponent: Controls,
      TopbarComponent: Navbar,
      ChatComponent: Chat,
      ParticipantsComponent: ParticipantsView,
      SettingsComponent: SettingsView,
      VideocallAfterView: React.Fragment,
      VideocallBeforeView: React.Fragment,
    };
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall !== 'object' &&
      isValidReactComponent(data?.components?.videoCall)
    ) {
      components.VideocallComponent = data?.components?.videoCall;
    }
    if (
      data?.components?.videoCall &&
      typeof data?.components?.videoCall === 'object'
    ) {
      // commented for v1 release
      // if (
      //   data?.components?.videoCall?.after &&
      //   isValidReactComponent(data?.components?.videoCall?.after)
      // ) {
      //   components.VideocallAfterView = data?.components?.videoCall?.after;
      // }

      // commented for v1 release
      // if (
      //   data?.components?.videoCall?.before &&
      //   isValidReactComponent(data?.components?.videoCall?.before)
      // ) {
      //   components.VideocallBeforeView = data?.components?.videoCall?.before;
      // }

      // commented for v1 release
      // if (
      //   data?.components?.videoCall.chat &&
      //   typeof data?.components?.videoCall.chat !== 'object' &&
      //   isValidReactComponent(data?.components?.videoCall.chat)
      // ) {
      //   components.ChatComponent = data?.components?.videoCall.chat;
      // }

      if (
        data?.components?.videoCall.bottomBar &&
        typeof data?.components?.videoCall.bottomBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.bottomBar)
      ) {
        components.BottombarComponent = data?.components?.videoCall.bottomBar;
      }

      if (
        data?.components?.videoCall.topBar &&
        typeof data?.components?.videoCall.topBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.topBar)
      ) {
        components.TopbarComponent = data?.components?.videoCall.topBar;
      }

      if (
        data?.components?.videoCall.participantsPanel &&
        typeof data?.components?.videoCall.participantsPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.participantsPanel)
      ) {
        components.ParticipantsComponent =
          data?.components?.videoCall.participantsPanel;
      }

      // commented for v1 release
      // if (
      //   data?.components?.videoCall.settingsPanel &&
      //   typeof data?.components?.videoCall.settingsPanel !== 'object' &&
      //   isValidReactComponent(data?.components?.videoCall.settingsPanel)
      // ) {
      //   components.SettingsComponent =
      //     data?.components?.videoCall.settingsPanel;
      // }
    }

    return components;
  });

  const isDesktop = useIsDesktop();
  const isSmall = useIsSmall();

  return VideocallComponent ? (
    <VideocallComponent />
  ) : // ) : !isDesktop ? (
  isMobileUA() ? (
    // Mobile View
    <VideoCallMobileView />
  ) : (
    // Desktop View
    <>
      <VideocallBeforeView />
      <View style={style.full}>
        <ButtonTemplateProvider
          value={{buttonTemplateName: ButtonTemplateName.topBar}}
        >
          <TopbarComponent />
        </ButtonTemplateProvider>
        <Spacer size={10} />
        <View
          style={[
            style.videoView,
            {paddingHorizontal: isDesktop() ? 32 : 10},
            {paddingVertical: isSmall() ? 10 : 0},
          ]}
        >
          <VideoComponent />
          {sidePanel === SidePanelType.Participants ? (
            <ParticipantsComponent />
          ) : (
            <></>
          )}
          {sidePanel === SidePanelType.Chat ? (
            $config.CHAT ? (
              <ChatComponent />
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
          {sidePanel === SidePanelType.Settings ? <SettingsComponent /> : <></>}
          {sidePanel === SidePanelType.Transcript ? <Transcript /> : <></>}
        </View>
        {!isWebInternal() && sidePanel === SidePanelType.Chat ? (
          <></>
        ) : (
          <ButtonTemplateProvider
            value={{buttonTemplateName: ButtonTemplateName.bottomBar}}
          >
            <CaptionContainer />
            {<Spacer size={10} />}
            <BottombarComponent />
          </ButtonTemplateProvider>
        )}
      </View>
      <VideocallAfterView />
    </>
  );
};
export default VideoCallScreen;
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: {
    flex: 12,
    flexDirection: 'row',
  },
});
