import React, {useContext, useEffect, useState} from 'react';
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
import {
  LiveStreamControlMessageEnum,
  RaiseHandValue,
} from '../livestream/Types';
import events, {EventPersistLevel} from '../../rtm-events-api';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import RemoveScreensharePopup from '../../subComponents/RemoveScreensharePopup';
import useRemoteEndScreenshare from '../../utils/useRemoteEndScreenshare';

interface UserActionMenuOptionsOptionsProps {
  user: RenderInterface;
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  handleClose: () => void;
  isMobile: boolean;
  updateActionSheet: (screenName: 'chat' | 'participants' | 'settings') => {};
  modalPosition: {};
  parentUid?: UidType;
}
export default function UserActionMenuOptionsOptions(
  props: UserActionMenuOptionsOptionsProps,
) {
  const remoteEndScreenshare = useRemoteEndScreenshare();
  const [removeScreensharePopupVisible, setRemoveScreensharePopupVisible] =
    useState(false);
  const [actionMenuitems, setActionMenuitems] = useState<ActionMenuItem[]>([]);
  const {setSidePanel} = useSidePanel();
  const {user, actionMenuVisible, setActionMenuVisible} = props;
  const {pinnedUid} = useRender();
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
    if (
      !$config.EVENT_MODE ||
      !(
        $config.EVENT_MODE &&
        $config.RAISE_HAND &&
        audienceUids.indexOf(user.uid) !== -1
      )
    ) {
      items.push({
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

    if (localuid !== user.uid && user.type === 'rtc') {
      items.push({
        icon: 'chat-outlined',
        onHoverIcon: 'chat-filled',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: 'Message Privately',
        callback: () => {
          if (props.isMobile) {
            props.handleClose();
            openPrivateChat(user.uid);
            props.updateActionSheet('chat');
          } else {
            setActionMenuVisible(false);
            openPrivateChat(user.uid);
          }
        },
      });

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
              ? remoteMute(MUTE_REMOTE_TYPE.audio, user.uid)
              : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
          },
        });
        items.push({
          icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
          onHoverIcon: user.video ? 'video-off-filled' : 'video-on-filled',
          iconColor: $config.SECONDARY_ACTION_COLOR,
          textColor: $config.SECONDARY_ACTION_COLOR,
          title: user.video ? 'Mute Video' : 'Request Video',
          callback: () => {
            setActionMenuVisible(false);
            user.video
              ? remoteMute(MUTE_REMOTE_TYPE.video, user.uid)
              : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
          },
        });
      }

      if (
        isHost &&
        $config.EVENT_MODE &&
        $config.RAISE_HAND &&
        hostUids.indexOf(user.uid) === -1
      ) {
        items.push({
          icon: 'promote-outlined',
          onHoverIcon: 'promote-filled',
          iconColor: $config.SECONDARY_ACTION_COLOR,
          textColor: $config.SECONDARY_ACTION_COLOR,
          title: 'Promote to Co-host',
          callback: () => {
            setActionMenuVisible(false);
            promoteAudienceAsCoHost(user.uid);
          },
        });
      }
      if (isHost && $config.EVENT_MODE) {
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
            title: 'Demote to audience',
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
      if (isHost) {
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

    if (localuid == user.uid && user.type === 'rtc') {
      //local user menu
      items.push({
        icon: 'pencil-outlined',
        onHoverIcon: 'pencil-filled',
        iconColor: $config.SECONDARY_ACTION_COLOR,
        textColor: $config.SECONDARY_ACTION_COLOR,
        title: 'Change Name',
        callback: () => {
          if (props.isMobile) {
            props.handleClose();
            setSidePanel(SidePanelType.Settings);
            props.updateActionSheet('settings');
          } else {
            setActionMenuVisible(false);
            setSidePanel(SidePanelType.Settings);
          }
        },
      });
    }
    if (isHost && user.type === 'screenshare') {
      items.push({
        icon: 'remove-meeting',
        iconColor: $config.SEMANTIC_ERROR,
        textColor: $config.SEMANTIC_ERROR,
        title: 'Remove Screenshare',
        callback: () => {
          setActionMenuVisible(false);
          setRemoveScreensharePopupVisible(true);
        },
      });
    }
    setActionMenuitems(items);
  }, [pinnedUid, isHost, raiseHandList, hostUids, user]);

  return (
    <>
      {isHost ? (
        <RemoveScreensharePopup
          modalVisible={removeScreensharePopupVisible}
          setModalVisible={setRemoveScreensharePopupVisible}
          username={user.name}
          removeScreenShareFromMeeting={() =>
            remoteEndScreenshare(props.parentUid)
          }
        />
      ) : (
        <></>
      )}
      {isHost ? (
        <RemoveMeetingPopup
          modalVisible={removeMeetingPopupVisible}
          setModalVisible={setRemoveMeetingPopupVisible}
          username={user.name}
          removeUserFromMeeting={() => endRemoteCall(user.uid)}
        />
      ) : (
        <></>
      )}
      <ActionMenu
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={props.modalPosition}
        items={actionMenuitems}
      />
    </>
  );
}
