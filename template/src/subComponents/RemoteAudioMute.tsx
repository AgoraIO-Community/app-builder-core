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
import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {UidType} from '../../agora-rn-uikit';
import useIsPSTN from '../utils/useIsPSTN';
import useMutePSTN from '../utils/useMutePSTN';
import Styles from '../components/styles';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../utils/useRemoteMute';
import IconButton from '../atoms/IconButton';
import RemoteMutePopup from './RemoteMutePopup';
import {useRender} from 'customization-api';

export interface RemoteAudioMuteProps {
  uid: UidType;
  audio: boolean;
  isHost: boolean;
  userContainerRef: any;
}
/**
 * Component to mute / unmute remote audio.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
const RemoteAudioMute = (props: RemoteAudioMuteProps) => {
  const {isHost = false, userContainerRef} = props;
  const muteRemoteAudio = useRemoteMute();
  const [showModal, setShowModal] = useState(false);
  const [pos, setPos] = useState({top: 0, left: 0});
  const {renderList} = useRender();
  const isPSTN = useIsPSTN();
  const mutePSTN = useMutePSTN();
  const onPress = () => {
    if (isPSTN(props.uid)) {
      try {
        mutePSTN(props.uid);
      } catch (error) {
        console.error('An error occurred while muting the PSTN user.');
      }
    } else {
      muteRemoteAudio(MUTE_REMOTE_TYPE.audio, props.uid);
    }
    setShowModal(false);
  };
  return (
    <>
      <RemoteMutePopup
        type="audio"
        actionMenuVisible={showModal}
        setActionMenuVisible={setShowModal}
        name={renderList[props.uid]?.name}
        modalPosition={{top: pos.top - 15, left: pos.left + 23}}
        onMutePress={onPress}
      />
      <IconButton
        disabled={!isHost || !props.audio}
        onPress={() => {
          userContainerRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
            setPos({
              top: py + h,
              left: _px,
            });
          });
          setShowModal(true);
        }}
        hoverEffect={props.audio}
        hoverEffectStyle={{
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 20,
        }}
        iconProps={{
          iconContainerStyle: {padding: 8},
          iconSize: 20,
          iconType: 'plain',
          name: props.audio ? 'mic-on' : 'mic-off',
          tintColor: props.audio
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.SEMANTIC_NETRUAL,
        }}
      />
    </>
  );
};

export default RemoteAudioMute;
