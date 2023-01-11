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
import React, {useContext, useRef, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {ClientRole, RenderInterface} from '../../../agora-rn-uikit';
import UserAvatar from '../../atoms/UserAvatar';
import {isWeb, isWebInternal} from '../../utils/common';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import Spacer from '../../atoms/Spacer';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import {useChatMessages} from '../chat-messages/useChatMessages';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import RemoveMeetingPopup from '../../subComponents/RemoveMeetingPopup';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import {
  RaiseHandValue,
  LiveStreamContext,
  LiveStreamControlMessageEnum,
} from '../livestream';
import events, {EventPersistLevel} from '../../rtm-events-api';
import IconButton from '../../atoms/IconButton';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import useRemoteRequest, {
  REQUEST_REMOTE_TYPE,
} from '../../utils/useRemoteRequest';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../../utils/useRemoteMute';
import {useLiveStreamDataContext} from '../contexts/LiveStreamDataContext';
import {
  SidePanelType,
  useLayout,
  useRender,
  useRtc,
  useSidePanel,
} from 'customization-api';
import {getPinnedLayoutName} from '../../pages/video-call/DefaultLayouts';
import UserActionMenuOptionsOptions from './UserActionMenuOptions';
interface ParticipantInterface {
  isLocal: boolean;
  name: string;
  user: RenderInterface;
  showControls: boolean;
  isHostUser: boolean;
  isAudienceUser: boolean;
  isMobile?: boolean;
  handleClose: () => {};
  updateActionSheet: (screenName: 'chat' | 'participants' | 'settings') => {};
}

const Participant = (props: ParticipantInterface) => {
  const {setSidePanel} = useSidePanel();
  const {hostUids} = useLiveStreamDataContext();
  const {promoteAudienceAsCoHost} = useContext(LiveStreamContext);
  const [isHovered, setIsHovered] = React.useState(false);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const usercontainerRef = useRef(null);
  const {
    user,
    name,
    showControls,
    isHostUser,
    isLocal,
    isAudienceUser,
    isMobile = false,
    handleClose,
    updateActionSheet,
  } = props;
  const [pos, setPos] = useState({top: 0, left: 0});
  const [removeMeetingPopupVisible, setRemoveMeetingPopupVisible] =
    useState(false);
  const endRemoteCall = useRemoteEndCall();
  const {openPrivateChat} = useChatMessages();
  const {raiseHandList} = useContext(LiveStreamContext);
  const {
    data: {isHost},
  } = useMeetingInfo();
  const remoteRequest = useRemoteRequest();
  const remoteMute = useRemoteMute();
  const {pinnedUid} = useRender();
  const {dispatch} = useRtc();
  const {setLayout} = useLayout();
  //don't remove the commented code
  // const renderActionMenu = () => {
  //   const items: ActionMenuItem[] = [];

  //   items.push({
  //     icon: pinnedUid ? 'unpin-outlined' : 'pin-outlined',
  //     onHoverIcon: pinnedUid ? 'unpin-outlined' : 'pin-filled',
  //     iconColor: $config.SECONDARY_ACTION_COLOR,
  //     textColor: $config.SECONDARY_ACTION_COLOR,
  //     title: pinnedUid
  //       ? props.user.uid === pinnedUid
  //         ? 'Unpin'
  //         : 'Replace Pin'
  //       : 'Pin for me',
  //     callback: () => {
  //       setActionMenuVisible(false);
  //       dispatch({
  //         type: 'UserPin',
  //         value: [pinnedUid && props.user.uid === pinnedUid ? 0 : user.uid],
  //       });
  //       setLayout(getPinnedLayoutName());
  //     },
  //   });

  //   if (!isLocal) {
  //     //remove user menu
  //     items.push({
  //       icon: 'chat-outlined',
  //       onHoverIcon: 'chat-filled',
  //       iconColor: $config.SECONDARY_ACTION_COLOR,
  //       textColor: $config.SECONDARY_ACTION_COLOR,
  //       title: 'Message Privately',
  //       callback: () => {
  //         if (isMobile) {
  //           handleClose();
  //           openPrivateChat(user.uid);
  //           updateActionSheet('chat');
  //         } else {
  //           setActionMenuVisible(false);
  //           openPrivateChat(user.uid);
  //         }
  //       },
  //     });

  //     if (
  //       !$config.EVENT_MODE ||
  //       ($config.EVENT_MODE &&
  //         $config.RAISE_HAND &&
  //         hostUids.indexOf(user.uid) !== -1)
  //     ) {
  //       items.push({
  //         icon: user.audio ? 'mic-off-outlined' : 'mic-on-outlined',
  //         onHoverIcon: user.audio ? 'mic-off-filled' : 'mic-on-filled',
  //         iconColor: $config.SECONDARY_ACTION_COLOR,
  //         textColor: $config.SECONDARY_ACTION_COLOR,
  //         title: user.audio ? 'Mute Audio' : 'Request Audio',
  //         callback: () => {
  //           setActionMenuVisible(false);
  //           user.audio
  //             ? remoteMute(MUTE_REMOTE_TYPE.audio, user.uid)
  //             : remoteRequest(REQUEST_REMOTE_TYPE.audio, user.uid);
  //         },
  //       });
  //       items.push({
  //         icon: user.video ? 'video-off-outlined' : 'video-on-outlined',
  //         onHoverIcon: user.video ? 'video-off-filled' : 'video-on-filled',
  //         iconColor: $config.SECONDARY_ACTION_COLOR,
  //         textColor: $config.SECONDARY_ACTION_COLOR,
  //         title: user.video ? 'Mute Video' : 'Request Video',
  //         callback: () => {
  //           setActionMenuVisible(false);
  //           user.video
  //             ? remoteMute(MUTE_REMOTE_TYPE.video, user.uid)
  //             : remoteRequest(REQUEST_REMOTE_TYPE.video, user.uid);
  //         },
  //       });
  //     }

  //     if (
  //       isHost &&
  //       $config.EVENT_MODE &&
  //       $config.RAISE_HAND &&
  //       hostUids.indexOf(user.uid) === -1
  //     ) {
  //       items.push({
  //         icon: 'promote-outlined',
  //         onHoverIcon: 'promote-filled',
  //         iconColor: $config.SECONDARY_ACTION_COLOR,
  //         textColor: $config.SECONDARY_ACTION_COLOR,
  //         title: 'Promote to Co-host',
  //         callback: () => {
  //           setActionMenuVisible(false);
  //           promoteAudienceAsCoHost(user.uid);
  //         },
  //       });
  //     }
  //     if (isHost && $config.EVENT_MODE) {
  //       if (
  //         raiseHandList[user.uid]?.raised === RaiseHandValue.TRUE &&
  //         raiseHandList[user.uid]?.role == ClientRole.Broadcaster
  //       ) {
  //         items.push({
  //           isBase64Icon: true,
  //           icon: 'demote-outlined',
  //           onHoverIcon: 'demote-filled',
  //           iconColor: $config.SECONDARY_ACTION_COLOR,
  //           textColor: $config.SECONDARY_ACTION_COLOR,
  //           title: 'Demote to audience',
  //           callback: () => {
  //             setActionMenuVisible(false);
  //             events.send(
  //               LiveStreamControlMessageEnum.raiseHandRequestRejected,
  //               '',
  //               EventPersistLevel.LEVEL1,
  //               user.uid,
  //             );
  //           },
  //         });
  //       }
  //     }
  //     if (isHost) {
  //       items.push({
  //         icon: 'remove-meeting',
  //         iconColor: $config.SEMANTIC_ERROR,
  //         textColor: $config.SEMANTIC_ERROR,
  //         title: 'Remove From Meeting',
  //         callback: () => {
  //           setActionMenuVisible(false);
  //           setRemoveMeetingPopupVisible(true);
  //         },
  //       });
  //     }
  //   } else {
  //     //local user menu
  //     items.push({
  //       icon: 'pencil-outlined',
  //       onHoverIcon: 'pencil-filled',
  //       iconColor: $config.SECONDARY_ACTION_COLOR,
  //       textColor: $config.SECONDARY_ACTION_COLOR,
  //       title: 'Change Name',
  //       callback: () => {
  //         if (isMobile) {
  //           handleClose();
  //           setSidePanel(SidePanelType.Settings);
  //           updateActionSheet('settings');
  //         } else {
  //           setActionMenuVisible(false);
  //           setSidePanel(SidePanelType.Settings);
  //         }
  //       },
  //     });
  //   }
  //   return (
  //     <>
  //       {isHost ? (
  //         <RemoveMeetingPopup
  //           modalVisible={removeMeetingPopupVisible}
  //           setModalVisible={setRemoveMeetingPopupVisible}
  //           username={user.name}
  //           removeUserFromMeeting={() => endRemoteCall(user.uid)}
  //         />
  //       ) : (
  //         <></>
  //       )}
  //       <ActionMenu
  //         actionMenuVisible={actionMenuVisible}
  //         setActionMenuVisible={setActionMenuVisible}
  //         modalPosition={{top: pos.top - 20, left: pos.left + 50}}
  //         items={items}
  //       />
  //     </>
  //   );
  // };

  const showModal = () => {
    usercontainerRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setPos({
        top: py + h - 20,
        left: _px + 50,
      });
    });
    setActionMenuVisible((state) => !state);
  };
  return (
    <>
      <UserActionMenuOptionsOptions
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        handleClose={handleClose}
        isMobile={isMobile}
        modalPosition={pos}
        updateActionSheet={updateActionSheet}
        user={props.user}
      />
      <PlatformWrapper showModal={showModal} setIsHovered={setIsHovered}>
        <View style={styles.container} ref={usercontainerRef}>
          <View style={styles.userInfoContainer}>
            <View style={styles.bgContainerStyle}>
              <UserAvatar
                name={name}
                containerStyle={styles.containerStyle}
                textStyle={styles.textStyle}
              />
            </View>
            <View style={{alignSelf: 'center', flex: 1}}>
              <Text style={styles.participantNameText} numberOfLines={1}>
                {name}
              </Text>
              {isLocal && <Text style={styles.subText}>{'Me'}</Text>}
            </View>
          </View>
          <View style={styles.iconContainer}>
            {isHovered || actionMenuVisible || !isWebInternal() || isMobile ? (
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 20,
                }}>
                <IconButton
                  hoverEffect={true}
                  hoverEffectStyle={{
                    backgroundColor:
                      $config.CARD_LAYER_5_COLOR +
                      hexadecimalTransparency['20%'],
                    borderRadius: 20,
                    padding: 5,
                  }}
                  iconProps={{
                    iconType: 'plain',
                    name: 'more-menu',
                    iconSize: 20,
                    tintColor: $config.SECONDARY_ACTION_COLOR,
                  }}
                  onPress={() => {
                    showModal();
                  }}
                />
              </View>
            ) : (
              <Spacer size={24} horizontal={true} />
            )}
            {showControls ? (
              <>
                <Spacer horizontal={true} size={8} />
                {!$config.AUDIO_ROOM &&
                  (isLocal
                    ? !isAudienceUser && (
                        <LocalVideoMute
                          plainIconHoverEffect={true}
                          iconProps={(isVideoEnabled, isPermissionDenied) => {
                            return {
                              iconSize: 20,
                              iconType: 'plain',
                              iconContainerStyle: {padding: 8},
                              showWarningIcon: false,
                              tintColor: isVideoEnabled
                                ? $config.PRIMARY_ACTION_BRAND_COLOR
                                : isPermissionDenied
                                ? $config.SEMANTIC_NETRUAL
                                : $config.SEMANTIC_ERROR,
                            };
                          }}
                          showLabel={false}
                          isMobileView={isMobile}
                        />
                      )
                    : !isAudienceUser && (
                        <RemoteVideoMute
                          uid={user.uid}
                          video={user.video}
                          isHost={isHost}
                          userContainerRef={usercontainerRef}
                        />
                      ))}
                {isLocal
                  ? !isAudienceUser && (
                      <LocalAudioMute
                        plainIconHoverEffect={true}
                        iconProps={(isAudioEnabled, isPermissionDenied) => {
                          return {
                            iconSize: 20,
                            iconType: 'plain',
                            iconContainerStyle: {padding: 8},
                            showWarningIcon: false,
                            tintColor: isAudioEnabled
                              ? $config.PRIMARY_ACTION_BRAND_COLOR
                              : isPermissionDenied
                              ? $config.SEMANTIC_NETRUAL
                              : $config.SEMANTIC_ERROR,
                          };
                        }}
                        showLabel={false}
                        isMobileView={isMobile}
                      />
                    )
                  : !isAudienceUser && (
                      <RemoteAudioMute
                        uid={user.uid}
                        audio={user.audio}
                        isHost={isHost}
                        userContainerRef={usercontainerRef}
                      />
                    )}
              </>
            ) : (
              <></>
            )}
          </View>
        </View>
      </PlatformWrapper>
    </>
  );
};
export default Participant;

const PlatformWrapper = ({children, showModal, setIsHovered}) => {
  return isWeb() ? (
    <div
      style={{}}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    <TouchableOpacity
      onPress={() => {
        showModal();
      }}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bgContainerStyle: {
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
    //$config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  containerStyle: {
    // backgroundColor:
    //   $config.PRIMARY_ACTION_BRAND_COLOR + hexadecimalTransparency['15%'],
    // width: 36,
    height: 36,
    borderRadius: 18,
  },
  textStyle: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '400',
    color: $config.CARD_LAYER_1_COLOR,
  },
  participantNameText: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 15,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
  subText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
    marginTop: 4,
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flex: 0.7,
  },
  iconContainer: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
});
