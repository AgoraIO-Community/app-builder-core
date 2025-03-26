import React, {useContext, useEffect, useRef, useState} from 'react';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../../utils/useRemoteMute';
import {
  ContentInterface,
  SidePanelType,
  useLayout,
  useLocalUid,
  useRoomInfo,
  useContent,
  useSidePanel,
} from 'customization-api';
import {
  DefaultLayouts,
  getPinnedLayoutName,
} from '../../pages/video-call/DefaultLayouts';
import useRemoteRequest, {
  REQUEST_REMOTE_TYPE,
} from '../../utils/useRemoteRequest';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import {useChatMessages} from '../chat-messages/useChatMessages';
import {useLiveStreamDataContext} from '../contexts/LiveStreamDataContext';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import LiveStreamContext from '../livestream/LiveStreamContext';
import {
  ClientRoleType,
  DispatchContext,
  UidType,
} from '../../../agora-rn-uikit';
import {useWindowDimensions} from 'react-native';
import {
  LiveStreamControlMessageEnum,
  RaiseHandValue,
} from '../livestream/Types';
import events, {PersistanceLevel} from '../../rtm-events-api';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import RemoveScreensharePopup from '../../subComponents/RemoveScreensharePopup';
import useRemoteEndScreenshare from '../../utils/useRemoteEndScreenshare';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import {useFocus} from '../../utils/useFocus';
import Toast from '../../../react-native-toast-message';
import RemoteMutePopup from '../../subComponents/RemoteMutePopup';
import {calculatePosition, isMobileUA, trimText} from '../../utils/common';
import {useVideoCall} from '../useVideoCall';
import {customEvents} from 'customization-api';
import {useDisableChat} from '../disable-chat/useDisableChat';
import {useWhiteboard} from '../../components/whiteboard/WhiteboardConfigure';
import {useString} from '../../utils/useString';
import {
  I18nMuteType,
  moreBtnAddAsPresenter,
  moreBtnAudio,
  moreBtnChangeName,
  moreBtnMessagePrivately,
  moreBtnPinToTop,
  moreBtnRemoveAsPresenter,
  moreBtnRemoveFromLarge,
  moreBtnRemoveFromRoom,
  moreBtnRemoveFromTop,
  moreBtnRemoveScreenShare,
  moreBtnSpotlight,
  moreBtnStopScreenShare,
  moreBtnVideo,
  moreBtnViewInLarge,
  moreBtnViewWhiteboard,
  userRemovedFromTheRoomToastHeading,
} from '../../language/default-labels/videoCallScreenLabels';
import {isAndroid, isIOS} from '../../utils/common';
import {EventNames} from '../../rtm-events';
import {
  ActionVisibility,
  DEFAULT_ACTION_KEYS,
  UserActionMenuItemsConfig,
} from '../../atoms/UserActionMenuPreset';

interface UserActionMenuOptionsOptionsProps {
  user: ContentInterface;
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: any;
  from: 'partcipant' | 'screenshare-participant' | 'video-tile';
  spotlightUid?: UidType;
  setSpotlightUid?: (uid: UidType) => void;
  items?: UserActionMenuItemsConfig;
}
export default function UserActionMenuOptionsOptions(
  props: UserActionMenuOptionsOptionsProps,
) {
  const [showAudioMuteModal, setShowAudioMuteModal] = useState(false);
  const [showVideoMuteModal, setShowVideoMuteModal] = useState(false);
  const [isPosCalculated, setIsPosCalculated] = useState(false);
  const {setFocus} = useFocus();
  const {stopScreenshare} = useScreenshare();
  const remoteEndScreenshare = useRemoteEndScreenshare();
  const [removeScreensharePopupVisible, setRemoveScreensharePopupVisible] =
    useState(false);
  const [actionMenuitems, setActionMenuitems] = useState<ActionMenuItem[]>([]);
  const {setSidePanel} = useSidePanel();
  const {user, actionMenuVisible, setActionMenuVisible, spotlightUid} = props;
  const {currentLayout} = useLayout();
  const {pinnedUid, activeUids, customContent, secondaryPinnedUid} =
    useContent();
  const {dispatch} = useContext(DispatchContext);
  const {setLayout} = useLayout();
  const localuid = useLocalUid();
  const {openPrivateChat} = useChatMessages();
  const {hostUids, audienceUids} = useLiveStreamDataContext();
  const {
    data: {isHost},
    roomPreference: {userRemovalTimeout},
  } = useRoomInfo();
  const remoteRequest = useRemoteRequest();
  const remoteMute = useRemoteMute();
  const endRemoteCall = useRemoteEndCall();
  const {promoteAudienceAsCoHost, raiseHandList} =
    useContext(LiveStreamContext);
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);
  const {enablePinForMe} = useVideoCall();
  const {setDisableChatUids, disableChatUids} = useDisableChat();
  const {getWhiteboardUid = () => 0} = useWhiteboard();

  const viewWhiteboardLabel = useString(moreBtnViewWhiteboard)();
  const removeFromLargeLabel = useString(moreBtnRemoveFromLarge)();
  const viewInLargeLabel = useString(moreBtnViewInLarge)();
  const pinToTopLabel = useString(moreBtnPinToTop)();
  const removeFromTopLabel = useString(moreBtnRemoveFromTop)();
  const messagePrivatelyLabel = useString(moreBtnMessagePrivately)();
  const audioLabel = useString<boolean>(moreBtnAudio);
  const videoLabel = useString<boolean>(moreBtnVideo);
  const addAsPresenterLabel = useString(moreBtnAddAsPresenter)();
  const removeAsPresenterLabel = useString(moreBtnRemoveAsPresenter)();
  const changeNameLabel = useString(moreBtnChangeName)();
  const stopScreenShareLabel = useString(moreBtnStopScreenShare)();
  const removeScreenShareLabel = useString(moreBtnRemoveScreenShare)();
  const removeFromRoomLabel = useString(moreBtnRemoveFromRoom)();
  const moreBtnSpotlightLabel = useString(moreBtnSpotlight);

  useEffect(() => {
    customEvents.on('DisableChat', data => {
      // for other users
      const {disableChatUid, disableChat} = JSON.parse(data?.payload);
      setDisableChatUids(prevState => {
        // upate disable uids
        return {
          ...prevState,
          [disableChatUid]: {
            disableChat,
          },
        };
      });
    });
  }, []);

  useEffect(() => {
    const items: ActionMenuItem[] = [];

    //Context of current user role
    const isSelf = user.uid === localuid;
    const isRemote = !isSelf;
    const isEventMode = $config.EVENT_MODE;

    let currentContext: ActionVisibility;
    if (isHost && isSelf && !isEventMode) currentContext = 'host-self';
    else if (isHost && isRemote && !isEventMode) currentContext = 'host-remote';
    else if (!isHost && isSelf && !isEventMode)
      currentContext = 'attendee-self';
    else if (!isHost && isRemote && !isEventMode)
      currentContext = 'attendee-remote';
    else if (isHost && isSelf && isEventMode)
      currentContext = 'event-host-self';
    else if (isHost && isRemote && isEventMode)
      currentContext = 'event-host-remote';
    else if (!isHost && isSelf && isEventMode)
      currentContext = 'event-attendee-self';
    else if (!isHost && isRemote && isEventMode)
      currentContext = 'event-attendee-remote';

    /**
     * In VideoMeeting/VoiceChat - Show pin menu for all users
     * In Livestreaming/AudioLivecast - Show only for host -> i.e who is streaming video/audio. don't show it for audience
     */
    if (
      !$config.EVENT_MODE ||
      !(
        $config.EVENT_MODE &&
        $config.RAISE_HAND &&
        audienceUids.indexOf(user.uid) !== -1
      )
    ) {
      if (enablePinForMe) {
        if (pinnedUid !== user.uid) {
          const viewInLargeKey = 'view-in-large';
          const viewInLargeConfig = props.items?.[viewInLargeKey] ?? {};
          const isPinned = pinnedUid === user.uid;
          const isWhiteboard = user.uid === getWhiteboardUid();
          const isOnlyOneActive = activeUids?.length === 1;

          if (!viewInLargeConfig.hide && !isPinned) {
            items.push({
              key: viewInLargeKey,
              disabled: isOnlyOneActive,
              order: viewInLargeConfig.order ?? 4,
              icon: isPinned
                ? viewInLargeConfig.onIcon ?? 'unpin-outlined'
                : viewInLargeConfig.offIcon ?? 'pin-outlined',
              onHoverIcon: isPinned
                ? viewInLargeConfig.onHoverOnIcon ?? 'unpin-outlined'
                : viewInLargeConfig.onHoverOffIcon ?? 'pin-filled',
              iconColor:
                viewInLargeConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
              textColor:
                viewInLargeConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
              title: isWhiteboard
                ? viewWhiteboardLabel
                : isPinned
                ? viewInLargeConfig.onLabel ?? removeFromLargeLabel
                : viewInLargeConfig.offLabel ?? viewInLargeLabel,
              onPress: () => {
                setActionMenuVisible(false);
                if (viewInLargeConfig.onPress) {
                  viewInLargeConfig.onPress();
                } else {
                  viewInLargeConfig.onAction?.();
                  dispatch({
                    type: 'UserPin',
                    value: [isPinned ? 0 : user.uid],
                  });
                  setLayout(getPinnedLayoutName());
                }
              },
            });
          }

          // items.push({
          //   //disabled: activeUids?.filter(i => !customContent[i])?.length === 1,
          //   disabled: activeUids?.length === 1,
          //   icon: pinnedUid ? 'unpin-outlined' : 'pin-outlined',
          //   onHoverIcon: pinnedUid ? 'unpin-outlined' : 'pin-filled',
          //   iconColor: $config.SECONDARY_ACTION_COLOR,
          //   textColor: $config.SECONDARY_ACTION_COLOR,
          //   title: pinnedUid
          //     ? user.uid === pinnedUid
          //       ? removeFromLargeLabel
          //       : user.uid === getWhiteboardUid()
          //       ? viewWhiteboardLabel
          //       : viewInLargeLabel
          //     : user.uid === getWhiteboardUid()
          //     ? viewWhiteboardLabel
          //     : viewInLargeLabel,
          //   onPress: () => {
          //     setActionMenuVisible(false);
          //     dispatch({
          //       type: 'UserPin',
          //       value: [pinnedUid && user.uid === pinnedUid ? 0 : user.uid],
          //     });
          //     setLayout(getPinnedLayoutName());
          //   },
          // });
        }
        if (currentLayout === DefaultLayouts[1].name) {
          const pinToTopKey = 'pin-to-top';
          const pinToTopConfig = props.items?.[pinToTopKey] ?? {};
          const isPinnedToTop = user.uid === secondaryPinnedUid;
          const isOnlyOneActive = activeUids?.length === 1;

          if (!pinToTopConfig.hide) {
            items.push({
              key: pinToTopKey,
              disabled: isOnlyOneActive,
              order: pinToTopConfig.order ?? 0,
              icon: isPinnedToTop
                ? pinToTopConfig.onIcon ?? 'unpin-outlined'
                : pinToTopConfig.offIcon ?? 'pin-outlined',
              onHoverIcon: isPinnedToTop
                ? pinToTopConfig.onHoverOnIcon ?? 'unpin-outlined'
                : pinToTopConfig.onHoverOffIcon ?? 'pin-filled',
              iconColor:
                pinToTopConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
              textColor:
                pinToTopConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
              title: isPinnedToTop
                ? pinToTopConfig.onLabel ?? removeFromTopLabel
                : pinToTopConfig.offLabel ?? pinToTopLabel,
              onPress: () => {
                setActionMenuVisible(false);
                if (pinToTopConfig.onPress) {
                  pinToTopConfig.onPress();
                } else {
                  pinToTopConfig.onAction?.();
                  dispatch({
                    type: 'UserSecondaryPin',
                    value: [isPinnedToTop ? 0 : user.uid],
                  });
                }
              },
            });
          }

          // items.push({
          //   // disabled:
          //   //   activeUids?.filter(i => !customContent[i])?.length === 1,
          //   disabled: activeUids?.length === 1,
          //   icon: secondaryPinnedUid ? 'unpin-outlined' : 'pin-outlined',
          //   onHoverIcon: secondaryPinnedUid ? 'unpin-outlined' : 'pin-filled',
          //   iconColor: $config.SECONDARY_ACTION_COLOR,
          //   textColor: $config.SECONDARY_ACTION_COLOR,
          //   title: secondaryPinnedUid
          //     ? user.uid === secondaryPinnedUid
          //       ? removeFromTopLabel
          //       : pinToTopLabel
          //     : pinToTopLabel,
          //   onPress: () => {
          //     setActionMenuVisible(false);
          //     dispatch({
          //       type: 'UserSecondaryPin',
          //       value: [
          //         secondaryPinnedUid && user.uid === secondaryPinnedUid
          //           ? 0
          //           : user.uid,
          //       ],
          //     });
          //   },
          // });
        }
      }
    }

    if ($config.ENABLE_SPOTLIGHT && isHost && user.type === 'rtc') {
      items.push({
        icon: 'spotlight',
        title: moreBtnSpotlightLabel(user.uid == props?.spotlightUid),
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        onPress: () => {
          if (user.uid == props?.spotlightUid) {
            props?.setSpotlightUid(0);
            events.send(
              EventNames.SPOTLIGHT_USER_CHANGED,
              JSON.stringify({user_id: 0}),
              PersistanceLevel.Session,
            );
          } else {
            props?.setSpotlightUid(user.uid);
            events.send(
              EventNames.SPOTLIGHT_USER_CHANGED,
              JSON.stringify({user_id: user.uid}),
              PersistanceLevel.Session,
            );
          }
          setActionMenuVisible(false);
        },
      });
    }

    /**
     * Below menu items for remote user with type rtc(not for screenshare)
     */
    if (localuid !== user.uid && user.type === 'rtc') {
      /**
       * Chat menu
       */
      const messageKey = 'message-privately';
      const messageConfig = props.items?.[messageKey] ?? {};

      if (!messageConfig.hide && $config.CHAT) {
        items.push({
          key: messageKey,
          order: messageConfig.order ?? 2,
          icon: messageConfig.icon ?? 'chat-outlined',
          onHoverIcon: messageConfig.onHoverIcon ?? 'chat-filled',
          iconColor: messageConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
          textColor: messageConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
          title: messageConfig.label ?? messagePrivatelyLabel,
          onPress: () => {
            setActionMenuVisible(false);
            if (messageConfig.onPress) {
              messageConfig.onPress();
            } else {
              messageConfig.onAction?.();
              openPrivateChat(user.uid);
            }
          },
        });
      }

      // if ($config.CHAT) {
      //   items.push({
      //     icon: 'chat-outlined',
      //     onHoverIcon: 'chat-filled',
      //     iconColor: $config.SECONDARY_ACTION_COLOR,
      //     textColor: $config.SECONDARY_ACTION_COLOR,
      //     title: messagePrivatelyLabel,
      //     onPress: () => {
      //       setActionMenuVisible(false);
      //       openPrivateChat(user.uid);
      //     },
      //   });
      // }

      /**
       * Only host can see this menu item - request/mute - video/audio, promote to co host,demote to audience,remove form meeting
       */
      if (isHost) {
        /**
         * Request/Mute -> Audio/Video
         * VideoMeeting/Voice chat - show this for all user
         * Livestreaming/Audio livecast - show this for host user only(because audience not have permission to stream)
         *
         * note:
         * Audio Menu applicable to all vertcials
         * Video menu applicable to VideoMeeting and Livestreaming
         */
        if (
          !$config.EVENT_MODE ||
          ($config.EVENT_MODE &&
            $config.RAISE_HAND &&
            hostUids.indexOf(user.uid) !== -1)
        ) {
          // items.push({
          //   icon: user.audio ? 'mic-off-outlined' : 'mic-on-outlined',
          //   onHoverIcon: user.audio ? 'mic-off-filled' : 'mic-on-filled',
          //   iconColor: $config.SECONDARY_ACTION_COLOR,
          //   textColor: $config.SECONDARY_ACTION_COLOR,
          //   title: audioLabel(user.audio),
          //   onPress: () => {
          //     setActionMenuVisible(false);
          //     user.audio
          //       ? setShowAudioMuteModal(true)
          //       : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
          //   },
          // });

          const muteAudioKey = 'mute-audio';
          const isMuted = user.audio;
          const audioConfig = props.items?.[muteAudioKey] ?? {};
          if (!audioConfig.hide) {
            items.push({
              key: muteAudioKey,
              order: audioConfig.order ?? 3,
              icon: isMuted
                ? audioConfig.onIcon ?? 'mic-off-outlined'
                : audioConfig.offIcon ?? 'mic-on-outlined',
              onHoverIcon: isMuted
                ? audioConfig.onHoverOnIcon ?? 'mic-off-filled'
                : audioConfig.onHoverOffIcon ?? 'mic-on-filled',
              iconColor:
                audioConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
              textColor:
                audioConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
              title: isMuted
                ? audioConfig.onLabel ?? audioLabel(true)
                : audioConfig.offLabel ?? audioLabel(false),
              onPress: () => {
                setActionMenuVisible(false);
                if (audioConfig.onPress) {
                  audioConfig.onPress();
                } else {
                  audioConfig.onAction?.();
                  isMuted
                    ? setShowAudioMuteModal(true)
                    : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
                }
              },
            });
          }

          const muteVideoKey = 'mute-video';
          const isVideoMuted = user.video;
          const videoConfig = props.items?.[muteVideoKey] ?? {};

          if (!$config.AUDIO_ROOM && !videoConfig.hide) {
            items.push({
              key: muteVideoKey,
              order: videoConfig.order ?? 4,
              icon: isVideoMuted
                ? videoConfig.onIcon ?? 'video-off-outlined'
                : videoConfig.offIcon ?? 'video-on-outlined',
              onHoverIcon: isVideoMuted
                ? videoConfig.onHoverOnIcon ?? 'video-off-filled'
                : videoConfig.onHoverOffIcon ?? 'video-on-filled',
              iconColor:
                videoConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
              textColor:
                videoConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
              title: isVideoMuted
                ? videoConfig.onLabel ?? videoLabel(true)
                : videoConfig.offLabel ?? videoLabel(false),
              onPress: () => {
                setActionMenuVisible(false);
                if (videoConfig.onPress) {
                  videoConfig.onPress();
                } else {
                  videoConfig.onAction?.();
                  isVideoMuted
                    ? setShowVideoMuteModal(true)
                    : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
                }
              },
            });

            // items.push({
            //   icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
            //   onHoverIcon: user.video ? 'video-off-filled' : 'video-on-filled',
            //   iconColor: $config.SECONDARY_ACTION_COLOR,
            //   textColor: $config.SECONDARY_ACTION_COLOR,
            //   title: videoLabel(user.video),
            //   onPress: () => {
            //     setActionMenuVisible(false);
            //     user.video
            //       ? setShowVideoMuteModal(true)
            //       : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
            //   },
            // });
          }
        }

        /**
         * Promote co host -> show only on Livestreaming and Audio livecast
         */
        if (
          $config.EVENT_MODE &&
          $config.RAISE_HAND &&
          hostUids.indexOf(user.uid) === -1
        ) {
          items.push({
            icon: 'promote-outlined',
            onHoverIcon: 'promote-filled',
            iconColor: $config.SECONDARY_ACTION_COLOR,
            textColor: $config.SECONDARY_ACTION_COLOR,
            title: addAsPresenterLabel,
            onPress: () => {
              setActionMenuVisible(false);
              promoteAudienceAsCoHost(user.uid);
            },
          });
        }
        if ($config.EVENT_MODE) {
          if (
            raiseHandList[user.uid]?.raised === RaiseHandValue.TRUE &&
            raiseHandList[user.uid]?.role ==
              ClientRoleType.ClientRoleBroadcaster
          ) {
            items.push({
              isBase64Icon: true,
              icon: 'demote-outlined',
              onHoverIcon: 'demote-filled',
              iconColor: $config.SECONDARY_ACTION_COLOR,
              textColor: $config.SECONDARY_ACTION_COLOR,
              title: removeAsPresenterLabel,
              onPress: () => {
                setActionMenuVisible(false);
                events.send(
                  LiveStreamControlMessageEnum.raiseHandRequestRejected,
                  '',
                  PersistanceLevel.None,
                  user.uid,
                );
              },
            });
          }
        }

        const removeKey = 'remove-from-room';
        const removeConfig = props.items?.[removeKey] ?? {};

        if (!removeConfig.hide) {
          items.push({
            key: removeKey,
            order: removeConfig.order ?? 10,
            icon: removeConfig.icon ?? 'remove-meeting',
            iconColor: removeConfig.iconColor ?? $config.SEMANTIC_ERROR,
            textColor: removeConfig.textColor ?? $config.SEMANTIC_ERROR,
            title: removeConfig.label ?? removeFromRoomLabel,
            onPress: () => {
              setActionMenuVisible(false);
              if (removeConfig.onPress) {
                removeConfig.onPress();
              } else {
                removeConfig.onAction?.();
                setRemoveMeetingPopupVisible(true);
              }
            },
          });
        }

        // items.push({
        //   icon: 'remove-meeting',
        //   iconColor: $config.SEMANTIC_ERROR,
        //   textColor: $config.SEMANTIC_ERROR,
        //   title: removeFromRoomLabel,
        //   onPress: () => {
        //     setActionMenuVisible(false);
        //     setRemoveMeetingPopupVisible(true);
        //   },
        // });
      }
    }

    /**
     * Local User menu item - change name
     */
    const changeNameKey = 'change-name';
    const changeNameConfig = props.items?.[changeNameKey] ?? {};

    if (
      !changeNameConfig.hide &&
      localuid === user.uid &&
      user.type === 'rtc'
    ) {
      items.push({
        key: changeNameKey,
        order: changeNameConfig.order ?? 5,
        icon: changeNameConfig.icon ?? 'pencil-outlined',
        onHoverIcon: changeNameConfig.onHoverIcon ?? 'pencil-filled',
        iconColor: changeNameConfig.iconColor ?? $config.SECONDARY_ACTION_COLOR,
        textColor: changeNameConfig.textColor ?? $config.SECONDARY_ACTION_COLOR,
        title: changeNameConfig.label ?? changeNameLabel,
        onPress: () => {
          setActionMenuVisible(false);
          if (changeNameConfig.onPress) {
            changeNameConfig.onPress();
          } else {
            changeNameConfig.onAction?.();
            setFocus(prev => ({...prev, editName: true}));
            setSidePanel(SidePanelType.Settings);
          }
        },
      });
    }

    if (localuid == user.uid && user.type === 'rtc') {
      // items.push({
      //   icon: 'pencil-outlined',
      //   onHoverIcon: 'pencil-filled',
      //   iconColor: $config.SECONDARY_ACTION_COLOR,
      //   textColor: $config.SECONDARY_ACTION_COLOR,
      //   title: changeNameLabel,
      //   onPress: () => {
      //     setFocus(prevState => {
      //       return {
      //         ...prevState,
      //         editName: true,
      //       };
      //     });
      //     setActionMenuVisible(false);
      //     setSidePanel(SidePanelType.Settings);
      //   },
      // });
    }
    //Screenshare menu item
    const removeScreenshareKey = 'remove-screenshare';
    const removeScreenshareConfig = props.items?.[removeScreenshareKey] ?? {};
    if (
      (isHost || localuid === user.parentUid) &&
      user.type === 'screenshare' &&
      !removeScreenshareConfig.hide
    ) {
      items.push({
        key: removeScreenshareKey,
        order: removeScreenshareConfig.order ?? 10,
        icon: removeScreenshareConfig.icon ?? 'remove-meeting',
        iconColor: removeScreenshareConfig.iconColor ?? $config.SEMANTIC_ERROR,
        textColor: removeScreenshareConfig.textColor ?? $config.SEMANTIC_ERROR,
        title:
          removeScreenshareConfig.label ??
          (localuid === user?.parentUid
            ? stopScreenShareLabel
            : removeScreenShareLabel),
        onPress: () => {
          setActionMenuVisible(false);
          if (removeScreenshareConfig.onPress) {
            removeScreenshareConfig.onPress();
          } else {
            removeScreenshareConfig.onAction?.();
            //for local user directly stop the screenshare
            if (localuid === user.parentUid) {
              stopScreenshare();
            }
            //for remote user show popup and then user will use cta to stop screenshare
            else {
              setRemoveScreensharePopupVisible(true);
            }
          }
        },
      });
    }

    // Add custom items ,
    if (props.items) {
      const customItems = Object.entries(props.items)
        .filter(([key, config]) => {
          return (
            !config?.hide &&
            !DEFAULT_ACTION_KEYS.includes(key) &&
            config.visibility?.includes(currentContext)
          );
        })
        .map(([key, config]) => {
          return {
            key,
            icon: config.icon ?? 'profile',
            iconColor: config.iconColor ?? $config.SECONDARY_ACTION_COLOR,
            textColor: config.textColor ?? $config.SECONDARY_ACTION_COLOR,
            title: config.label,
            order: config.order ?? 99,
            onPress: () => {
              props.setActionMenuVisible(false);
              config.onPress?.();
            },
          } as ActionMenuItem;
        });

      items.push(...customItems);
    }

    items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    setActionMenuitems(items);
  }, [
    pinnedUid,
    isHost,
    raiseHandList,
    hostUids,
    user,
    disableChatUids,
    secondaryPinnedUid,
    currentLayout,
    spotlightUid,
  ]);

  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [modalPosition, setModalPosition] = useState({});
  const toastlabel = useString(userRemovedFromTheRoomToastHeading);
  useEffect(() => {
    if (actionMenuVisible) {
      //getting btnRef x,y
      props.btnRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          localWidth: number,
          localHeight: number,
          px: number,
          py: number,
        ) => {
          const data = calculatePosition({
            px,
            py,
            localWidth,
            localHeight,
            globalHeight,
            globalWidth,
          });
          setModalPosition(data);
          setIsPosCalculated(true);
        },
      );
    }
  }, [actionMenuVisible]);

  return (
    <>
      {isHost ? (
        <RemoteMutePopup
          type={I18nMuteType.audio}
          actionMenuVisible={showAudioMuteModal}
          setActionMenuVisible={setShowAudioMuteModal}
          name={props?.user.name}
          modalPosition={modalPosition}
          onMutePress={() => {
            remoteMute(MUTE_REMOTE_TYPE.audio, user.uid);
            setShowAudioMuteModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {isHost ? (
        <RemoteMutePopup
          type={I18nMuteType.video}
          actionMenuVisible={showVideoMuteModal}
          setActionMenuVisible={setShowVideoMuteModal}
          name={props?.user.name}
          modalPosition={modalPosition}
          onMutePress={() => {
            remoteMute(MUTE_REMOTE_TYPE.video, user.uid);
            setShowVideoMuteModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {isHost ? (
        <RemoveScreensharePopup
          modalVisible={removeScreensharePopupVisible}
          setModalVisible={setRemoveScreensharePopupVisible}
          username={user.name}
          removeScreenShareFromMeeting={() => {
            props.user.parentUid
              ? remoteEndScreenshare(props.user.parentUid)
              : console.log('Parent Uid is not available');
          }}
        />
      ) : (
        <></>
      )}
      {isHost ? (
        <RemoveMeetingPopup
          modalVisible={removeMeetingPopupVisible}
          setModalVisible={setRemoveMeetingPopupVisible}
          username={user.name}
          removeUserFromMeeting={() => {
            userRemovalTimeout > 0 &&
              Toast.show({
                leadingIconName: 'info',
                type: 'info',
                text1: toastlabel(
                  trimText(user.name),
                  userRemovalTimeout / 1000,
                ),
                visibilityTime: 5000,
                primaryBtn: null,
                secondaryBtn: null,
                leadingIcon: null,
              });
            endRemoteCall(user.uid);
          }}
        />
      ) : (
        <></>
      )}
      <ActionMenu
        from={props.from}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuitems}
      />
    </>
  );
}
