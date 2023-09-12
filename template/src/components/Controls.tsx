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
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import LocalEndcall, {LocalEndcallProps} from '../subComponents/LocalEndCall';
import Spacer from '../atoms/Spacer';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import IconButton from '../atoms/IconButton';
import ActionMenu, {ActionMenuItem} from '../atoms/ActionMenu';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {
  SidePanelType,
  useChatUIControl,
  useLayout,
  useRecording,
  useSidePanel,
} from 'customization-api';
import {useVideoCall} from './useVideoCall';
import {useScreenshare} from '../subComponents/screenshare/useScreenshare';
import LayoutIconDropdown from '../subComponents/LayoutIconDropdown';
import {useCaption} from '../../src/subComponents/caption/useCaption';
import LanguageSelectorPopup from '../../src/subComponents/caption/LanguageSelectorPopup';
import useSTTAPI from '../../src/subComponents/caption/useSTTAPI';
import {EventNames} from '../rtm-events';
import events, {EventPersistLevel} from '../rtm-events-api';
import Toast from '../../react-native-toast-message';
import {getLanguageLabel} from '../../src/subComponents/caption/utils';
import ImageIcon from '../atoms/ImageIcon';
import useGetName from '../utils/useGetName';
import {useRender} from 'customization-api';

const MoreButton = () => {
  const {rtcProps} = useContext(PropsContext);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredOnModal, setIsHoveredOnModal] = useState(false);
  const moreBtnRef = useRef(null);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const layouts = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const layout = layouts.findIndex(item => item.name === currentLayout);
  const {setSidePanel, sidePanel} = useSidePanel();
  const {
    isCaptionON,
    setIsCaptionON,
    language: prevLang,
    isSTTActive,
  } = useCaption();

  const isTranscriptON = sidePanel === SidePanelType.Transcript;

  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const isFirstTimePopupOpen = React.useRef(false);
  const STT_clicked = React.useRef(null);

  const {start, restart} = useSTTAPI();
  const {
    data: {isHost},
  } = useMeetingInfo();

  const {
    showLayoutOption,
    setShowInvitePopup,
    setShowStopRecordingPopup,
    setShowLayoutOption,
  } = useVideoCall();
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  const {isRecordingActive, startRecording, inProgress} = useRecording();
  const {setGroupActive} = useChatUIControl();
  const actionMenuitems: ActionMenuItem[] = [];

  // host can see stt options and attendee can view only when stt is enabled by a host in the channel

  actionMenuitems.push({
    icon: `${isCaptionON ? 'captions-off' : 'captions'}`,
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    disabled: !($config.ENABLE_STT && (isHost || (!isHost && isSTTActive))),
    title: `${isCaptionON ? 'Hide Caption' : 'Show Caption'}`,
    callback: () => {
      setActionMenuVisible(false);
      STT_clicked.current = !isCaptionON ? 'caption' : null;
      if (isSTTActive) {
        setIsCaptionON(prev => !prev);
        // is lang popup has been shown once for any user in meeting
      } else {
        isFirstTimePopupOpen.current = true;
        setLanguagePopup(true);
      }
    },
  });

  actionMenuitems.push({
    icon: 'transcript',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    disabled: !($config.ENABLE_STT && (isHost || (!isHost && isSTTActive))),
    title: `${isTranscriptON ? 'Hide Transcript' : 'Show Transcript'}`,
    callback: () => {
      setActionMenuVisible(false);
      STT_clicked.current = !isTranscriptON ? 'transcript' : null;
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
        setGroupActive(true);
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
      onHoverCallback: isHovered => {
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
    } else setActionMenuVisible(false);
  }, [isHovered]);

  useEffect(() => {
    //hide action menu when user change layout
    setActionMenuVisible(false);
  }, [currentLayout]);

  const onConfirm = async (langChanged, language) => {
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
      console.log('eror in starting stt', error);
    }
  };

  return (
    <>
      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onConfirm}
        isFirstTimePopupOpen={isFirstTimePopupOpen.current}
      />
      <ActionMenu
        containerStyle={{width: 180}}
        hoverMode={true}
        onHover={isVisible => setIsHoveredOnModal(isVisible)}
        from={'control-bar'}
        actionMenuVisible={isHovered || isHoveredOnModal}
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
  // attendee can view option if any host has started STT
  const {renderList} = useRender();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const {width} = useWindowDimensions();
  const {setIsSTTActive, setLanguage, setMeetingTranscript} = useCaption();
  const renderListRef = React.useRef(renderList);

  React.useEffect(() => {
    renderListRef.current = renderList;
  }, [renderList]);

  React.useEffect(() => {
    events.on(EventNames.STT_ACTIVE, data => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });
  }, []);

  React.useEffect(() => {
    // for native events are set in ActionSheetContent as this action is action sheet
    if (isWebInternal()) {
      events.on(EventNames.STT_LANGUAGE, data => {
        const {username, prevLang, newLang, uid} = JSON.parse(data?.payload);
        const actionText =
          prevLang.indexOf('') !== -1
            ? `has set the spoken language to  "${getLanguageLabel(newLang)}" `
            : `changed the spoken language from "${getLanguageLabel(
                prevLang,
              )}" to "${getLanguageLabel(newLang)}" `;
        const msg = `${
          renderListRef.current[uid]?.name || username
        } ${actionText} `;

        Toast.show({
          type: 'info',
          leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
          text1: `Spoken Language ${
            prevLang.indexOf('') !== -1 ? 'Set' : 'Changed'
          }`,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          text2: msg,
        });
        // syncing local set language
        newLang && setLanguage(newLang);
        // add spoken lang msg to transcript
        setMeetingTranscript(prev => {
          return [
            ...prev,
            {
              name: 'langUpdate',
              time: new Date().getTime(),
              uid: `langUpdate-${uid}`,
              text: actionText,
            },
          ];
        });
      });
    }
  }, []);

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  return (
    <View
      testID="videocall-controls"
      style={[
        style.container,
        {
          paddingHorizontal: isDesktop('toolbar') ? 32 : 16,
        },
      ]}>
      {width >= BREAKPOINTS.md && (
        <View style={style.leftContent}>
          <View
            testID="layout-btn"
            style={{marginRight: 10}}
            collapsable={false}>
            {/**
             * .measure returns undefined on Android unless collapsable=false or onLayout are specified
             * so added collapsable property
             * https://github.com/facebook/react-native/issues/29712
             * */}
            <LayoutIconButton />
          </View>
          <View testID="invite-btn" style={{marginHorizontal: 10}}>
            <CopyJoinInfo />
          </View>
        </View>
      )}
      <View style={style.centerContent}>
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
          <View testID="localAudio-btn" style={{marginHorizontal: 10}}>
            <LocalAudioMute showToolTip={true} />
          </View>
          {!$config.AUDIO_ROOM && (
            <View
              testID="localVideo-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <LocalVideoMute showToolTip={true} />
            </View>
          )}
          {!$config.AUDIO_ROOM && isMobileOrTablet() && (
            <View
              testID="switchCamera-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <LocalSwitchCamera />
            </View>
          )}
          {width > BREAKPOINTS.sm &&
            $config.SCREEN_SHARING &&
            !isMobileOrTablet() && (
              <View
                testID="screenShare-btn"
                style={{
                  marginHorizontal: 10,
                }}>
                <ScreenshareButton />
              </View>
            )}
          {width > BREAKPOINTS.sm && isHost && $config.CLOUD_RECORDING && (
            <View
              testID="recording-btn"
              style={{
                marginHorizontal: 10,
              }}>
              <Recording />
            </View>
          )}
        </>
        {(width < BREAKPOINTS.md || $config.ENABLE_STT) && (
          <View testID="more-btn" style={{marginHorizontal: 10}}>
            <MoreButton />
          </View>
        )}
        <View testID="endCall-btn" style={{marginHorizontal: 10}}>
          <LocalEndcall />
        </View>
      </View>
      {width >= BREAKPOINTS.md && <View style={style.rightContent}></View>}
    </View>
  );
};

type ControlsComponentsArrayProps = [
  (props: LocalAudioMuteProps) => JSX.Element,
  (props: LocalVideoMuteProps) => JSX.Element,
  (props: LocalSwitchCameraProps) => JSX.Element,
  (props: ScreenshareButtonProps) => JSX.Element,
  (props: RecordingButtonProps) => JSX.Element,
  (props: LocalEndcallProps) => JSX.Element,
  (props: LiveStreamControlsProps) => JSX.Element,
];

export const ControlsComponentsArray: ControlsComponentsArrayProps = [
  LocalAudioMute,
  LocalVideoMute,
  LocalSwitchCamera,
  ScreenshareButton,
  Recording,
  LocalEndcall,
  LiveStreamControls,
];

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: $config.TOOLBAR_COLOR,
  },
  leftContent: {
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
  rightContent: {
    flex: 1,
  },
});

export default Controls;
