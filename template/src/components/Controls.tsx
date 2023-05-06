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
import React, {useState, useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Text, useWindowDimensions} from 'react-native';
import {PropsContext} from '../../agora-rn-uikit';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../subComponents/LocalVideoMute';
import Recording, {RecordingButtonProps} from '../subComponents/Recording';
import LocalSwitchCamera, {
  LocalSwitchCameraProps,
} from '../subComponents/LocalSwitchCamera';
import ScreenshareButton, {
  ScreenshareButtonProps,
} from '../subComponents/screenshare/ScreenshareButton';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {ClientRole} from '../../agora-rn-uikit';
import LiveStreamControls, {
  LiveStreamControlsProps,
} from './livestream/views/LiveStreamControls';
import {
  BREAKPOINTS,
  calculatePosition,
  isWebInternal,
  useIsDesktop,
} from '../utils/common';
import {useRoomInfo} from './room-info/useRoomInfo';
import LocalEndcall, {LocalEndcallProps} from '../subComponents/LocalEndCall';
import Spacer from '../atoms/Spacer';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import IconButton from '../atoms/IconButton';
import ActionMenu, {ActionMenuItem} from '../atoms/ActionMenu';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {
  ChatType,
  SidePanelType,
  useChatUIControls,
  useLayout,
  useRecording,
  useSidePanel,
} from 'customization-api';
import {useVideoCall} from './useVideoCall';
import {useScreenshare} from '../subComponents/screenshare/useScreenshare';
import LayoutIconDropdown from '../subComponents/LayoutIconDropdown';
import Toolbar from '../atoms/Toolbar';
import {ToolbarPosition, useToolbar} from '../utils/useToolbar';
import ToolbarItem from '../atoms/ToolbarItem';

const MoreButton = () => {
  const {rtcProps} = useContext(PropsContext);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredOnModal, setIsHoveredOnModal] = useState(false);
  const moreBtnRef = useRef(null);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const layouts = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const layout = layouts.findIndex((item) => item.name === currentLayout);
  const {setSidePanel, sidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useRoomInfo();
  const {
    showLayoutOption,
    setShowInvitePopup,
    setShowStopRecordingPopup,
    setShowLayoutOption,
  } = useVideoCall();
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  const {isRecordingActive, startRecording, inProgress} = useRecording();
  const {setChatType} = useChatUIControls();
  const actionMenuitems: ActionMenuItem[] = [];

  if (globalWidth <= BREAKPOINTS.sm) {
    actionMenuitems.push({
      icon: 'participants',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'People',
      callback: () => {
        setActionMenuVisible(false);
        setSidePanel(SidePanelType.Participants);
      },
    });
    actionMenuitems.push({
      icon: 'chat-nav',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Chat',
      callback: () => {
        setActionMenuVisible(false);
        setChatType(ChatType.Group);
        setSidePanel(SidePanelType.Chat);
      },
    });

    if ($config.SCREEN_SHARING) {
      if (
        !(
          rtcProps.role == ClientRole.Audience &&
          $config.EVENT_MODE &&
          !$config.RAISE_HAND
        )
      ) {
        actionMenuitems.push({
          disabled:
            rtcProps.role == ClientRole.Audience &&
            $config.EVENT_MODE &&
            $config.RAISE_HAND &&
            !isHost,
          icon: isScreenshareActive ? 'stop-screen-share' : 'screen-share',
          iconColor: isScreenshareActive
            ? $config.SEMANTIC_ERROR
            : $config.SECONDARY_ACTION_COLOR,
          textColor: isScreenshareActive
            ? $config.SEMANTIC_ERROR
            : $config.FONT_COLOR,
          title: isScreenshareActive ? 'Stop Share' : 'Share',
          callback: () => {
            setActionMenuVisible(false);
            isScreenshareActive
              ? stopUserScreenShare()
              : startUserScreenshare();
          },
        });
      }
    }
    if (isHost && $config.CLOUD_RECORDING) {
      actionMenuitems.push({
        disabled: inProgress,
        icon: isRecordingActive ? 'stop-recording' : 'recording',
        iconColor: isRecordingActive
          ? $config.SEMANTIC_ERROR
          : $config.SECONDARY_ACTION_COLOR,
        textColor: isRecordingActive
          ? $config.SEMANTIC_ERROR
          : $config.FONT_COLOR,
        title: isRecordingActive ? 'Stop Recording' : 'Record',
        callback: () => {
          setActionMenuVisible(false);
          if (!isRecordingActive) {
            startRecording();
          } else {
            setShowStopRecordingPopup(true);
          }
        },
      });
    }
  }

  if (globalWidth <= BREAKPOINTS.md) {
    actionMenuitems.push({
      icon: layouts[layout]?.iconName,
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Layout',
      callback: () => {
        //setShowLayoutOption(true);
      },
      onHoverCallback: (isHovered) => {
        setShowLayoutOption(isHovered);
      },
      onHoverContent: (
        <LayoutIconDropdown
          onHoverPlaceHolder="vertical"
          setShowDropdown={() => {}}
          showDropdown={true}
          modalPosition={
            globalWidth <= BREAKPOINTS.sm
              ? {bottom: 65, left: -150}
              : {bottom: 20, left: -150}
          }
          caretPosition={{bottom: 45, right: -10}}
        />
      ),
    });
    actionMenuitems.push({
      icon: 'share',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Invite',
      callback: () => {
        setActionMenuVisible(false);
        setShowInvitePopup(true);
      },
    });
  }

  if (globalWidth <= BREAKPOINTS.sm) {
    actionMenuitems.push({
      icon: 'settings',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Settings',
      callback: () => {
        setActionMenuVisible(false);
        setSidePanel(SidePanelType.Settings);
      },
    });
  }

  useEffect(() => {
    if (isHovered) {
      setActionMenuVisible(true);
    }
  }, [isHovered]);

  useEffect(() => {
    //hide action menu when user change layout
    setActionMenuVisible(false);
  }, [currentLayout]);

  return (
    <>
      <ActionMenu
        containerStyle={{width: 180}}
        hoverMode={true}
        onHover={(isVisible) => setIsHoveredOnModal(isVisible)}
        from={'control-bar'}
        actionMenuVisible={(isHovered || isHoveredOnModal) && actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={{
          bottom: 8,
          left: 0,
        }}
        items={actionMenuitems}
      />
      <div
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}>
        {/** placeholder to hovering */}
        <View
          style={{
            position: 'absolute',
            top: -20,
            zIndex: -1,
            height: '50%',
            width: '100%',
            backgroundColor: 'transparent',
          }}
        />
        <IconButton
          setRef={(ref) => {
            moreBtnRef.current = ref;
          }}
          onPress={() => {
            //setActionMenuVisible(true);
          }}
          iconProps={{
            name: 'more-menu',
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          btnTextProps={{
            text: $config.ICON_TEXT ? 'More' : '',
            textColor: $config.FONT_COLOR,
          }}
        />
      </div>
    </>
  );
};
const Controls = () => {
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop();
  const {
    data: {isHost},
  } = useRoomInfo();
  const {isHorizontal} = useToolbar();
  const {width} = useWindowDimensions();
  return (
    <Toolbar>
      {width >= BREAKPOINTS.md && (
        <View
          style={[
            style.leftContent,
            isHorizontal ? {flexDirection: 'row'} : {flexDirection: 'column'},
          ]}>
          <ToolbarItem testID="layout-btn" collapsable={false}>
            {/**
             * .measure returns undefined on Android unless collapsable=false or onLayout are specified
             * so added collapsable property
             * https://github.com/facebook/react-native/issues/29712
             * */}
            <LayoutIconButton />
          </ToolbarItem>
          <ToolbarItem testID="invite-btn">
            <CopyJoinInfo />
          </ToolbarItem>
        </View>
      )}
      <View
        style={[
          style.centerContent,
          isHorizontal ? {flexDirection: 'row'} : {flexDirection: 'column'},
        ]}>
        {$config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
          <LiveStreamControls
            showControls={true}
            isDesktop={isDesktop('toolbar')}
          />
        ) : (
          <></>
        )}
        <>
          {/**
           * In event mode when raise hand feature is active
           * and audience is promoted to host, the audience can also
           * demote himself
           */}
          {$config.EVENT_MODE ? (
            <LiveStreamControls
              isDesktop={isDesktop('toolbar')}
              showControls={rtcProps?.role == ClientRole.Broadcaster && !isHost}
            />
          ) : (
            <></>
          )}
          <ToolbarItem testID="localAudio-btn">
            <LocalAudioMute showToolTip={true} />
          </ToolbarItem>
          {!$config.AUDIO_ROOM && (
            <ToolbarItem testID="localVideo-btn">
              <LocalVideoMute showToolTip={true} />
            </ToolbarItem>
          )}
          {!$config.AUDIO_ROOM && isMobileOrTablet() && (
            <ToolbarItem testID="switchCamera-btn">
              <LocalSwitchCamera />
            </ToolbarItem>
          )}
          {width > BREAKPOINTS.sm &&
            $config.SCREEN_SHARING &&
            !isMobileOrTablet() && (
              <ToolbarItem testID="screenShare-btn">
                <ScreenshareButton />
              </ToolbarItem>
            )}
          {width > BREAKPOINTS.sm && isHost && $config.CLOUD_RECORDING && (
            <ToolbarItem testID="recording-btn">
              <Recording />
            </ToolbarItem>
          )}
        </>
        {width < BREAKPOINTS.md && (
          <ToolbarItem testID="more-btn">
            <MoreButton />
          </ToolbarItem>
        )}
        <ToolbarItem testID="endCall-btn">
          <LocalEndcall />
        </ToolbarItem>
      </View>
      {width >= BREAKPOINTS.md && <View style={style.rightContent}></View>}
    </Toolbar>
  );
};

const style = StyleSheet.create({
  leftContent: {
    flex: 1,

    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    zIndex: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContent: {
    flex: 1,
  },
});

export default Controls;
