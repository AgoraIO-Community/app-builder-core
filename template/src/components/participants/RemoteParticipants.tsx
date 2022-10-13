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
import React from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {ApprovedLiveStreamControlsView} from '../../subComponents/livestream';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from './ParticipantName';
import {RenderInterface} from '../../../agora-rn-uikit';
import UserAvatar from '../../atoms/UserAvatar';
import {isWeb} from '../../utils/common';

interface remoteParticipantsInterface {
  p_styles: any;
  name: string;
  user: RenderInterface;
  showControls: boolean;
  isHost: boolean;
}

const RemoteParticipants = (props: remoteParticipantsInterface) => {
  const {p_styles, user, name, showControls, isHost} = props;
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

  return (
    <PlatformWrapper>
      <View
        style={[
          p_styles.participantRow,
          {paddingHorizontal: 12, marginBottom: 0, paddingVertical: 8},
        ]}>
        <View style={styles.nameContainer}>
          <UserAvatar
            name={name}
            containerStyle={containerStyle}
            textStyle={textStyle}
          />
          <View>
            <ParticipantName value={name} />
            {isHost && <Text style={styles.subText}>Host</Text>}
          </View>
        </View>

        {showControls ? (
          <View style={p_styles.participantActionContainer}>
            {$config.EVENT_MODE && (
              <ApprovedLiveStreamControlsView
                p_styles={p_styles}
                uid={user.uid}
              />
            )}
            {/* TODO: move this to popup on click of name */}
            {/* <View style={[p_styles.actionBtnIcon, {marginRight: 10}]}>
            <RemoteEndCall uid={user.uid} isHost={isHost} />
          </View> */}
            {!$config.AUDIO_ROOM && (
              <View style={[p_styles.actionBtnIcon, {marginRight: 16}]}>
                <RemoteVideoMute
                  uid={user.uid}
                  video={user.video}
                  isHost={isHost}
                />
              </View>
            )}
            <View style={[p_styles.actionBtnIcon]}>
              <RemoteAudioMute
                uid={user.uid}
                audio={user.audio}
                isHost={isHost}
              />
            </View>
          </View>
        ) : (
          <></>
          // <View style={p_styles.dummyView}>
          //   <Text>Remote screen sharing</Text>
          // </View>
        )}
      </View>
    </PlatformWrapper>
  );
};
export default RemoteParticipants;

const PlatformWrapper = ({children}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return isWeb ? (
    <div
      style={{
        marginLeft: 8,
        marginRight: 8,
        borderRadius: 12,
        backgroundColor: isHovered ? $config.PRIMARY_COLOR + '10' : 'inherit',
        cursor: isHovered ? 'pointer' : 'auto',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onClick={() => {
        //TODO: open modal for actions - web
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    <Pressable
      onPress={() => {
        //TODO: open modal for actions - mobile
      }}>
      <View style={styles.remoteContainer}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  remoteContainer: {
    marginHorizontal: 8,
    borderRadius: 12,
  },
  subText: {
    fontSize: 12,
    lineHeight: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    color: '#858585',
    marginTop: 4,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
