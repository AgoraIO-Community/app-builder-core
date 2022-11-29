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
import {ToggleState, PermissionState} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {useLocalUserInfo} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
/**
 * A component to mute / unmute the local video
 */
export interface LocalVideoMuteProps {
  hideLabel?: boolean;
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
}

function LocalVideoMute(props: LocalVideoMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  //commented for v1 release
  //const videoLabel = useString('toggleVideoButton')();

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.video);
  };
  const isVideoEnabled = local.video === ToggleState.enabled;

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY;
  const videoLabel = permissionDenied
    ? 'Video'
    : isVideoEnabled
    ? 'Video On'
    : 'Video Off';
  let iconProps: IconButtonProps['iconProps'] = {
    name: permissionDenied
      ? 'no-cam'
      : isVideoEnabled
      ? 'video-on'
      : 'video-off',
  };
  if (!permissionDenied) {
    iconProps.tintColor = isVideoEnabled ? $config.PRIMARY_COLOR : '#FF414D';
  }
  let iconButtonProps: IconButtonProps = {
    onPress,
    iconProps,
    disabled: permissionDenied ? true : false,
  };

  iconButtonProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: permissionDenied
      ? '#8F8F8F'
      : isVideoEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D',
  };
  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = props.hideLabel ? '' : videoLabel;

  return props?.render ? (
    props.render(onPress, isVideoEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalVideoMute;
