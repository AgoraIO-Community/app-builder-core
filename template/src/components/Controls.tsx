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
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {PropsContext} from '../../agora-rn-uikit';
import LocalAudioMute from '../subComponents/LocalAudioMute';
import LocalVideoMute from '../subComponents/LocalVideoMute';
import Recording from '../subComponents/Recording';
import LocalSwitchCamera from '../subComponents/LocalSwitchCamera';
import ScreenshareButton from '../subComponents/screenshare/ScreenshareButton';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {ClientRole} from '../../agora-rn-uikit';
import LiveStreamControls from './livestream/views/LiveStreamControls';
import {BREAKPOINTS, useIsDesktop} from '../utils/common';
import {useRoomInfo} from './room-info/useRoomInfo';
import LocalEndcall from '../subComponents/LocalEndCall';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
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
import ToolbarItem from '../atoms/ToolbarItem';
import {ToolbarCustomItem} from 'src/atoms/ToolbarPreset';

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
const LayoutToolbarItem = () => (
  <ToolbarItem testID="layout-btn" collapsable={false}>
    {/**
     * .measure returns undefined on Android unless collapsable=false or onLayout are specified
     * so added collapsable property
     * https://github.com/facebook/react-native/issues/29712
     * */}
    <LayoutIconButton />
  </ToolbarItem>
);
const InviteToolbarItem = () => {
  return (
    <ToolbarItem testID="invite-btn">
      <CopyJoinInfo />
    </ToolbarItem>
  );
};
const defaultStartItems: Array<ToolbarCustomItem> = [
  {
    align: 'start',
    component: LayoutToolbarItem,
    order: 0,
    hide: 'no',
  },
  {
    align: 'start',
    component: InviteToolbarItem,
    order: 1,
    hide: 'no',
  },
];

const LiveStreamingHostToolbarItem = () => {
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop();
  return $config.EVENT_MODE && rtcProps.role == ClientRole.Audience ? (
    <LiveStreamControls showControls={true} isDesktop={isDesktop('toolbar')} />
  ) : (
    <></>
  );
};

const LiveStreamingAttendeeToolbarItem = () => {
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop();
  const {
    data: {isHost},
  } = useRoomInfo();
  return (
    /**
     * In event mode when raise hand feature is active
     * and audience is promoted to host, the audience can also
     * demote himself
     */
    $config.EVENT_MODE ? (
      <LiveStreamControls
        isDesktop={isDesktop('toolbar')}
        showControls={rtcProps?.role == ClientRole.Broadcaster && !isHost}
      />
    ) : (
      <></>
    )
  );
};

const LocalAudioToolbarItem = () => {
  return (
    <ToolbarItem testID="localAudio-btn">
      <LocalAudioMute showToolTip={true} />
    </ToolbarItem>
  );
};

const LocalVideoToolbarItem = () => {
  return (
    !$config.AUDIO_ROOM && (
      <ToolbarItem testID="localVideo-btn">
        <LocalVideoMute showToolTip={true} />
      </ToolbarItem>
    )
  );
};

const SwitchCameraToolbarItem = () => {
  return (
    !$config.AUDIO_ROOM &&
    isMobileOrTablet() && (
      <ToolbarItem testID="switchCamera-btn">
        <LocalSwitchCamera />
      </ToolbarItem>
    )
  );
};

const ScreenShareToolbarItem = () => {
  const {width} = useWindowDimensions();
  return (
    width > BREAKPOINTS.sm &&
    $config.SCREEN_SHARING &&
    !isMobileOrTablet() && (
      <ToolbarItem testID="screenShare-btn">
        <ScreenshareButton />
      </ToolbarItem>
    )
  );
};
const RecordingToolbarItem = () => {
  const {width} = useWindowDimensions();
  const {
    data: {isHost},
  } = useRoomInfo();
  return (
    width > BREAKPOINTS.sm &&
    isHost &&
    $config.CLOUD_RECORDING && (
      <ToolbarItem testID="recording-btn">
        <Recording />
      </ToolbarItem>
    )
  );
};

const MoreButtonToolbarItem = () => {
  const {width} = useWindowDimensions();
  return (
    width < BREAKPOINTS.md && (
      <ToolbarItem testID="more-btn">
        <MoreButton />
      </ToolbarItem>
    )
  );
};
const LocalEndcallToolbarItem = () => {
  return (
    <ToolbarItem testID="endCall-btn">
      <LocalEndcall />
    </ToolbarItem>
  );
};

const defaultCenterItems: ToolbarCustomItem[] = [
  {
    align: 'start',
    component: LiveStreamingHostToolbarItem,
    order: 0,
    hide: 'no',
  },
  {
    align: 'start',
    component: LiveStreamingAttendeeToolbarItem,
    order: 0,
    hide: 'no',
  },
  {
    align: 'start',
    component: LocalAudioToolbarItem,
    order: 1,
    hide: 'no',
  },
  {
    align: 'start',
    component: LocalVideoToolbarItem,
    order: 2,
    hide: 'no',
  },
  {
    align: 'start',
    component: SwitchCameraToolbarItem,
    order: 3,
    hide: 'no',
  },
  {
    align: 'start',
    component: ScreenShareToolbarItem,
    order: 4,
    hide: 'no',
  },
  {
    align: 'start',
    component: RecordingToolbarItem,
    order: 5,
    hide: 'no',
  },
  {
    align: 'start',
    component: MoreButtonToolbarItem,
    order: 6,
    hide: 'no',
  },
  {
    align: 'start',
    component: LocalEndcallToolbarItem,
    order: 7,
    hide: 'no',
  },
];

const defaultEndItems: ToolbarCustomItem[] = [];

interface ControlsProps {
  customItems?: ToolbarCustomItem[];
}
const Controls = (props: ControlsProps) => {
  const {customItems = []} = props;
  const {width} = useWindowDimensions();

  const customStartItems = customItems
    ?.filter((i) => i.align === 'start')
    ?.concat(defaultStartItems)
    ?.sort((a, b) => a.order - b.order);

  const customCenterItems = customItems
    ?.filter((i) => i.align === 'center')
    ?.concat(defaultCenterItems)
    ?.sort((a, b) => a.order - b.order);

  const customEndItems = customItems
    ?.filter((i) => i.align === 'end')
    ?.concat(defaultEndItems)
    ?.sort((a, b) => a.order - b.order);

  const renderContent = (
    items: ToolbarCustomItem[],
    type: 'start' | 'center' | 'end',
  ) => {
    return items.map((item, index) => {
      const ToolbarItem = item.component;
      return <ToolbarItem key={`bottom-toolbar-${type}` + index} />;
    });
  };
  return (
    <Toolbar>
      {width >= BREAKPOINTS.md && (
        <View style={[style.startContent]}>
          {renderContent(customStartItems, 'start')}
        </View>
      )}
      <View style={[style.centerContent]}>
        {renderContent(customCenterItems, 'center')}
      </View>
      {width >= BREAKPOINTS.md && (
        <View style={style.endContent}>
          {renderContent(customEndItems, 'end')}
        </View>
      )}
    </Toolbar>
  );
};

const style = StyleSheet.create({
  startContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    zIndex: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default Controls;
