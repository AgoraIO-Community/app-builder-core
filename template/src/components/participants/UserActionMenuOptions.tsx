import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  MUTE_REMOTE_TYPE,
  RenderInterface,
  SidePanelType,
  useLayout,
  useLocalUid,
  useMeetingInfo,
  useRemoteMute,
  useRender,
  useRtc,
  useSidePanel,
} from 'customization-api';
import {getPinnedLayoutName} from '../../pages/video-call/DefaultLayouts';
import useRemoteRequest, {
  REQUEST_REMOTE_TYPE,
} from '../../utils/useRemoteRequest';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import {useChatMessages} from '../chat-messages/useChatMessages';
import {useLiveStreamDataContext} from '../contexts/LiveStreamDataContext';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import LiveStreamContext from '../livestream/LiveStreamContext';
import {ClientRole, UidType} from '../../../agora-rn-uikit';
import {useWindowDimensions} from 'react-native';
import {
  LiveStreamControlMessageEnum,
  RaiseHandValue,
} from '../livestream/Types';
import events, {EventPersistLevel} from '../../rtm-events-api';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import RemoveScreensharePopup from '../../subComponents/RemoveScreensharePopup';
import useRemoteEndScreenshare from '../../utils/useRemoteEndScreenshare';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import {useFocus} from '../../utils/useFocus';
import Toast from '../../../react-native-toast-message';
import RemoteMutePopup from '../../subComponents/RemoteMutePopup';
import {calculatePosition, trimText} from '../../utils/common';

interface UserActionMenuOptionsOptionsProps {
  user: RenderInterface;
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: any;
  from: 'partcipant' | 'screenshare-participant' | 'video-tile';
}
export default function UserActionMenuOptionsOptions(
  props: UserActionMenuOptionsOptionsProps,
) {
  const [showAudioMuteModal, setShowAudioMuteModal] = useState(false);
  const [showVideoMuteModal, setShowVideoMuteModal] = useState(false);
  const [isPosCalculated, setIsPosCalculated] = useState(false);
  const {setFocus} = useFocus();
  const {stopUserScreenShare} = useScreenshare();
  const remoteEndScreenshare = useRemoteEndScreenshare();
  const [removeScreensharePopupVisible, setRemoveScreensharePopupVisible] =
    useState(false);
  const [actionMenuitems, setActionMenuitems] = useState<ActionMenuItem[]>([]);
  const {setSidePanel} = useSidePanel();
  const {user, actionMenuVisible, setActionMenuVisible} = props;
  const {pinnedUid, activeUids} = useRender();
  const {dispatch} = useRtc();
  const {setLayout} = useLayout();
  const localuid = useLocalUid();
  const {openPrivateChat} = useChatMessages();
  const {hostUids, audienceUids} = useLiveStreamDataContext();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const remoteRequest = useRemoteRequest();
  const remoteMute = useRemoteMute();
  const endRemoteCall = useRemoteEndCall();
  const {promoteAudienceAsCoHost, raiseHandList} =
    useContext(LiveStreamContext);
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);

  useEffect(() => {
    const items: ActionMenuItem[] = [];

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
      items.push({
        disabled: activeUids.length === 1,
        icon: pinnedUid ? 'unpin-outlined' : 'pin-outlined',
        onHoverIcon: pinnedUid ? 'unpin-outlined' : 'pin-filled',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: pinnedUid
          ? user.uid === pinnedUid
            ? 'Unpin'
            : 'Replace Pin'
          : 'Pin for me',
        callback: () => {
          setActionMenuVisible(false);
          dispatch({
            type: 'UserPin',
            value: [pinnedUid && user.uid === pinnedUid ? 0 : user.uid],
          });
          setLayout(getPinnedLayoutName());
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
      items.push({
        icon: 'chat-outlined',
        onHoverIcon: 'chat-filled',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: 'Message Privately',
        callback: () => {
          setActionMenuVisible(false);
          openPrivateChat(user.uid);
        },
      });

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
          items.push({
            icon: user.audio ? 'mic-off-outlined' : 'mic-on-outlined',
            onHoverIcon: user.audio ? 'mic-off-filled' : 'mic-on-filled',
            iconColor: $config.SECONDARY_ACTION_COLOR,
            textColor: $config.SECONDARY_ACTION_COLOR,
            title: user.audio ? 'Mute Audio' : 'Request Audio',
            callback: () => {
              setActionMenuVisible(false);
              user.audio
                ? setShowAudioMuteModal(true)
                : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
            },
          });
          if (!$config.AUDIO_ROOM) {
            items.push({
              icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
              onHoverIcon: user.video ? 'video-off-filled' : 'video-on-filled',
              iconColor: $config.SECONDARY_ACTION_COLOR,
              textColor: $config.SECONDARY_ACTION_COLOR,
              title: user.video ? 'Mute Video' : 'Request Video',
              callback: () => {
                setActionMenuVisible(false);
                user.video
                  ? setShowVideoMuteModal(true)
                  : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
              },
            });
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
            title: 'Add as Presenter',
            callback: () => {
              setActionMenuVisible(false);
              promoteAudienceAsCoHost(user.uid);
            },
          });
        }
        if ($config.EVENT_MODE) {
          if (
            raiseHandList[user.uid]?.raised === RaiseHandValue.TRUE &&
            raiseHandList[user.uid]?.role == ClientRole.Broadcaster
          ) {
            items.push({
              isBase64Icon: true,
              icon: 'demote-outlined',
              onHoverIcon: 'demote-filled',
              iconColor: $config.SECONDARY_ACTION_COLOR,
              textColor: $config.SECONDARY_ACTION_COLOR,
              title: 'Remove as Presenter',
              callback: () => {
                setActionMenuVisible(false);
                events.send(
                  LiveStreamControlMessageEnum.raiseHandRequestRejected,
                  '',
                  EventPersistLevel.LEVEL1,
                  user.uid,
                );
              },
            });
          }
        }

        items.push({
          icon: 'remove-meeting',
          iconColor: $config.SEMANTIC_ERROR,
          textColor: $config.SEMANTIC_ERROR,
          title: 'Remove From Meeting',
          callback: () => {
            setActionMenuVisible(false);
            setRemoveMeetingPopupVisible(true);
          },
        });
      }
    }

    /**
     * Local User menu item - change name
     */
    if (localuid == user.uid && user.type === 'rtc') {
      items.push({
        icon: 'pencil-outlined',
        onHoverIcon: 'pencil-filled',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: 'Change Name',
        callback: () => {
          setFocus((prevState) => {
            return {
              ...prevState,
              editName: true,
            };
          });

          setActionMenuVisible(false);
          setSidePanel(SidePanelType.Settings);
        },
      });
    }
    //Screenshare menu item
    if (
      (isHost || localuid === user.parentUid) &&
      user.type === 'screenshare'
    ) {
      items.push({
        icon: 'remove-meeting',
        iconColor: $config.SEMANTIC_ERROR,
        textColor: $config.SEMANTIC_ERROR,
        title:
          localuid === user?.parentUid
            ? 'Stop Screenshare'
            : 'Remove Screenshare',
        callback: () => {
          setActionMenuVisible(false);
          //for local user directly stop the screenshare
          if (localuid === user.parentUid) {
            stopUserScreenShare();
          }
          //for remote user show popup and then user will use cta to stop screenshare
          else {
            setRemoveScreensharePopupVisible(true);
          }
        },
      });
    }
    setActionMenuitems(items);
  }, [pinnedUid, isHost, raiseHandList, hostUids, user]);

  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [modalPosition, setModalPosition] = useState({});

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
          type="audio"
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
          type="video"
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
            Toast.show({
              type: 'info',
              text1: `The system will remove ${trimText(
                user.name,
              )} from this call after 5 secs.`,
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
