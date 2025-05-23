import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
} from 'react-native';
import {useCustomization} from 'customization-implementation';
import Navbar, {NavbarProps} from '../../components/Navbar';
import ParticipantsView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import Controls, {ControlsProps} from '../../components/Controls';
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
import {ToolbarProvider, ToolbarPosition} from '../../utils/useToolbar';
import SDKEvents from '../../utils/SdkEvents';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {
  controlMessageEnum,
  SidePanelItem,
  useCaption,
  useUserName,
} from 'customization-api';
import events, {PersistanceLevel} from '../../rtm-events-api';
import VideoCallMobileView from './VideoCallMobileView';
import CaptionContainer from '../../subComponents/caption/CaptionContainer';
import Transcript, {
  TranscriptProps,
} from '../../subComponents/caption/Transcript';

import Spacer from '../../atoms/Spacer';
import Leftbar, {
  LeftbarProps as LeftbarPropsInterface,
} from '../../components/Leftbar';
import Rightbar, {
  RightbarProps as RightbarInterface,
} from '../../components/Rightbar';
import useFindActiveSpeaker from '../../utils/useFindActiveSpeaker';
import VBPanel, {
  VBPanelProps,
} from '../../components/virtual-background/VBPanel';
import {LogSource, logger} from '../../logger/AppBuilderLogger';
import {useIsRecordingBot} from '../../subComponents/recording/useIsRecordingBot';
import {ToolbarPresetProps} from '../../atoms/ToolbarPreset';
import CustomSidePanelView from '../../components/CustomSidePanel';
import {useControlPermissionMatrix} from '../../components/controls/useControlPermissionMatrix';

const VideoCallScreen = () => {
  useFindActiveSpeaker();
  const {sidePanel} = useSidePanel();
  const [showCustomSidePanel, setShowCustomSidePanel] = useState(false);
  const [customSidePanelIndex, setCustomSidePanelIndex] = useState<
    undefined | number
  >(undefined);
  const [name] = useUserName();
  const {
    data: {meetingTitle, isHost},
  } = useRoomInfo();
  const {isCaptionON} = useCaption();
  const {
    ChatComponent,
    VideocallComponent,
    BottombarComponent,
    ParticipantsComponent,
    TranscriptComponent,
    CaptionComponent,
    VirtualBackgroundComponent,
    SettingsComponent,
    TopbarComponent,
    VideocallBeforeView,
    VideocallAfterView,
    LeftbarComponent,
    RightbarComponent,
    BottombarProps,
    TopbarProps,
    LeftbarProps,
    RightbarProps,
    VideocallWrapper,
    SidePanelArray,
  } = useCustomization(data => {
    let components: {
      VideocallWrapper: React.ComponentType;
      VideocallComponent?: React.ComponentType;
      ChatComponent: React.ComponentType<ChatProps>;
      BottombarComponent: React.ComponentType<ControlsProps>;
      ParticipantsComponent: React.ComponentType;
      TranscriptComponent: React.ComponentType<TranscriptProps>;
      CaptionComponent: React.ComponentType;
      VirtualBackgroundComponent: React.ComponentType<VBPanelProps>;
      SettingsComponent: React.ComponentType;
      TopbarComponent: React.ComponentType<NavbarProps>;
      VideocallBeforeView: React.ComponentType;
      VideocallAfterView: React.ComponentType;
      LeftbarComponent: React.ComponentType<LeftbarPropsInterface>;
      RightbarComponent: React.ComponentType<RightbarInterface>;
      BottombarProps?: ToolbarPresetProps['items'];
      TopbarProps?: ToolbarPresetProps['items'];
      LeftbarProps?: ToolbarPresetProps['items'];
      RightbarProps?: ToolbarPresetProps['items'];
      SidePanelArray?: SidePanelItem[];
    } = {
      BottombarComponent: Controls,
      TopbarComponent: Navbar,
      ChatComponent: Chat,
      ParticipantsComponent: ParticipantsView,
      TranscriptComponent: Transcript,
      CaptionComponent: CaptionContainer,
      VirtualBackgroundComponent: VBPanel,
      SettingsComponent: SettingsView,
      VideocallAfterView: React.Fragment,
      VideocallBeforeView: React.Fragment,
      VideocallWrapper: React.Fragment,
      LeftbarComponent: Leftbar,
      RightbarComponent: Rightbar,
      BottombarProps: {},
      TopbarProps: {},
      LeftbarProps: {},
      RightbarProps: {},
      SidePanelArray: [],
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
        data?.components?.videoCall.bottomToolBar &&
        typeof data?.components?.videoCall.bottomToolBar === 'object' &&
        Object.keys(data?.components?.videoCall.bottomToolBar)?.length
      ) {
        components.BottombarProps = data?.components?.videoCall.bottomToolBar;
      }
      if (
        data?.components?.videoCall.topToolBar &&
        typeof data?.components?.videoCall.topToolBar === 'object' &&
        Object.keys(data?.components?.videoCall.topToolBar)?.length
      ) {
        components.TopbarProps = data?.components?.videoCall.topToolBar;
      }
      if (
        data?.components?.videoCall.rightToolBar &&
        typeof data?.components?.videoCall.rightToolBar === 'object' &&
        Object.keys(data?.components?.videoCall.rightToolBar)?.length
      ) {
        components.RightbarProps = data?.components?.videoCall.rightToolBar;
      }
      if (
        data?.components?.videoCall.leftToolBar &&
        typeof data?.components?.videoCall.leftToolBar === 'object' &&
        Object.keys(data?.components?.videoCall.leftToolBar)?.length
      ) {
        components.LeftbarProps = data?.components?.videoCall.leftToolBar;
      }

      if (
        data?.components?.videoCall.participantsPanel &&
        typeof data?.components?.videoCall.participantsPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.participantsPanel)
      ) {
        components.ParticipantsComponent =
          data?.components?.videoCall.participantsPanel;
      }

      if (
        data?.components?.videoCall.transcriptPanel &&
        typeof data?.components?.videoCall.transcriptPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.transcriptPanel)
      ) {
        components.TranscriptComponent =
          data?.components?.videoCall.transcriptPanel;
      }

      if (
        data?.components?.videoCall.captionPanel &&
        typeof data?.components?.videoCall.captionPanel !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.captionPanel)
      ) {
        components.CaptionComponent = data?.components?.videoCall.captionPanel;
      }

      if (
        data?.components?.videoCall.virtualBackgroundPanel &&
        typeof data?.components?.videoCall.virtualBackgroundPanel !==
          'object' &&
        isValidReactComponent(
          data?.components?.videoCall.virtualBackgroundPanel,
        )
      ) {
        components.VirtualBackgroundComponent =
          data?.components?.videoCall.virtualBackgroundPanel;
      }

      if (
        data?.components?.videoCall.wrapper &&
        typeof data?.components?.videoCall.wrapper !== 'object' &&
        isValidReactComponent(data?.components?.videoCall.wrapper)
      ) {
        components.VideocallWrapper = data?.components?.videoCall.wrapper;
      }

      if (
        data?.components?.videoCall.customSidePanel &&
        typeof data?.components?.videoCall.customSidePanel === 'function'
      ) {
        components.SidePanelArray =
          data?.components?.videoCall?.customSidePanel();
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

  useEffect(() => {
    logger.log(
      LogSource.Internals,
      'VIDEO_CALL_ROOM',
      'User has landed on video call room',
    );
  }, []);

  useEffect(() => {
    const selectedIndex = SidePanelArray?.findIndex(item => {
      if (item?.name === sidePanel && item?.component) {
        return true;
      } else {
        return false;
      }
    });
    if (selectedIndex < 0) {
      setShowCustomSidePanel(false);
      setCustomSidePanelIndex(undefined);
    } else {
      setShowCustomSidePanel(true);
      setCustomSidePanelIndex(selectedIndex);
    }
  }, [sidePanel, SidePanelArray]);

  const {isRecordingBot, recordingBotUIConfig} = useIsRecordingBot();
  const canAccessChat = useControlPermissionMatrix('chatControl');

  return VideocallComponent ? (
    <VideocallComponent />
  ) : // ) : !isDesktop ? (
  isMobileUA() ? (
    // Mobile View
    <VideocallWrapper>
      <VideoCallMobileView native={false} />
    </VideocallWrapper>
  ) : (
    // Desktop View
    <>
      <VideocallWrapper>
        <VideocallBeforeView />
        <View
          style={
            $config.ENABLE_CONVERSATIONAL_AI
              ? style.containerForAiAgent
              : $config.ICON_TEXT
              ? style.fullRow
              : style.fullRowWithoutIcon
          }>
          <ToolbarProvider value={{position: ToolbarPosition.left}}>
            {Object.keys(LeftbarProps)?.length ? (
              <LeftbarComponent
                items={LeftbarProps}
                includeDefaultItems={false}
              />
            ) : (
              <LeftbarComponent />
            )}
          </ToolbarProvider>
          <View style={style.full}>
            <View
              style={
                isRecordingBot &&
                !recordingBotUIConfig.topBar &&
                style.zeroHeight
              }>
              <ToolbarProvider value={{position: ToolbarPosition.top}}>
                {Object.keys(TopbarProps)?.length ? (
                  <TopbarComponent
                    items={TopbarProps}
                    includeDefaultItems={false}
                  />
                ) : (
                  <TopbarComponent />
                )}
              </ToolbarProvider>
            </View>
            <View
              style={[
                style.videoView,
                $config.ENABLE_CONVERSATIONAL_AI
                  ? {}
                  : $config.ICON_TEXT
                  ? {
                      paddingHorizontal: isDesktop() ? 32 : 10,
                      paddingVertical: 10,
                      paddingBottom: 0,
                    }
                  : {marginVertical: 20},
              ]}>
              <VideoComponent />
              {/**
               * To display custom side panel
               * it will be shown when customer inject the custom side panel content
               * and call setSidePanel using the name they given
               */}
              {showCustomSidePanel && customSidePanelIndex !== undefined ? (
                SidePanelArray &&
                SidePanelArray?.length &&
                SidePanelArray[customSidePanelIndex]?.component ? (
                  <CustomSidePanelView
                    content={SidePanelArray[customSidePanelIndex]?.component}
                    title={SidePanelArray[customSidePanelIndex]?.title}
                    name={SidePanelArray[customSidePanelIndex]?.name}
                    onClose={SidePanelArray[customSidePanelIndex]?.onClose}
                  />
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
              {sidePanel === SidePanelType.Participants ? (
                <ParticipantsComponent />
              ) : (
                <></>
              )}
              {sidePanel === SidePanelType.Chat ? (
                canAccessChat ? (
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
              {sidePanel === SidePanelType.Transcript ? (
                $config.ENABLE_MEETING_TRANSCRIPT ? (
                  <TranscriptComponent />
                ) : (
                  <></>
                )
              ) : (
                <></>
              )}
              {sidePanel === SidePanelType.VirtualBackground ? (
                <VirtualBackgroundComponent />
              ) : (
                <></>
              )}
            </View>
            {!isWebInternal() && sidePanel === SidePanelType.Chat ? (
              <></>
            ) : (
              <ToolbarProvider value={{position: ToolbarPosition.bottom}}>
                {Object.keys(BottombarProps)?.length ? (
                  <BottombarComponent
                    items={BottombarProps}
                    includeDefaultItems={false}
                  />
                ) : (
                  <>
                    {isCaptionON ? <CaptionComponent /> : <></>}
                    <Spacer size={$config.ENABLE_CONVERSATIONAL_AI ? 20 : 10} />
                    <View
                      style={
                        isRecordingBot &&
                        !recordingBotUIConfig.bottomBar &&
                        style.zeroHeight
                      }>
                      <BottombarComponent />
                    </View>
                  </>
                )}
              </ToolbarProvider>
            )}
          </View>
          <ToolbarProvider value={{position: ToolbarPosition.right}}>
            {Object.keys(RightbarProps)?.length ? (
              <RightbarComponent
                items={RightbarProps}
                includeDefaultItems={false}
              />
            ) : (
              <RightbarComponent />
            )}
          </ToolbarProvider>
        </View>
        <VideocallAfterView />
      </VideocallWrapper>
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
  fullRowWithoutIcon: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  containerForAiAgent: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  videoView: {
    flex: 12,
    flexDirection: 'row',
  },
  zeroHeight: {
    height: 0,
    visibility: 'hidden',
  },
});
