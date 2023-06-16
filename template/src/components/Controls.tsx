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
  PersistanceLevel,
  SidePanelType,
  customEvents,
  useChatUIControls,
  useLayout,
  useLocalUserInfo,
  useRecording,
  useSidePanel,
} from 'customization-api';
import {useVideoCall} from './useVideoCall';
import {useScreenshare} from '../subComponents/screenshare/useScreenshare';
import LayoutIconDropdown from '../subComponents/LayoutIconDropdown';
import Toolbar from '../atoms/Toolbar';
import ToolbarItem from '../atoms/ToolbarItem';
import {ToolbarCustomItem} from '../atoms/ToolbarPreset';
import CaptionIcon from '../../src/subComponents/caption/CaptionIcon';
import {whiteboardContext} from '../../customization/whiteboard/WhiteboardConfigure';
import {RoomPhase} from 'white-web-sdk';
import useAINS from '../../customization/AINS/useAINS';
import useVB from '../../customization/VB/useVB';
import {ToggleState} from '../../agora-rn-uikit/src/Contexts/PropsContext';
import {useCaption} from '../subComponents/caption/useCaption';
import StorageContext from '../components/StorageContext';
import useSTTAPI from '../subComponents/caption/useSTTAPI';
import ImageIcon from '../atoms/ImageIcon';
import events from '../rtm-events-api';
import LanguageSelectorPopup, {
  getLanguageLabel,
} from '../subComponents/caption/LanguageSelectorPopup';
import {EventNames} from '../rtm-events';
import Toast from '../../react-native-toast-message';

const MoreButton = () => {
  const {video: localVideoStatus} = useLocalUserInfo();
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

  //whiteboard start

  const {
    whiteboardRoomState,
    whiteboardActive,
    joinWhiteboardRoom,
    leaveWhiteboardRoom,
  } = useContext(whiteboardContext);

  const WhiteboardStoppedCallBack = () => {
    toggleWhiteboard(true, false);
  };

  const WhiteboardStartedCallBack = () => {
    toggleWhiteboard(false, false);
  };

  useEffect(() => {
    whiteboardActive &&
      currentLayout !== 'whiteboard' &&
      setLayout('whiteboard');
    customEvents.on('WhiteBoardStopped', WhiteboardStoppedCallBack);
    customEvents.on('WhiteBoardStarted', WhiteboardStartedCallBack);

    return () => {
      customEvents.off('WhiteBoardStopped', WhiteboardStoppedCallBack);
      customEvents.off('WhiteBoardStarted', WhiteboardStartedCallBack);
    };
  }, []);

  const toggleWhiteboard = (
    whiteboardActive: boolean,
    triggerEvent: boolean,
  ) => {
    if (whiteboardActive) {
      leaveWhiteboardRoom();
      setLayout('grid');
      triggerEvent &&
        customEvents.send(
          'WhiteBoardStopped',
          JSON.stringify({}),
          PersistanceLevel.Session,
        );
    } else {
      joinWhiteboardRoom();
      setLayout('whiteboard');
      triggerEvent &&
        customEvents.send(
          'WhiteBoardStarted',
          JSON.stringify({}),
          PersistanceLevel.Session,
        );
    }
  };
  const WhiteboardDisabled =
    !isHost ||
    whiteboardRoomState === RoomPhase.Connecting ||
    whiteboardRoomState === RoomPhase.Disconnecting;

  //whiteboard ends

  const actionMenuitems: ActionMenuItem[] = [];
  if (isHost) {
    actionMenuitems.push({
      disabled: WhiteboardDisabled,
      isBase64Icon: true,
      //@ts-ignore
      icon: 'white-board',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: whiteboardActive ? 'Turn off Whiteboard' : 'Turn on Whiteboard',
      callback: () => {
        setActionMenuVisible(false);
        toggleWhiteboard(whiteboardActive, true);
      },
    });
  }
  //AINS
  const [isANISEnabled, setIsANISEnabled] = useState(false);
  const {disableNoiseSuppression, enableNoiseSuppression} = useAINS();
  const toggleAINS = () => {
    if (isANISEnabled) {
      disableNoiseSuppression();
      setIsANISEnabled(false);
    } else {
      enableNoiseSuppression();
      setIsANISEnabled(true);
    }
  };
  actionMenuitems.push({
    isBase64Icon: true,
    //@ts-ignore
    icon: 'ains',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: isANISEnabled ? 'Turn off AINS' : 'Turn on AINS',
    callback: () => {
      setActionMenuVisible(false);
      toggleAINS();
    },
  });
  //AINS

  // actionMenuitems.push({
  //   icon: 'closed-caption',
  //   iconColor: $config.SECONDARY_ACTION_COLOR,
  //   textColor: $config.FONT_COLOR,
  //   title: 'Show Caption',
  //   callback: () => {
  //     setActionMenuVisible(false);
  //   },
  // });

  //virtual background

  const [isImageVBOn, setIsImageVBOn] = useState(false);
  const [isColorVBOn, setIsColorVBOn] = useState(false);
  const [isBlurVBOn, setIsBlurVBOn] = useState(false);
  const STTMode = React.useRef(null);

  const {colorVB, disableVB, imageVB, blurVB} = useVB();

  actionMenuitems.push({
    disabled: localVideoStatus !== ToggleState.enabled,
    isBase64Icon: true,
    //@ts-ignore
    icon: 'vb-blur',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: isBlurVBOn ? 'Remove Blur BG' : 'Apply Blur BG',
    callback: () => {
      setActionMenuVisible(false);
      if (isBlurVBOn) {
        setIsBlurVBOn(false);
        disableVB();
      } else {
        setIsColorVBOn(false);
        setIsImageVBOn(false);
        setIsBlurVBOn(true);
        blurVB();
      }
    },
  });

  actionMenuitems.push({
    disabled: localVideoStatus !== ToggleState.enabled,
    isBase64Icon: true,
    //@ts-ignore
    icon: 'vb-color',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: isColorVBOn ? 'Remove Color BG' : 'Apply Color BG',
    callback: () => {
      setActionMenuVisible(false);
      if (isColorVBOn) {
        setIsColorVBOn(false);
        disableVB();
      } else {
        setIsImageVBOn(false);
        setIsBlurVBOn(false);
        setIsColorVBOn(true);
        colorVB();
      }
    },
  });
  actionMenuitems.push({
    disabled: localVideoStatus !== ToggleState.enabled,
    isBase64Icon: true,
    //@ts-ignore
    icon: 'vb-image',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: isImageVBOn ? 'Remove Image BG' : 'Apply Image BG',
    callback: () => {
      setActionMenuVisible(false);
      if (isImageVBOn) {
        setIsImageVBOn(false);
        disableVB();
      } else {
        setIsBlurVBOn(false);
        setIsColorVBOn(false);
        setIsImageVBOn(true);
        imageVB();
      }
    },
  });
  //virtual background

  //caption
  const {
    isCaptionON,
    setIsCaptionON,
    isTranscriptON,
    setIsTranscriptON,
    isSTTActive,
    setIsSTTActive,
    language,
    setLanguage,
  } = useCaption();
  const {store} = React.useContext(StorageContext);
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);

  const isLangPopupOpenedOnce = React.useRef(false);
  const {start} = useSTTAPI();

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  React.useEffect(() => {
    events.on(EventNames.STT_ACTIVE, (data) => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });

    events.on(EventNames.STT_LANGUAGE, (data) => {
      const payload = JSON.parse(data?.payload);
      const msg = `${
        payload.username
      } changed the spoken language to ${getLanguageLabel(payload.language)} `;

      Toast.show({
        type: 'info',
        leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
        text1: msg,
        visibilityTime: 3000,
      });
      // syncing local set language
      payload && setLanguage(payload.language);
    });
  }, []);

  const toggleSTT = async (method: string) => {
    // handleSTT
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel
    start();
  };

  const onLanguageChange = () => {
    // lang would be set on confirm click
    if (STTMode.current === 'caption') {
      toggleSTT(isCaptionON ? 'stop' : 'start');
      setIsCaptionON((prev) => !prev);
    }

    if (STTMode.current === 'transcript') {
      toggleSTT('start');
      if (isTranscriptON) {
        setSidePanel(SidePanelType.Transcript);
      } else {
        setSidePanel(SidePanelType.None);
      }
    }
    setLanguagePopup(false);
    isLangPopupOpenedOnce.current = true;
  };

  const label = isCaptionON ? 'Hide Caption' : 'Show Caption';
  actionMenuitems.push({
    icon: 'captions',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: label,
    callback: () => {
      STTMode.current = 'caption';
      setActionMenuVisible(false);
      if (isLangPopupOpenedOnce.current || isSTTActive) {
        // is lang popup has been shown once for any user in meeting
        // sidePanel === SidePanelType.Transcript &&
        //   !isCaptionON &&
        //   setSidePanel(SidePanelType.None);
        toggleSTT(isCaptionON ? 'stop' : 'start');
        setIsCaptionON((prev) => !prev);
      } else {
        setLanguagePopup(true);
      }
    },
  });

  actionMenuitems.push({
    icon: 'transcript-mode',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: isTranscriptON ? 'Hide Transcript' : 'Show Transcript',
    callback: () => {
      STTMode.current = 'transcript';
      setActionMenuVisible(false);

      if (isLangPopupOpenedOnce.current || isSTTActive) {
        // is lang popup has been shown once for any user in meeting
        // sidePanel === SidePanelType.Transcript &&
        //   !isCaptionON &&
        //   setSidePanel(SidePanelType.None);
        // toggleSTT(isCaptionON ? 'stop' : 'start');
        !isTranscriptON
          ? setSidePanel(SidePanelType.Transcript)
          : setSidePanel(SidePanelType.None);
      } else {
        setLanguagePopup(true);
      }
      setIsTranscriptON((prev) => !prev);
    },
  });

  //caption

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
      iconSrc: layouts[layout]?.icon,
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
      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onLanguageChange}
      />
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
export const LayoutToolbarItem = () => (
  <ToolbarItem testID="layout-btn" collapsable={false}>
    {/**
     * .measure returns undefined on Android unless collapsable=false or onLayout are specified
     * so added collapsable property
     * https://github.com/facebook/react-native/issues/29712
     * */}
    <LayoutIconButton />
  </ToolbarItem>
);
export const InviteToolbarItem = () => {
  return (
    <ToolbarItem testID="invite-btn">
      <CopyJoinInfo />
    </ToolbarItem>
  );
};

export const CaptionToolbarItem = () => {
  return (
    <ToolbarItem testID="caption-btn">
      <CaptionIcon />
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
  // {
  //   align: 'start',
  //   component: CaptionToolbarItem,
  //   order: 2,
  //   hide: 'no',
  // },
];

export const RaiseHandToolbarItem = () => {
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop();
  const {
    data: {isHost},
  } = useRoomInfo();
  return $config.EVENT_MODE ? (
    rtcProps.role == ClientRole.Audience ? (
      <LiveStreamControls
        showControls={true}
        isDesktop={isDesktop('toolbar')}
      />
    ) : rtcProps?.role == ClientRole.Broadcaster ? (
      /**
       * In event mode when raise hand feature is active
       * and audience is promoted to host, the audience can also
       * demote himself
       */
      <LiveStreamControls
        isDesktop={isDesktop('toolbar')}
        showControls={!isHost}
      />
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};

export const LocalAudioToolbarItem = () => {
  return (
    <ToolbarItem testID="localAudio-btn">
      <LocalAudioMute showToolTip={true} />
    </ToolbarItem>
  );
};

export const LocalVideoToolbarItem = () => {
  return (
    !$config.AUDIO_ROOM && (
      <ToolbarItem testID="localVideo-btn">
        <LocalVideoMute showToolTip={true} />
      </ToolbarItem>
    )
  );
};

export const SwitchCameraToolbarItem = () => {
  return (
    !$config.AUDIO_ROOM &&
    isMobileOrTablet() && (
      <ToolbarItem testID="switchCamera-btn">
        <LocalSwitchCamera />
      </ToolbarItem>
    )
  );
};

export const ScreenShareToolbarItem = () => {
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
export const RecordingToolbarItem = () => {
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

export const MoreButtonToolbarItem = () => {
  const {width} = useWindowDimensions();
  return (
    // width < BREAKPOINTS.md && (
    <ToolbarItem testID="more-btn">
      <MoreButton />
    </ToolbarItem>
    // )
  );
};
export const LocalEndcallToolbarItem = () => {
  return (
    <ToolbarItem testID="endCall-btn">
      <LocalEndcall />
    </ToolbarItem>
  );
};

const defaultCenterItems: ToolbarCustomItem[] = [
  {
    align: 'start',
    component: RaiseHandToolbarItem,
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

export interface ControlsProps {
  customItems?: ToolbarCustomItem[];
  includeDefaultItems?: boolean;
}
const Controls = (props: ControlsProps) => {
  const {customItems = [], includeDefaultItems = true} = props;
  const {width} = useWindowDimensions();

  const isHidden = (i) => {
    return i?.hide === 'yes';
  };
  const customStartItems = customItems
    ?.filter((i) => i?.align === 'start' && !isHidden(i))
    ?.concat(includeDefaultItems ? defaultStartItems : [])
    ?.sort((a, b) => a?.order - b?.order);

  const customCenterItems = customItems
    ?.filter((i) => i?.align === 'center' && !isHidden(i))
    ?.concat(includeDefaultItems ? defaultCenterItems : [])
    ?.sort((a, b) => a?.order - b?.order);

  const customEndItems = customItems
    ?.filter((i) => i?.align === 'end' && !isHidden(i))
    ?.concat(includeDefaultItems ? defaultEndItems : [])
    ?.sort((a, b) => a?.order - b?.order);

  const renderContent = (
    items: ToolbarCustomItem[],
    type: 'start' | 'center' | 'end',
  ) => {
    return items?.map((item, index) => {
      const ToolbarItem = item?.component;
      if (ToolbarItem) {
        return <ToolbarItem key={`bottom-toolbar-${type}` + index} />;
      } else {
        return null;
      }
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
