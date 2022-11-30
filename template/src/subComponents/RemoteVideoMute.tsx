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
import {StyleSheet} from 'react-native';
import {UidType} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../utils/useRemoteMute';
import IconButton from '../atoms/IconButton';

/**
 * Component to mute / unmute remote video.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
export interface RemoteVideoMuteProps {
  uid: UidType;
  video: boolean;
  isHost: boolean;
}
const RemoteVideoMute = (props: RemoteVideoMuteProps) => {
  const {isHost = false} = props;
  const muteRemoteVideo = useRemoteMute();

  return String(props.uid)[0] !== '1' ? (
    <IconButton
      disabled={!isHost || !props.video}
      onPress={() => {
        muteRemoteVideo(MUTE_REMOTE_TYPE.video, props.uid);
      }}
      style={Styles.localButtonSmall as Object}
      iconProps={{
        name: 'video-on',
        iconSize: 'medium',
        tintColor: props.video ? $config.PRIMARY_COLOR : '#999999',
      }}
    />
  ) : (
    <></>
  );
};

export default RemoteVideoMute;
