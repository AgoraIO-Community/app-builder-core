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
import {BtnTemplate, UidType} from '../../agora-rn-uikit';
import useIsPSTN from '../utils/useIsPSTN';
import useMutePSTN from '../utils/useMutePSTN';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../utils/useRemoteMute';

export interface RemoteAudioMuteProps {
  uid: UidType;
  audio: boolean;
  isHost: boolean;
}
/**
 * Component to mute / unmute remote audio.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
const RemoteAudioMute = (props: RemoteAudioMuteProps) => {
  const {isHost = false} = props;
  const muteRemoteAudio = useRemoteMute();

  const isPSTN = useIsPSTN();
  const mutePSTN = useMutePSTN();
  return (
    <BtnTemplate
      disabled={!isHost}
      onPress={() => {
        if (isPSTN(props.uid)) {
          try {
            mutePSTN(props.uid);
          } catch (error) {
            console.error('An error occurred while muting the PSTN user.');
          }
        } else {
          muteRemoteAudio(MUTE_REMOTE_TYPE.audio, props.uid);
        }
      }}
      style={style.buttonIconMic}
      name={props.audio ? 'mic' : 'micOff'}
    />
  );
};

const style = StyleSheet.create({
  buttonIconMic: {
    width: 25,
    height: 24,
  },
});

export default RemoteAudioMute;
