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
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  render?: (onPress: () => void, isAudioEnabled: boolean) => JSX.Element;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  //commented for v1 release
  //const audioLabel = useString('toggleAudioButton')();

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.audio);
  };
  const isAudioEnabled = local.audio === ToggleState.enabled;

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY;

  const audioLabel = permissionDenied
    ? 'Mic'
    : isAudioEnabled
    ? 'Mic On'
    : 'Mic Off';

  let iconProps: IconButtonProps['iconProps'] = {
    name: permissionDenied ? 'noMic' : isAudioEnabled ? 'micOn' : 'micOff',
  };
  if (!permissionDenied) {
    iconProps.tintColor = isAudioEnabled ? $config.PRIMARY_COLOR : '#FF414D';
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
      : isAudioEnabled
      ? $config.PRIMARY_COLOR
      : '#FF414D',
  };

  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = audioLabel;

  return props?.render ? (
    props.render(onPress, isAudioEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalAudioMute;
