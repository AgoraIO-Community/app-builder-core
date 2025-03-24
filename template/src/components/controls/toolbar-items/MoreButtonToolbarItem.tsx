import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useReducer,
} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {
  DispatchContext,
  PropsContext,
  ToggleState,
} from '../../../../agora-rn-uikit';
import {ClientRoleType} from '../../../../agora-rn-uikit';
import {
  BREAKPOINTS,
  isWeb,
  isWebInternal,
  MergeMoreButtonFields,
  CustomToolbarSort,
} from '../../../utils/common';
import {useRoomInfo} from './../../room-info/useRoomInfo';
import IconButton from '../../../atoms/IconButton';
import ActionMenu, {ActionMenuItem} from '../../../atoms/ActionMenu';
import useLayoutsData from '../../../pages/video-call/useLayoutsData';
import {
  ChatType,
  SidePanelType,
  useChatUIControls,
  useContent,
  useLayout,
  useRecording,
  useSidePanel,
} from 'customization-api';
import {useVideoCall} from './../../useVideoCall';
import {useScreenshare} from '../../../subComponents/screenshare/useScreenshare';
import LayoutIconDropdown from '../../../subComponents/LayoutIconDropdown';
import {useCaption} from '../../../subComponents/caption/useCaption';
import LanguageSelectorPopup from '../../../subComponents/caption/LanguageSelectorPopup';
import useSTTAPI from '../../../subComponents/caption/useSTTAPI';
import {EventNames} from '../../../rtm-events';
import events, {PersistanceLevel} from '../../../rtm-events-api';
import Toast from '../../../../react-native-toast-message';
import ToolbarItem, {useToolbarProps} from '../../../atoms/ToolbarItem';
import {
  ToolbarItemHide,
  ToolbarMoreButtonDefaultFields,
  ToolbarMoreButtonCustomFields,
} from '../../../atoms/ToolbarPreset';
import {whiteboardContext} from './../../whiteboard/WhiteboardConfigure';
import {RoomPhase} from 'white-web-sdk';
import {useNoiseSupression} from '../../../app-state/useNoiseSupression';
import {useVB} from './../../virtual-background/useVB';
import WhiteboardWrapper from './../../whiteboard/WhiteboardWrapper';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../../rtm-events-api/LocalEvents';
import {useString} from '../../../utils/useString';
import {
  toolbarItemCaptionText,
  toolbarItemChatText,
  toolbarItemInviteText,
  toolbarItemLayoutText,
  toolbarItemMoreText,
  toolbarItemNoiseCancellationText,
  toolbarItemPeopleText,
  toolbarItemRecordingText,
  toolbarItemViewRecordingText,
  toolbarItemSettingText,
  toolbarItemShareText,
  toolbarItemTranscriptText,
  toolbarItemVirtualBackgroundText,
  toolbarItemWhiteboardText,
} from '../../../language/default-labels/videoCallScreenLabels';
import {LogSource, logger} from '../../../logger/AppBuilderLogger';
import {useModal} from '../../../utils/useModal';
import ViewRecordingsModal from './../../recordings/ViewRecordingsModal';
import RecordingDeletePopup from './../../recordings/RecordingDeletePopup';
import {WhiteboardListener} from '../../whiteboard/WhiteboardListener';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const MoreButtonToolbarItem = (props?: {
  fields?: ToolbarMoreButtonCustomFields;
}) => {
  const {width} = useWindowDimensions();
  const {
    data: {isHost},
  } = useRoomInfo();
  const {isSTTActive} = useCaption();
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    forceUpdate();
  }, [isHost]);

  const canAccessWhiteBoard = useControlPermissionMatrix('whiteboardControl');
  const canAccessVirtualBg = useControlPermissionMatrix(
    'virtualBackgroundControl',
  );
  const canAccessNoiseCancellation = useControlPermissionMatrix(
    'noiseCancellationControl',
  );
  const canAccessSTT = useControlPermissionMatrix('sttControl');
  const canAccessViewRecordings = useControlPermissionMatrix(
    'viewRecordingControl',
  );
  const canViewMoreButton =
    width < BREAKPOINTS.lg ||
    (canAccessSTT && (isHost || (!isHost && isSTTActive))) ||
    canAccessNoiseCancellation ||
    canAccessViewRecordings ||
    canAccessVirtualBg ||
    canAccessWhiteBoard;

  return canViewMoreButton ? (
    <ToolbarItem testID="more-btn" toolbarProps={props}>
      {((!$config.AUTO_CONNECT_RTM && !isHost) || $config.AUTO_CONNECT_RTM) &&
      $config.ENABLE_WHITEBOARD &&
      isWebInternal() ? (
        <WhiteboardListener />
      ) : (
        <></>
      )}
      <MoreButton fields={props?.fields} />
    </ToolbarItem>
  ) : (
    <WhiteboardListener />
  );
};

const MoreButton = (props: {fields: ToolbarMoreButtonDefaultFields}) => {
  const {label} = useToolbarProps();
  const {data} = useRoomInfo();

  // Action Item Labels
  const noiseCancellationLabel = useString(toolbarItemNoiseCancellationText)();
  const whiteboardLabel = useString<boolean>(toolbarItemWhiteboardText);
  const captionLabel = useString<boolean>(toolbarItemCaptionText);
  const transcriptLabel = useString<boolean>(toolbarItemTranscriptText);
  const settingsLabel = useString(toolbarItemSettingText)();
  const screenShareButton = useString<boolean>(toolbarItemShareText);
  const recordingButton = useString<boolean>(toolbarItemRecordingText);
  const viewRecordingsLabel = useString<boolean>(
    toolbarItemViewRecordingText,
  )();
  const moreButtonLabel = useString(toolbarItemMoreText)();
  const virtualBackgroundLabel = useString(toolbarItemVirtualBackgroundText)();
  const chatLabel = useString(toolbarItemChatText)();
  const inviteLabel = useString(toolbarItemInviteText)();
  const peopleLabel = useString(toolbarItemPeopleText)();
  const layoutLabel = useString(toolbarItemLayoutText)();

  const {dispatch} = useContext(DispatchContext);
  const {rtcProps} = useContext(PropsContext);
  const {setCustomContent} = useContent();
  const [isHoveredOnModal, setIsHoveredOnModal] = useState(false);
  const moreBtnRef = useRef(null);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const layouts = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const layout = layouts.findIndex(item => item.name === currentLayout);
  const {setSidePanel, sidePanel} = useSidePanel();
  const isFirstTimePopupOpen = React.useRef(false);
  const {
    data: {isHost},
  } = useRoomInfo();

  const {setShowInvitePopup, setShowStopRecordingPopup, setShowLayoutOption} =
    useVideoCall();

  // Action Menu Popover
  const [_, setActionMenuVisible] = React.useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setActionMenuVisible(true);
    } else setActionMenuVisible(false);
  }, [isHovered]);

  useEffect(() => {
    // Hide action menu when user change layout
    setActionMenuVisible(false);
  }, [currentLayout]);

  // Initialize Action Menu Items
  const actionMenuitems: ActionMenuItem[] = [];

  //AINS - Noise suppression Control
  const {isNoiseSupressionEnabled, setNoiseSupression} = useNoiseSupression();
  const canShowAINSControls = useControlPermissionMatrix(
    'noiseCancellationControl',
  );
  if (canShowAINSControls) {
    actionMenuitems.push({
      componentName: 'noise-cancellation',
      order: 0,
      toggleStatus: isNoiseSupressionEnabled === ToggleState.enabled,
      disabled:
        isNoiseSupressionEnabled === ToggleState.disabling ||
        isNoiseSupressionEnabled === ToggleState.enabling,
      isBase64Icon: true,
      //@ts-ignore
      icon: 'noise-cancellation',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: noiseCancellationLabel,
      //isNoiseSupressionEnabled === ToggleState.enabled
      onPress: () => {
        setActionMenuVisible(false);
        setNoiseSupression(p => !p);
      },
    });
  }

  //Virtual background Control
  const {isVBActive, setIsVBActive} = useVB();
  const canShowVBControl = useControlPermissionMatrix(
    'virtualBackgroundControl',
  );
  if (canShowVBControl) {
    actionMenuitems.push({
      componentName: 'virtual-background',
      order: 1,
      isBase64Icon: true,
      //@ts-ignore
      icon: 'vb',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      //title: `${isVBActive ? 'Hide' : 'Show'} Virtual Background`,
      title: virtualBackgroundLabel,
      onPress: () => {
        setActionMenuVisible(false);
        if (isVBActive) {
          setSidePanel(SidePanelType.None);
        } else {
          setSidePanel(SidePanelType.VirtualBackground);
        }
        setIsVBActive(prev => !prev);
      },
    });
  }

  //Whiteboard Control
  const {
    whiteboardRoomState,
    whiteboardActive,
    joinWhiteboardRoom,
    leaveWhiteboardRoom,
    getWhiteboardUid,
  } = useContext(whiteboardContext);

  const WhiteboardStoppedCallBack = () => {
    toggleWhiteboard(true, false);
  };

  const WhiteboardStartedCallBack = () => {
    toggleWhiteboard(false, false);
  };

  useEffect(() => {
    whiteboardActive && currentLayout !== 'pinned' && setLayout('pinned');
  }, []);

  const WhiteboardCallBack = ({status}) => {
    if (status) {
      WhiteboardStartedCallBack();
    } else {
      WhiteboardStoppedCallBack();
    }
  };

  useEffect(() => {
    LocalEventEmitter.on(
      LocalEventsEnum.WHITEBOARD_ACTIVE_LOCAL,
      WhiteboardCallBack,
    );
    return () => {
      LocalEventEmitter.off(
        LocalEventsEnum.WHITEBOARD_ACTIVE_LOCAL,
        WhiteboardCallBack,
      );
    };
  }, []);

  const toggleWhiteboard = (
    whiteboardActive: boolean,
    triggerEvent: boolean,
  ) => {
    if ($config.ENABLE_WHITEBOARD) {
      if (whiteboardActive) {
        leaveWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), false);
        setLayout('grid');
        triggerEvent &&
          events.send(
            EventNames.WHITEBOARD_ACTIVE,
            JSON.stringify({status: false}),
            PersistanceLevel.Session,
          );
      } else {
        joinWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), WhiteboardWrapper, {}, true);
        dispatch({
          type: 'UserPin',
          value: [getWhiteboardUid()],
        });
        setLayout('pinned');
        triggerEvent &&
          events.send(
            EventNames.WHITEBOARD_ACTIVE,
            JSON.stringify({status: true}),
            PersistanceLevel.Session,
          );
      }
    }
  };

  const WhiteboardDisabled =
    !isHost ||
    whiteboardRoomState === RoomPhase.Connecting ||
    whiteboardRoomState === RoomPhase.Disconnecting;

  //Disable whiteboard button when backend sends error
  const WhiteboardError =
    data?.whiteboard?.error &&
    (data?.whiteboard?.error?.code || data?.whiteboard?.error?.message)
      ? true
      : false;

  const canViewWhiteboardControl =
    useControlPermissionMatrix('whiteboardControl');
  if (canViewWhiteboardControl) {
    actionMenuitems.push({
      componentName: 'whiteboard',
      order: 2,
      disabled: WhiteboardDisabled,
      isBase64Icon: true,
      //@ts-ignore
      icon: 'whiteboard-new',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: whiteboardLabel(whiteboardActive),
      onPress: () => {
        if (WhiteboardError) {
          setActionMenuVisible(false);
          Toast.show({
            leadingIconName: 'alert',
            type: 'error',
            text1: 'Failed to enable Whiteboard Service.',
            text2: data?.whiteboard?.error?.message,
            visibilityTime: 1000 * 10,
            primaryBtn: null,
            secondaryBtn: null,
            leadingIcon: null,
          });
          logger.error(
            LogSource.Internals,
            'JOIN_MEETING',
            'Failed to enable Whiteboard Service',
            {
              message: data?.whiteboard?.error?.message,
              code: data?.whiteboard?.error?.code,
            },
          );
        } else {
          setActionMenuVisible(false);
          toggleWhiteboard(whiteboardActive, true);
        }
      },
    });
  }

  /**
   * STT Control
   * host can see stt options and attendee can view only when
   * stt is enabled by a host in the channel
   */
  const {isCaptionON, setIsCaptionON, isSTTActive, isSTTError} = useCaption();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const isTranscriptON = sidePanel === SidePanelType.Transcript;

  const STT_clicked = React.useRef(null);

  const {start, restart} = useSTTAPI();

  const onLanguageSelectorConfirm = async (langChanged, language) => {
    const isCaptionClicked = STT_clicked.current === 'caption';
    const isTranscriptClicked = STT_clicked.current === 'transcript';
    setLanguagePopup(false);
    isFirstTimePopupOpen.current = false;
    const method = isCaptionClicked
      ? isCaptionON
      : isTranscriptON
      ? 'stop'
      : 'start';
    if (isTranscriptClicked) {
      if (!isTranscriptON) {
        setSidePanel(SidePanelType.Transcript);
      } else {
        setSidePanel(SidePanelType.None);
      }
    }
    if (method === 'stop') return; // not closing the stt service as it will stop for whole channel
    if (method === 'start' && isSTTActive === true) return; // not triggering the start service if STT Service already started by anyone else in the channel

    if (isCaptionClicked) {
      setIsCaptionON(prev => !prev);
    } else {
    }

    try {
      const res = await start(language);
      if (res?.message.includes('STARTED')) {
        // channel is already started now restart
        await restart(language);
      }
    } catch (error) {
      logger.error(LogSource.Internals, 'STT', 'error in starting stt', error);
    }
  };

  const canViewSTTControl = useControlPermissionMatrix('sttControl');
  if (canViewSTTControl) {
    actionMenuitems.push({
      componentName: 'caption',
      order: 3,
      icon: `${isCaptionON ? 'captions-off' : 'captions'}`,
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      disabled: !(
        $config.ENABLE_STT &&
        $config.ENABLE_CAPTION &&
        (isHost || (!isHost && isSTTActive))
      ),
      title: captionLabel(isCaptionON),
      onPress: () => {
        setActionMenuVisible(false);
        STT_clicked.current = !isCaptionON ? 'caption' : null;
        if (isSTTError) {
          setIsCaptionON(prev => !prev);
          return;
        }
        if (isSTTActive) {
          setIsCaptionON(prev => !prev);
          // is lang popup has been shown once for any user in meeting
        } else {
          isFirstTimePopupOpen.current = true;
          setLanguagePopup(true);
        }
      },
    });

    const canViewTranscriptControl = $config.ENABLE_MEETING_TRANSCRIPT;
    if (canViewTranscriptControl) {
      actionMenuitems.push({
        componentName: 'transcript',
        order: 4,
        icon: 'transcript',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.FONT_COLOR,
        disabled: !(
          $config.ENABLE_STT &&
          $config.ENABLE_CAPTION &&
          $config.ENABLE_MEETING_TRANSCRIPT &&
          (isHost || (!isHost && isSTTActive))
        ),
        title: transcriptLabel(isTranscriptON),
        onPress: () => {
          setActionMenuVisible(false);
          STT_clicked.current = !isTranscriptON ? 'transcript' : null;
          if (isSTTError) {
            !isTranscriptON
              ? setSidePanel(SidePanelType.Transcript)
              : setSidePanel(SidePanelType.None);
            return;
          }
          if (isSTTActive) {
            !isTranscriptON
              ? setSidePanel(SidePanelType.Transcript)
              : setSidePanel(SidePanelType.None);
          } else {
            isFirstTimePopupOpen.current = true;
            setLanguagePopup(true);
          }
        },
      });
    }
  }

  // View Recordings Control
  const {
    modalOpen: isVRModalOpen,
    setModalOpen: setVRModalOpen,
    toggle: toggleVRModal,
  } = useModal();

  const [isRecordingDeletePopupVisible, setRecordingDeletePopupVisible] =
    React.useState<boolean>(false);
  const [recordingIdToDelete, setRecordingIdToDelete] = useState(0);

  const onRecordingDeleteConfirmation = () => {
    setRecordingDeletePopupVisible(false);
    deleteRecording(recordingIdToDelete)
      .then(() => {
        //To inform other user -> refresh the recording list
        //in case recording list opened
        events.send(
          EventNames.RECORDING_DELETED,
          JSON.stringify({recordingId: recordingIdToDelete}),
          PersistanceLevel.None,
        );
        Toast.show({
          leadingIconName: 'alert',
          type: 'success',
          text1: 'Recording has been deleted successfully.',
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        setRecordingIdToDelete(0);
        //to reopen recording list again
        setTimeout(() => {
          setVRModalOpen(true);
        }, 3000);
      })
      .catch(() => {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text1: 'Failed to delete the recording. Please try again later',
          visibilityTime: 1000 * 10,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        setRecordingIdToDelete(0);
      });
  };

  const onRecordingDeleteCancel = () => {
    setRecordingIdToDelete(0);
    toggleVRModal();
  };

  const canViewRecordingControl = useControlPermissionMatrix(
    'viewRecordingControl',
  );
  if (canViewRecordingControl) {
    actionMenuitems.push({
      componentName: 'view-recordings',
      order: 5,
      icon: 'play-circle',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: viewRecordingsLabel,
      onPress: () => {
        toggleVRModal();
      },
    });
  }

  // Participants Control
  const canViewParticipantControl =
    useControlPermissionMatrix('participantControl');
  if (canViewParticipantControl) {
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.lg ? true : false;
      },
      componentName: 'participant',
      order: 6,
      icon: 'participants',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: peopleLabel,
      onPress: () => {
        setActionMenuVisible(false);
        setSidePanel(SidePanelType.Participants);
      },
    });
  }

  // Chat Control
  const {setChatType} = useChatUIControls();
  const canViewChatControl = useControlPermissionMatrix('chatControl');
  if (canViewChatControl) {
    //disable chat button when BE sends error on chat
    const ChatError =
      data?.chat?.error &&
      (data?.chat?.error?.code || data?.chat?.error?.message)
        ? true
        : false;
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.lg ? true : false;
      },
      componentName: 'chat',
      order: 7,
      icon: 'chat-nav',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: chatLabel,
      onPress: () => {
        if (ChatError) {
          setActionMenuVisible(false);
          Toast.show({
            leadingIconName: 'alert',
            type: 'error',
            text1: 'Failed to enable Chat Service.',
            text2: data?.chat?.error?.message,
            visibilityTime: 1000 * 10,
            primaryBtn: null,
            secondaryBtn: null,
            leadingIcon: null,
          });
          logger.error(
            LogSource.Internals,
            'JOIN_MEETING',
            'Failed to enable Chat Service',
            {
              message: data?.chat?.error?.message,
              code: data?.chat?.error?.code,
            },
          );
        } else {
          setActionMenuVisible(false);
          setChatType(ChatType.Group);
          setSidePanel(SidePanelType.Chat);
        }
      },
    });
  }

  // Screensharing Control
  const {isScreenshareActive, startScreenshare, stopScreenshare} =
    useScreenshare();

  const canViewScreenshareControl =
    useControlPermissionMatrix('screenshareControl');
  if (canViewScreenshareControl) {
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.sm ? true : false;
      },
      componentName: 'screenshare',
      order: 8,
      disabled:
        rtcProps.role == ClientRoleType.ClientRoleAudience &&
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
      title: screenShareButton(isScreenshareActive),
      onPress: () => {
        setActionMenuVisible(false);
        isScreenshareActive ? stopScreenshare() : startScreenshare();
      },
    });
  }

  // Start Recording Control
  const {isRecordingActive, startRecording, inProgress, deleteRecording} =
    useRecording();

  const canStartRecordingControl = useControlPermissionMatrix(
    'startRecordingControl',
  );
  if (canStartRecordingControl) {
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.sm ? true : false;
      },
      componentName: 'recording',
      order: 9,
      disabled: inProgress,
      icon: isRecordingActive ? 'stop-recording' : 'recording',
      iconColor: isRecordingActive
        ? $config.SEMANTIC_ERROR
        : $config.SECONDARY_ACTION_COLOR,
      textColor: isRecordingActive
        ? $config.SEMANTIC_ERROR
        : $config.FONT_COLOR,
      title: recordingButton(isRecordingActive),
      onPress: () => {
        setActionMenuVisible(false);
        if (!isRecordingActive) {
          startRecording();
        } else {
          setShowStopRecordingPopup(true);
        }
      },
    });
  }

  // Layout Control
  actionMenuitems.push({
    hide: w => {
      return w >= BREAKPOINTS.lg ? true : false;
    },
    componentName: 'layout',
    order: 10,
    //below icon key is dummy value
    icon: 'grid',
    externalIconString: layouts[layout]?.icon,
    isExternalIcon: true,
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: layoutLabel,
    onPress: () => {
      //setShowLayoutOption(true);
    },
    onHoverCallback: isHovered => {
      setShowLayoutOption(isHovered);
    },
    onHoverContent: (
      <LayoutIconDropdown
        onHoverPlaceHolder="vertical"
        setShowDropdown={() => {}}
        showDropdown={true}
        modalPosition={
          globalWidth <= BREAKPOINTS.lg
            ? {bottom: 65, left: -150}
            : {bottom: 20, left: -150}
        }
        caretPosition={{bottom: 45, right: -10}}
      />
    ),
  });

  // Invite Control
  const canViewInviteControl = useControlPermissionMatrix('inviteControl');
  if (canViewInviteControl) {
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.lg ? true : false;
      },
      componentName: 'invite',
      order: 11,
      icon: 'share',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: inviteLabel,
      onPress: () => {
        setActionMenuVisible(false);
        setShowInvitePopup(true);
      },
    });
  }

  // Settings Control
  const canViewSettingsControl = useControlPermissionMatrix('settingsControl');
  if (canViewSettingsControl) {
    actionMenuitems.push({
      hide: w => {
        return w >= BREAKPOINTS.lg ? true : false;
      },
      componentName: 'settings',
      order: 12,
      icon: 'settings',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: settingsLabel,
      onPress: () => {
        setActionMenuVisible(false);
        setSidePanel(SidePanelType.Settings);
      },
    });
  }

  // Filter out hidden action items
  const isHidden = (hide: ToolbarItemHide = false) => {
    try {
      return typeof hide === 'boolean'
        ? hide
        : typeof hide === 'function'
        ? hide(globalWidth, globalHeight)
        : false;
    } catch (error) {
      console.log('debugging isHidden error', error);
      return false;
    }
  };

  const moreButtonFields = props?.fields || {};

  const filteredActionMenuItems = MergeMoreButtonFields(
    actionMenuitems,
    moreButtonFields,
  )
    ?.filter(i => !isHidden(i))
    ?.sort(CustomToolbarSort);

  return (
    <>
      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onLanguageSelectorConfirm}
        isFirstTimePopupOpen={isFirstTimePopupOpen.current}
      />
      {$config.CLOUD_RECORDING && isHost && isWeb() && (
        <>
          <RecordingDeletePopup
            modalVisible={isRecordingDeletePopupVisible}
            setModalVisible={setRecordingDeletePopupVisible}
            onConfirm={onRecordingDeleteConfirmation}
            onCancel={onRecordingDeleteCancel}
          />
          {isVRModalOpen ? (
            <ViewRecordingsModal
              setModalOpen={setVRModalOpen}
              onDeleteAction={id => {
                setRecordingIdToDelete(id);
                toggleVRModal();
                setRecordingDeletePopupVisible(true);
              }}
            />
          ) : (
            <></>
          )}
        </>
      )}
      <ActionMenu
        containerStyle={globalWidth < 720 ? {width: 180} : {width: 260}}
        hoverMode={true}
        onHover={isVisible => setIsHoveredOnModal(isVisible)}
        from={'control-bar'}
        actionMenuVisible={isHovered || isHoveredOnModal}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={{
          bottom: 8,
          left: 0,
        }}
        items={filteredActionMenuItems}
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
          setRef={ref => {
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
            text: $config.ICON_TEXT ? label || moreButtonLabel : '',
            textColor: $config.FONT_COLOR,
          }}
        />
      </div>
    </>
  );
};
