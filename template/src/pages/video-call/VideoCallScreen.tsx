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
} from '../../utils/common';
import {useSidePanel} from '../../utils/useSidePanel';
import VideoComponent from './VideoComponent';
import {videoView} from '../../../theme.json';
import {ToolbarProvider, ToolbarPosition} from '../../utils/useToolbar';
import SDKEvents from '../../utils/SdkEvents';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {controlMessageEnum, useUserName} from 'customization-api';
import events, {PersistanceLevel} from '../../rtm-events-api';
import VideoCallMobileView from './VideoCallMobileView';

const VideoCallScreen = () => {
  const {sidePanel} = useSidePanel();
  const [name] = useUserName();
  const {
    data: {meetingTitle, isHost},
  } = useRoomInfo();
  const {
    ChatComponent,
    VideocallComponent,
    BottombarComponent,
    ParticipantsComponent,
    SettingsComponent,
    TopbarComponent,
    VideocallBeforeView,
    VideocallAfterView,
    LeftbarComponent,
    RightbarComponent,
  } = useCustomization((data) => {
    let components: {
      VideocallComponent?: React.ComponentType;
      ChatComponent: React.ComponentType<ChatProps>;
      BottombarComponent: React.ComponentType;
      ParticipantsComponent: React.ComponentType;
      SettingsComponent: React.ComponentType;
      TopbarComponent: React.ComponentType;
      VideocallBeforeView: React.ComponentType;
      VideocallAfterView: React.ComponentType;
      LeftbarComponent: React.ComponentType;
      RightbarComponent: React.ComponentType;
    } = {
      BottombarComponent: Controls,
      TopbarComponent: Navbar,
      ChatComponent: Chat,
      ParticipantsComponent: ParticipantsView,
      SettingsComponent: SettingsView,
      VideocallAfterView: React.Fragment,
      VideocallBeforeView: React.Fragment,
      LeftbarComponent: React.Fragment,
      RightbarComponent: React.Fragment,
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
        data?.components?.videoCall.bottomToolBar &&
        typeof data?.components?.videoCall.bottomToolBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.bottomToolBar)
      ) {
        components.BottombarComponent =
          data?.components?.videoCall.bottomToolBar;
      }

      if (
        data?.components?.videoCall.topToolBar &&
        typeof data?.components?.videoCall.topToolBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.topToolBar)
      ) {
        components.TopbarComponent = data?.components?.videoCall.topToolBar;
      }

      if (
        data?.components?.videoCall.leftToolBar &&
        typeof data?.components?.videoCall.leftToolBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.leftToolBar)
      ) {
        components.LeftbarComponent = data?.components?.videoCall.leftToolBar;
      }

      if (
        data?.components?.videoCall.rightToolBar &&
        typeof data?.components?.videoCall.rightToolBar !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.rightToolBar)
      ) {
        components.RightbarComponent = data?.components?.videoCall.rightToolBar;
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
      <View style={style.fullRow}>
        <ToolbarProvider value={{position: ToolbarPosition.left}}>
          <LeftbarComponent />
        </ToolbarProvider>
        <View style={style.full}>
          <ToolbarProvider value={{position: ToolbarPosition.top}}>
            <TopbarComponent />
          </ToolbarProvider>
          <View
            style={[
              style.videoView,
              {paddingHorizontal: isDesktop() ? 32 : 10, paddingVertical: 10},
            ]}>
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
            {sidePanel === SidePanelType.Settings ? (
              <SettingsComponent />
            ) : (
              <></>
            )}
          </View>
          {!isWebInternal() && sidePanel === SidePanelType.Chat ? (
            <></>
          ) : (
            <ToolbarProvider value={{position: ToolbarPosition.bottom}}>
              <BottombarComponent />
            </ToolbarProvider>
          )}
        </View>
        <ToolbarProvider value={{position: ToolbarPosition.right}}>
          <RightbarComponent />
        </ToolbarProvider>
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
  fullRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  videoView: {
    flex: 12,
    flexDirection: 'row',
  },
});
