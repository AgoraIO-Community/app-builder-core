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
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import ThemeConfig from '../../theme';
import UserAvatar from '../../atoms/UserAvatar';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {
  isWeb,
  RenderInterface,
  UidType,
  useLocalUid,
  useMeetingInfo,
} from 'customization-api';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import RemoveScreensharePopup from '../../subComponents/RemoveScreensharePopup';
import useRemoteEndScreenshare from '../../utils/useRemoteEndScreenshare';
import {isWebInternal} from '../../utils/common';
import IconButton from '../../atoms/IconButton';
import UserActionMenuOptionsOptions from './UserActionMenuOptions';

const ScreenshareParticipants = (props: {user: RenderInterface}) => {
  const screenshareRef = useRef();
  const localUid = useLocalUid();
  const [isHovered, setIsHovered] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [removeScreensharePopupVisible, setRemoveScreensharePopupVisible] =
    useState(false);
  const [pos, setPos] = useState({top: 0, left: 0});
  const {
    data: {isHost},
  } = useMeetingInfo();
  const remoteEndScreenshare = useRemoteEndScreenshare();
  // const renderActionMenu = () => {
  //   const items: ActionMenuItem[] = [];

  //   if (isHost) {
  //     items.push({
  //       icon: 'remove-meeting',
  //       iconColor: $config.SEMANTIC_ERROR,
  //       textColor: $config.SEMANTIC_ERROR,
  //       title: 'Remove Screenshare',
  //       callback: () => {
  //         setActionMenuVisible(false);
  //         setRemoveScreensharePopupVisible(true);
  //       },
  //     });
  //   }
  //   return (
  //     <>
  //       {isHost ? (
  //         <RemoveScreensharePopup
  //           modalVisible={removeScreensharePopupVisible}
  //           setModalVisible={setRemoveScreensharePopupVisible}
  //           username={props.name}
  //           removeScreenShareFromMeeting={() =>
  //             remoteEndScreenshare(props.parentUid)
  //           }
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
    screenshareRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setPos({
        top: py + h - 20,
        left: _px + 50,
      });
    });
    setActionMenuVisible((state) => !state);
  };
  return (
    <>
      {/* {renderActionMenu()} */}
      <UserActionMenuOptionsOptions
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        handleClose={() => {}}
        isMobile={false}
        modalPosition={pos}
        updateActionSheet={() => {}}
        user={props.user}
      />
      <PlatformWrapper showModal={showModal} setIsHovered={setIsHovered}>
        <View style={styles.container} ref={screenshareRef}>
          <View style={styles.userInfoContainer}>
            <View style={styles.bgContainerStyle}>
              <UserAvatar
                name={props.user.name}
                containerStyle={styles.containerStyle}
                textStyle={styles.textStyle}
              />
            </View>
            <View style={{alignSelf: 'center'}}>
              <Text style={styles.participantNameText}>{props.user.name}</Text>
            </View>
          </View>
          {true ? (
            <View style={styles.iconContainer}>
              {isHovered || actionMenuVisible || !isWebInternal() ? (
                //todo mobile by default it should show
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
                <></>
              )}
            </View>
          ) : (
            <></>
          )}
        </View>
      </PlatformWrapper>
    </>
  );
};
export default ScreenshareParticipants;

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
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  containerStyle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  textStyle: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 10,
    fontWeight: '400',
    color: $config.CARD_LAYER_1_COLOR,
  },
  participantNameText: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
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
