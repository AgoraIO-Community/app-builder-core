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
import React, {useRef, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {ApprovedLiveStreamControlsView} from '../../subComponents/livestream';
import ParticipantName from './ParticipantName';
import {BtnTemplate, RenderInterface} from '../../../agora-rn-uikit';
import UserAvatar from '../../atoms/UserAvatar';
import {isWeb, isWebInternal} from '../../utils/common';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import Spacer from '../../atoms/Spacer';
import useRemoteEndCall from '../../utils/useRemoteEndCall';
import {useChatMessages} from '../chat-messages/useChatMessages';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import LocalAudioMute from '../../subComponents/LocalAudioMute';

interface remoteParticipantsInterface {
  isLocal: boolean;
  name: string;
  user: RenderInterface;
  showControls: boolean;
  isHost: boolean;
}

const RemoteParticipants = (props: remoteParticipantsInterface) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [actionMenuVisible, setActionMenuVisible] = React.useState(false);
  const usercontainerRef = useRef(null);
  const {user, name, showControls, isHost, isLocal} = props;
  const [pos, setPos] = useState({top: 0, left: 0});

  const endRemoteCall = useRemoteEndCall();
  const {openPrivateChat} = useChatMessages();

  const containerStyle = {
    background: '#021F3380',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  };
  const textStyle = {
    fontSize: 12,
    lineHeight: 10,
    fontWeight: 400,
    color: '#fff',
  };

  const renderActionMenu = () => {
    const items: ActionMenuItem[] = [
      {
        icon: 'chat',
        title: 'Message Privately',
        callback: () => openPrivateChat(user.uid),
      },
    ];

    if (isHost) {
      items.push({
        icon: 'remoteEndCall',
        title: 'Remove from meeting',
        callback: () => endRemoteCall(user.uid),
      });
    }

    // {
    //   icon: 'videocam',
    //   title: 'Request Video',
    //   callback: () => console.warn('Request Video'),
    // },
    // {
    //   icon: 'mic',
    //   title: 'Request Mic',
    //   callback: () => console.warn('Request Mic'),
    // },

    return (
      <ActionMenu
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={{top: pos.top - 20, left: pos.left + 50}}
        items={items}
      />
    );
  };

  const showModal = () => {
    usercontainerRef.current.ge;
    usercontainerRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setPos({
        top: py + h,
        left: _px,
      });
    });
    setActionMenuVisible((state) => !state);
  };
  return (
    <>
      {!isLocal ? renderActionMenu() : <></>}
      <PlatformWrapper showModal={showModal} setIsHovered={setIsHovered}>
        <View style={styles.container} ref={usercontainerRef}>
          <View style={styles.userInfoContainer}>
            <UserAvatar
              name={name}
              containerStyle={containerStyle}
              textStyle={textStyle}
            />
            <View>
              <ParticipantName value={name} />
              {isHost && (
                <Text style={styles.subText}>Host{isLocal ? ', Me' : ''}</Text>
              )}
            </View>
          </View>
          {showControls ? (
            <View style={styles.iconContainer}>
              <BtnTemplate
                name="more"
                style={{
                  opacity:
                    (isHovered || actionMenuVisible || !isWebInternal()) &&
                    !isLocal
                      ? 1
                      : 0,
                }}
                onPress={() => {
                  showModal();
                }}
                styleIcon={{width: 20, height: 20}}
              />
              <Spacer horizontal={true} size={16} />
              {!$config.AUDIO_ROOM &&
                (isLocal ? (
                  <LocalVideoMute
                    buttonTemplateName={ButtonTemplateName.topBar}
                  />
                ) : (
                  <RemoteVideoMute
                    uid={user.uid}
                    video={user.video}
                    isHost={isHost}
                  />
                ))}
              <Spacer horizontal={true} size={16} />
              {isLocal ? (
                <LocalAudioMute
                  buttonTemplateName={ButtonTemplateName.topBar}
                />
              ) : (
                <RemoteAudioMute
                  uid={user.uid}
                  audio={user.audio}
                  isHost={isHost}
                />
              )}
              {/* TODO hari {$config.EVENT_MODE && (
              <ApprovedLiveStreamControlsView
                //p_styles={p_styles}
                uid={user.uid}
              />
            )} */}
            </View>
          ) : (
            <></>
          )}
        </View>
      </PlatformWrapper>
    </>
  );
};
export default RemoteParticipants;

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
  subText: {
    fontSize: 12,
    lineHeight: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    color: '#858585',
    marginTop: 4,
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
