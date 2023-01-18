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
import {UidType} from '../../agora-rn-uikit';
import useRemoteMute, {MUTE_REMOTE_TYPE} from '../utils/useRemoteMute';
import IconButton from '../atoms/IconButton';
import RemoteMutePopup from './RemoteMutePopup';
import {useRender} from 'customization-api';
/**
 * Component to mute / unmute remote video.
 * Sends a control message to another user over RTM if the local user is a host.
 * If the local user is not a host, it simply renders an image
 */
export interface RemoteVideoMuteProps {
  uid: UidType;
  video: boolean;
  isHost: boolean;
  userContainerRef: any;
}
const RemoteVideoMute = (props: RemoteVideoMuteProps) => {
  const {isHost = false, userContainerRef} = props;
  const muteRemoteVideo = useRemoteMute();
  const [showModal, setShowModal] = useState(false);
  const [pos, setPos] = useState({top: 0, left: 0});
  const {renderList} = useRender();
  const onPress = () => {
    muteRemoteVideo(MUTE_REMOTE_TYPE.video, props.uid);
    setShowModal(false);
  };
  return String(props.uid)[0] !== '1' ? (
    <>
      <RemoteMutePopup
        type="video"
        actionMenuVisible={showModal}
        setActionMenuVisible={setShowModal}
        name={renderList[props.uid]?.name}
        modalPosition={{top: pos.top - 15, left: pos.left + 23}}
        onMutePress={onPress}
      />
      <IconButton
        hoverEffect={props.video}
        hoverEffectStyle={{
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 20,
        }}
        disabled={!isHost || !props.video}
        onPress={() => {
          userContainerRef?.current?.measure((_fx, _fy, _w, h, _px, py) => {
            setPos({
              top: py + h,
              left: _px,
            });
            setShowModal(true);
          });
        }}
        iconProps={{
          iconContainerStyle: {padding: 8},
          name: props?.video ? 'video-on' : 'video-off',
          iconSize: 20,
          iconType: 'plain',
          tintColor: props.video
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.SEMANTIC_NETRUAL,
        }}
      />
    </>
  ) : (
    <></>
  );
};

export default RemoteVideoMute;
